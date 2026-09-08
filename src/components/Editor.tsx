'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Adjustments, Caption, Clip, Format, Piece } from './project';
import {
  ASPECTS,
  DEFAULT_ADJUSTMENTS,
  DEFAULT_CAPTION,
  DEFAULT_FORMAT,
  cssFilter,
  editedDuration,
  enabledPieces,
  fileSize,
  movePiece,
  newId,
  removeClip,
  removePiece,
  splitAt,
  timecode,
  totalSourceDuration,
} from './project';
import type { Content } from './content';
import { Timeline } from './Timeline';
import { FormatPanel } from './FormatPanel';
import { AdjustPanel } from './AdjustPanel';
import { download, render, renderAvailable } from './render';

/*
 * The editor — the owner of the whole editing session.
 *
 * Footage lives behind blob URLs created from the files the user picked. There
 * is no upload and no save: closing the tab ends the session, and the interface
 * says so rather than pretending something survives.
 *
 * Several clips can be loaded at once. Each one gets its own player, all of
 * them mounted so the render can reach any clip, and only the previewed one is
 * visible.
 */
export function Editor({ content }: { content: Content }) {
  const [clips, setClips] = useState<Clip[]>([]);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [adjustments, setAdjustments] = useState<Adjustments>({ ...DEFAULT_ADJUSTMENTS });
  const [caption, setCaption] = useState<Caption>({ ...DEFAULT_CAPTION });
  const [format, setFormat] = useState<Format>({ ...DEFAULT_FORMAT });
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<{ blob: Blob; extension: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [canRender, setCanRender] = useState(true);

  /* One player per clip, so the render can seek any of them. */
  const players = useRef(new Map<string, HTMLVideoElement>());
  const fileInput = useRef<HTMLInputElement>(null);
  const stopped = useRef(false);

  useEffect(() => setCanRender(renderAvailable()), []);

  const activeClip = clips.find((clip) => clip.id === activeClipId) ?? null;
  const activePlayer = () => (activeClipId ? players.current.get(activeClipId) ?? null : null);

  /* Blob URLs have to be released, or the footage stays in the tab's memory. */
  useEffect(() => {
    const urls = clips.map((clip) => clip.url);
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
    // Only on unmount: revoking on every change would kill the loaded clips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    setError('');
    setResult(null);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('video/')) continue;
      const clip: Clip = {
        id: newId(),
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        duration: 0,
        width: 0,
        height: 0,
      };
      setClips((current) => [...current, clip]);
      setActiveClipId((current) => current ?? clip.id);
    }
  }, []);

  /*
   * Duration and dimensions are only known once the browser has read the file,
   * so the clip is completed here and its first piece created.
   */
  function onLoaded(clipId: string, element: HTMLVideoElement) {
    if (!Number.isFinite(element.duration)) return;
    setClips((current) =>
      current.map((clip) =>
        clip.id === clipId
          ? { ...clip, duration: element.duration, width: element.videoWidth, height: element.videoHeight }
          : clip,
      ),
    );
    setPieces((current) =>
      current.some((piece) => piece.clipId === clipId)
        ? current
        : [...current, { id: newId(), clipId, from: 0, to: element.duration, enabled: true }],
    );
  }

  const seek = useCallback((seconds: number) => {
    const element = activePlayer();
    if (!element) return;
    const target = Math.max(0, Math.min(seconds, element.duration || 0));
    element.currentTime = target;
    setPosition(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClipId]);

  const togglePlay = useCallback(() => {
    const element = activePlayer();
    if (!element) return;
    if (element.paused) {
      void element.play();
      setPlaying(true);
    } else {
      element.pause();
      setPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClipId]);

  /* Space and arrows work only when focus is outside a field, so a space can
     still be typed into the caption. */
  useEffect(() => {
    if (!clips.length) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (event.key === ' ') {
        event.preventDefault();
        togglePlay();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        seek((activePlayer()?.currentTime ?? 0) - 1 / 25);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        seek((activePlayer()?.currentTime ?? 0) + 1 / 25);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clips.length, seek, togglePlay]);

  function dropClip(clipId: string) {
    setPieces((current) => removeClip(current, clipId));
    setClips((current) => {
      const gone = current.find((clip) => clip.id === clipId);
      if (gone) URL.revokeObjectURL(gone.url);
      const left = current.filter((clip) => clip.id !== clipId);
      setActiveClipId((active) => (active === clipId ? (left[0]?.id ?? null) : active));
      return left;
    });
    players.current.delete(clipId);
    setResult(null);
  }

  async function startRender() {
    stopped.current = false;
    setResult(null);
    setError('');
    setProgress({ done: 0, total: editedDuration(pieces, 1) });
    setPlaying(false);
    for (const player of players.current.values()) player.pause();

    try {
      const rendered = await render({
        videos: players.current,
        clips,
        pieces,
        adjustments,
        caption,
        format,
        onProgress: (p) => setProgress({ done: p.doneSeconds, total: p.totalSeconds }),
        cancelled: () => stopped.current,
      });
      setResult(rendered);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setProgress(null);
    }
  }

  const e = content.editor;
  const toRender = enabledPieces(pieces);
  const secondary =
    'rounded-lg border border-edge px-3 py-2 text-sm font-medium text-text transition-colors hover:border-lime hover:text-lime';

  const sourceRatio = activeClip && activeClip.width > 0 ? activeClip.width / activeClip.height : 16 / 9;
  const previewRatio = ASPECTS.find((entry) => entry.id === format.aspect)?.ratio ?? sourceRatio;

  const fileField = (
    <input
      ref={fileInput}
      type="file"
      accept="video/*"
      multiple
      className="sr-only"
      aria-label={e.load.button}
      onChange={(event) => {
        if (event.target.files) addFiles(event.target.files);
        event.target.value = '';
      }}
    />
  );

  return (
    <section id="editor" className="scroll-mt-20 border-t border-edge bg-panel/40 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="mb-8 max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{e.title}</h2>
          <p className="mt-3 text-text-3">{e.intro}</p>
        </header>

        {clips.length === 0 ? (
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              if (event.dataTransfer.files) addFiles(event.dataTransfer.files);
            }}
            className={`rounded-2xl border-2 border-dashed p-10 text-center transition-colors sm:p-16 ${
              dragOver ? 'border-lime bg-lime-soft' : 'border-edge bg-panel'
            }`}
          >
            <h3 className="font-display text-xl font-bold text-text">{e.load.heading}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-3">{e.load.body}</p>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="mt-6 rounded-lg bg-lime px-6 py-3 text-sm font-semibold text-base transition-colors hover:bg-lime-2"
            >
              {e.load.button}
            </button>
            <p className="mt-3 text-xs text-text-4">{e.load.formats}</p>
            {fileField}
          </div>
        ) : (
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0">
              <div className="overflow-hidden rounded-xl border border-edge bg-panel">
                {/* The stage stays black in both themes — footage is judged on black. */}
                <div className="flex justify-center bg-black p-3">
                  <div
                    className="relative max-h-[62vh] max-w-full overflow-hidden bg-black"
                    style={{ aspectRatio: String(previewRatio) }}
                  >
                    {clips.map((clip) => (
                      <video
                        key={clip.id}
                        ref={(element) => {
                          if (element) players.current.set(clip.id, element);
                          else players.current.delete(clip.id);
                        }}
                        src={clip.url}
                        onLoadedMetadata={(event) => onLoaded(clip.id, event.currentTarget)}
                        onTimeUpdate={(event) => {
                          if (clip.id === activeClipId) setPosition(event.currentTarget.currentTime);
                        }}
                        onPlay={() => clip.id === activeClipId && setPlaying(true)}
                        onPause={() => clip.id === activeClipId && setPlaying(false)}
                        onError={() => setError(e.load.formatError)}
                        style={{ filter: cssFilter(adjustments) }}
                        /* Every clip stays mounted so the render can reach it;
                           only the previewed one is shown. */
                        className={`size-full object-cover ${clip.id === activeClipId ? '' : 'hidden'}`}
                        playsInline
                      />
                    ))}

                    {caption.text.trim() && (
                      <p
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-x-0 px-4 text-center font-semibold text-white ${
                          caption.position === 'top' ? 'top-[7%]' : 'bottom-[7%]'
                        } ${
                          caption.style === 'bar'
                            ? '[&>span]:bg-black/75 [&>span]:px-2 [&>span]:py-1'
                            : caption.style === 'outline'
                              ? '[paint-order:stroke] [-webkit-text-stroke:4px_rgba(10,12,17,0.9)]'
                              : '[text-shadow:0_2px_8px_rgba(0,0,0,0.8)]'
                        }`}
                        style={{ fontSize: `${caption.size * 100}cqh` }}
                      >
                        <span>{caption.text}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-edge p-3">
                  <button type="button" onClick={togglePlay} className="rounded-lg bg-lime px-4 py-2 text-sm font-semibold text-base transition-colors hover:bg-lime-2">
                    {playing ? e.transport.pause : e.transport.play}
                  </button>
                  <button type="button" onClick={() => seek(0)} className={secondary}>
                    {e.transport.toStart}
                  </button>
                  <button type="button" onClick={() => seek(position - 1 / 25)} className={secondary}>
                    {e.transport.prevFrame}
                  </button>
                  <button type="button" onClick={() => seek(position + 1 / 25)} className={secondary}>
                    {e.transport.nextFrame}
                  </button>
                  <span className="ml-auto text-sm tabular-nums text-text-3">
                    {timecode(position)} / {timecode(activeClip?.duration ?? 0)}
                  </span>
                </div>
              </div>

              <div className="mt-5 min-w-0 rounded-xl border border-edge bg-panel p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-text-3">{e.timeline.title}</h3>
                    <p className="mt-0.5 text-xs text-text-4">{e.timeline.body}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label htmlFor="timeline-zoom" className="text-xs text-text-4">
                      {e.timeline.zoom}
                    </label>
                    <input
                      id="timeline-zoom"
                      type="range"
                      min={1}
                      max={4}
                      step={0.5}
                      value={zoom}
                      aria-valuetext={`${zoom}×`}
                      onChange={(event) => setZoom(Number(event.target.value))}
                      className="rc-slider w-24"
                    />
                    <button
                      type="button"
                      onClick={() => activeClipId && setPieces((current) => splitAt(current, position, activeClipId))}
                      className="rounded-lg bg-cut px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cut-2"
                    >
                      {e.timeline.split}
                    </button>
                  </div>
                </div>

                <Timeline
                  pieces={pieces}
                  clips={clips}
                  activeClipId={activeClipId}
                  duration={activeClip?.duration ?? 0}
                  position={position}
                  zoom={zoom}
                  content={content}
                  onSeek={seek}
                  onToggle={(id) =>
                    setPieces((current) =>
                      current.map((piece) => (piece.id === id ? { ...piece, enabled: !piece.enabled } : piece)),
                    )
                  }
                  onMove={(index, direction) => setPieces((current) => movePiece(current, index, direction))}
                  onDelete={(id) => setPieces((current) => removePiece(current, id))}
                  onSelectClip={(clipId) => setActiveClipId(clipId)}
                />

                <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="text-text-4">{e.clips.totalLength}:</dt>
                    <dd className="tabular-nums text-text">{timecode(totalSourceDuration(clips))}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-text-4">{e.timeline.editedLength}:</dt>
                    <dd className="tabular-nums text-lime">{timecode(editedDuration(pieces, adjustments.speed))}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-text-4">{e.clips.count}:</dt>
                    <dd className="tabular-nums text-text">{clips.length}</dd>
                  </div>
                </dl>

                {toRender.length === 0 && <p className="mt-3 text-sm text-cut">{e.timeline.empty}</p>}
              </div>
            </div>

            <div className="min-w-0 space-y-5">
              {/* Loaded clips */}
              <div className="rounded-xl border border-edge bg-panel p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-text-3">{e.clips.title}</h3>
                  <button type="button" onClick={() => fileInput.current?.click()} className="rounded-lg border border-lime px-2.5 py-1 text-xs font-semibold text-lime transition-colors hover:bg-lime-soft">
                    + {e.clips.add}
                  </button>
                </div>
                {fileField}

                <ul className="space-y-2">
                  {clips.map((clip, index) => (
                    <li
                      key={clip.id}
                      className={`flex items-center gap-2 rounded-lg border p-2 ${
                        clip.id === activeClipId ? 'border-lime bg-lime-soft' : 'border-edge'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setActiveClipId(clip.id);
                          setPosition(0);
                        }}
                        className="min-w-0 flex-1 text-left"
                        aria-pressed={clip.id === activeClipId}
                      >
                        <span className="block truncate text-xs font-medium text-text">
                          #{index + 1} {clip.name}
                        </span>
                        <span className="block text-[11px] tabular-nums text-text-4">
                          {timecode(clip.duration)} · {fileSize(clip.size)}
                          {clip.width > 0 && ` · ${clip.width}×${clip.height}`}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => dropClip(clip.id)}
                        className="shrink-0 rounded border border-edge px-1.5 py-1 text-[11px] text-text-3 transition-colors hover:border-cut hover:text-cut"
                      >
                        <span aria-hidden="true">✕</span>
                        <span className="sr-only">{e.clips.remove}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-edge bg-panel p-4">
                <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-text-3">{e.format.title}</h3>
                <FormatPanel
                  format={format}
                  sourceWidth={activeClip?.width ?? 0}
                  sourceHeight={activeClip?.height ?? 0}
                  content={content}
                  onChange={setFormat}
                />
              </div>

              <div className="rounded-xl border border-edge bg-panel p-4">
                <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-text-3">{e.adjust.title}</h3>
                <AdjustPanel
                  adjustments={adjustments}
                  caption={caption}
                  content={content}
                  onAdjustments={setAdjustments}
                  onCaption={setCaption}
                />
              </div>

              <div className="rounded-xl border border-edge bg-panel p-4">
                <h3 className="mb-1 font-display text-sm font-bold uppercase tracking-wider text-text-3">{e.render.title}</h3>
                <p className="mb-3 text-xs text-text-4">{e.render.body}</p>

                {!canRender ? (
                  <p className="text-sm text-cut">{e.render.unavailable}</p>
                ) : progress ? (
                  <div>
                    <p className="mb-2 text-sm text-text">{e.render.working}</p>
                    <div
                      role="progressbar"
                      aria-label={e.render.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(progress.total > 0 ? (progress.done / progress.total) * 100 : 0)}
                      className="h-2 overflow-hidden rounded-full bg-edge"
                    >
                      <div
                        className="h-full bg-lime transition-[width]"
                        style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs tabular-nums text-text-4">
                      {timecode(progress.done)} / {timecode(progress.total)}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        stopped.current = true;
                      }}
                      className="mt-3 w-full rounded-lg border border-edge px-3 py-2 text-sm font-medium text-text-3 hover:border-cut hover:text-cut"
                    >
                      {e.render.stop}
                    </button>
                  </div>
                ) : result ? (
                  <div>
                    <p className="text-sm font-medium text-lime">
                      {e.render.done} — {fileSize(result.blob.size)}
                    </p>
                    <button
                      type="button"
                      onClick={() => download(result.blob, clips[0]?.name ?? 'reelcut', result.extension)}
                      className="mt-3 w-full rounded-lg bg-lime px-4 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-lime-2"
                    >
                      {e.render.download}
                    </button>
                    <button type="button" onClick={() => setResult(null)} className={`mt-2 w-full ${secondary}`}>
                      {e.render.button}
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={startRender}
                      disabled={toRender.length === 0}
                      className="w-full rounded-lg bg-cut px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cut-2 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {e.render.button}
                    </button>
                    <p className="mt-2 text-xs leading-relaxed text-text-4">{e.render.timeWarning}</p>
                  </>
                )}

                {error && (
                  <p role="alert" className="mt-3 text-sm text-cut">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
