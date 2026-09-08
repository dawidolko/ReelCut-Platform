'use client';

import type { Clip, Piece } from './project';
import { timecode } from './project';
import type { Content } from './content';

/*
 * The timeline.
 *
 * Pieces are drawn proportional to their length, so the width of a block says
 * how much footage it holds. A piece switched off stays visible - otherwise
 * there would be no way to bring it back - while delete removes it for good.
 *
 * With several clips loaded, each one gets its own tint so it is obvious where
 * one recording ends and the next begins.
 */

/* Tints cycle when there are more clips than colours; the border keeps them
   distinguishable even then. */
const CLIP_TINTS = [
  'bg-lime/20 border-lime/40',
  'bg-sky-400/20 border-sky-400/40',
  'bg-fuchsia-400/20 border-fuchsia-400/40',
  'bg-amber-400/20 border-amber-400/40',
];

export function Timeline({
  pieces,
  clips,
  activeClipId,
  duration,
  position,
  zoom,
  content,
  onSeek,
  onToggle,
  onMove,
  onDelete,
  onSelectClip,
}: {
  pieces: Piece[];
  clips: Clip[];
  activeClipId: string | null;
  duration: number;
  position: number;
  zoom: number;
  content: Content;
  onSeek: (seconds: number) => void;
  onToggle: (id: string) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onDelete: (id: string) => void;
  onSelectClip: (clipId: string) => void;
}) {
  const t = content.editor.timeline;

  // Widths are shares of the whole timeline, not of one clip.
  const total = pieces.reduce((sum, piece) => sum + Math.max(0, piece.to - piece.from), 0) || 1;
  const clipIndex = (clipId: string) => Math.max(0, clips.findIndex((clip) => clip.id === clipId));

  const smallButton =
    'rounded bg-base/70 px-1 text-[10px] leading-4 text-text-3 transition-colors hover:text-text disabled:opacity-30';

  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div className="relative" style={{ width: `${zoom * 100}%`, minWidth: '100%' }}>
          <div className="relative flex h-24 overflow-hidden rounded-lg border border-edge bg-panel">
            {pieces.map((piece, index) => {
              const share = Math.max(0, (piece.to - piece.from) / total);
              const tint = CLIP_TINTS[clipIndex(piece.clipId) % CLIP_TINTS.length];
              const clip = clips.find((c) => c.id === piece.clipId);
              return (
                <div
                  key={piece.id}
                  style={{ width: `${share * 100}%` }}
                  className={`group relative flex min-w-[3px] flex-col justify-between border-r border-l border-base last:border-r-0 ${
                    piece.enabled ? tint : 'rc-piece-off bg-panel-2 border-edge'
                  } ${piece.clipId === activeClipId ? 'ring-1 ring-inset ring-lime/50' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectClip(piece.clipId);
                      onSeek(piece.from);
                    }}
                    className="flex-1 px-2 pt-1.5 text-left"
                    title={clip?.name}
                  >
                    <span className="block truncate text-[11px] font-medium text-text">
                      {t.piece} {index + 1}
                    </span>
                    <span className="block truncate text-[10px] tabular-nums text-text-4">
                      {timecode(piece.to - piece.from)}
                    </span>
                    {clips.length > 1 && (
                      <span className="block truncate text-[10px] text-text-4">#{clipIndex(piece.clipId) + 1}</span>
                    )}
                  </button>

                  {/* Actions: reachable from the keyboard, not drag-only. */}
                  <div className="flex flex-wrap gap-0.5 px-1 pb-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} className={smallButton}>
                      <span aria-hidden="true">←</span>
                      <span className="sr-only">{t.moveLeft}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onMove(index, 1)}
                      disabled={index === pieces.length - 1}
                      className={smallButton}
                    >
                      <span aria-hidden="true">→</span>
                      <span className="sr-only">{t.moveRight}</span>
                    </button>
                    <button type="button" onClick={() => onToggle(piece.id)} className={smallButton}>
                      <span aria-hidden="true">{piece.enabled ? '◐' : '○'}</span>
                      <span className="sr-only">{piece.enabled ? t.disable : t.restore}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(piece.id)}
                      className="rounded bg-base/70 px-1 text-[10px] leading-4 text-cut transition-colors hover:bg-cut hover:text-white"
                    >
                      <span aria-hidden="true">✕</span>
                      <span className="sr-only">{t.delete}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Playhead: only meaningful within the clip being previewed. */}
            {activeClipId && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 w-[2px] bg-lime"
                style={{ left: `${Math.min(100, (position / Math.max(1, duration)) * 100)}%` }}
              />
            )}
          </div>
        </div>
      </div>

      <label htmlFor="timeline-position" className="sr-only">
        {t.title}
      </label>
      <input
        id="timeline-position"
        type="range"
        min={0}
        max={Math.max(1, duration)}
        step={0.05}
        value={Math.min(position, Math.max(1, duration))}
        aria-valuetext={timecode(position)}
        onChange={(event) => onSeek(Number(event.target.value))}
        className="rc-slider mt-3 w-full"
      />

      <div className="mt-1 flex justify-between text-xs tabular-nums text-text-4">
        <span>{timecode(position)}</span>
        <span>{timecode(duration)}</span>
      </div>
    </div>
  );
}
