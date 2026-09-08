'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Adjustments, Caption, Format, Piece } from './project';
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
  splitAt,
  timecode,
} from './project';
import type { Content } from './content';
import { Timeline } from './Timeline';
import { FormatPanel } from './FormatPanel';
import { AdjustPanel } from './AdjustPanel';
import { download, render, renderAvailable } from './render';

/*
 * The editor — the owner of the whole editing session.
 *
 * The footage lives behind a blob URL created from the file the user picked.
 * There is no upload and no save: closing the tab ends the session, and the
 * interface says so rather than pretending something survives.
 */
export function Editor({ content }: { content: Content }) {
  const [source, setSource] = useState<{ url: string; name: string; size: number } | null>(null);
  const [duration, setDuration] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
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

  const video = useRef<HTMLVideoElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const stopped = useRef(false);

  // MediaRecorder is only checked in the browser — the build has no such API.
  useEffect(() => setCanRender(renderAvailable()), []);

  // The blob URL has to be released, or the footage stays in the tab's memory.
  useEffect(() => {
    return () => {
      if (source) URL.revokeObjectURL(source.url);
    };
  }, [source]);

  const loadFile = useCallback(
    (file: File) => {
      setError('');
      setResult(null);
      if (source) URL.revokeObjectURL(source.url);
      setSource({ url: URL.createObjectURL(file), name: file.name, size: file.size });
      setPieces([]);
      setPosition(0);
      setPlaying(false);
    },
    [source],
  );

  function onLoaded() {
    const element = video.current;
    if (!element || !Number.isFinite(element.duration)) return;
    setDuration(element.duration);
    setDimensions({ width: element.videoWidth, height: element.videoHeight });
    setPieces([{ id: newId(), from: 0, to: element.duration, enabled: true }]);
  }

  const seek = useCallback((seconds: number) => {
    const element = video.current;
    if (!element) return;
    const target = Math.max(0, Math.min(seconds, element.duration || 0));
    element.currentTime = target;
    setPosition(target);
  }, []);

  const togglePlay = useCallback(() => {
    const element = video.current;
    if (!element) return;
    if (element.paused) {
      void element.play();
      setPlaying(true);
    } else {
      element.pause();
      setPlaying(false);
    }
  }, []);

  /* Space and arrows work only when focus is outside a field — otherwise a
     space could not be typed into the caption. */
  useEffect(() => {
    if (!source) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (event.key === ' ') {
        event.preventDefault();
        togglePlay();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        seek((video.current?.currentTime ?? 0) - 1 / 25);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        seek((video.current?.currentTime ?? 0) + 1 / 25);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [source, seek, togglePlay]);

  async function startRender() {
    const element = video.current;
    if (!element) return;
    stopped.current = false;
    setResult(null);
    setError('');
    setProgress({ done: 0, total: editedDuration(pieces, 1) });
    setPlaying(false);
    element.pause();

    try {
      const rendered = await render({
        video: element,
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

  // The preview is framed to the chosen aspect, so it crops exactly like the render.
  const sourceRatio = dimensions.width > 0 ? dimensions.width / dimensions.height : 16 / 9;
  const previewRatio = ASPECTS.find((entry) => entry.id === format.aspect)?.ratio ?? sourceRatio;

  return (
    <section id="editor" className="scroll-mt-20 border-t border-edge bg-panel/40 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="mb-8 max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{e.title}</h2>
          <p className="mt-3 text-text-3">{e.intro}</p>
        </header>

        {!source ? (
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              const file = event.dataTransfer.files?.[0];
              if (file) loadFile(file);
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
            <input
              ref={fileInput}
              type="file"
              accept="video/*"
              className="sr-only"
              aria-label={e.load.button}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) loadFile(file);
                event.target.value = '';
              }}
            />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <div className="overflow-hidden rounded-xl border border-edge bg-panel">
                {/* The stage stays black in both themes — footage is judged on black. */}
                <div className="flex justify-center bg-black p-3">
                  <div
                    className="relative max-h-[62vh] overflow-hidden bg-black"
                    style={{ aspectRatio: String(previewRatio) }}
                  >
                    <video
                      ref={video}
                      src={source.url}
                      onLoadedMetadata={onLoaded}
                      onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                      onError={() => setError(e.load.formatError)}
                      style={{ filter: cssFilter(adjustments) }}
                      className="size-full object-cover"
                      playsInline
                    />
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
                    {timecode(position)} / {timecode(duration)}
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-edge bg-panel p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-text-3">{e.timeline.title}</h3>
                    <p className="mt-0.5 text-xs text-text-4">{e.timeline.body}</p>
                  </div>
                  <div className="flex items-center gap-3">
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
                      onClick={() => setPieces((current) => splitAt(current, position))}
                      className="rounded-lg bg-cut px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cut-2"
                    >
                      {e.timeline.split}
                    </button>
                  </div>
                </div>

                <Timeline
                  pieces={pieces}
                  duration={duration}
                  position={position}
                  zoom={zoom}
                  content={content}
                  onSeek={seek}
                  onToggle={(id) =>
                    setPieces((current) => current.map((piece) => (piece.id === id ? { ...piece, enabled: !piece.enabled } : piece)))
                  }
                  onMove={(index, direction) => setPieces((current) => movePiece(current, index, direction))}
                />

                <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="text-text-4">{e.timeline.sourceLength}:</dt>
                    <dd className="tabular-nums text-text">{timecode(duration)}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-text-4">{e.timeline.editedLength}:</dt>
                    <dd className="tabular-nums text-lime">{timecode(editedDuration(pieces, adjustments.speed))}</dd>
                  </div>
                </dl>

                {toRender.length === 0 && <p className="mt-3 text-sm text-cut">{e.timeline.empty}</p>}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-xl border border-edge bg-panel p-4">
                <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-text-3">{e.format.title}</h3>
                <FormatPanel
                  format={format}
                  sourceWidth={dimensions.width}
                  sourceHeight={dimensions.height}
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
                      onClick={() => download(result.blob, source.name, result.extension)}
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

              <p className="px-1 text-xs text-text-4">
                {source.name} · {fileSize(source.size)}
                {dimensions.width > 0 && ` · ${dimensions.width}×${dimensions.height}`}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
