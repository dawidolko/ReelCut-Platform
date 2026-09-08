'use client';

import type { Piece } from './project';
import { timecode } from './project';
import type { Content } from './content';

/*
 * The timeline.
 *
 * Pieces are drawn proportional to their length, so the width of a block says
 * how much footage it holds. A piece switched off stays visible — otherwise
 * there would be no way to bring it back.
 *
 * Zoom widens the rail beyond the container and lets it scroll, which is what
 * makes precise trimming possible on a long clip.
 */
export function Timeline({
  pieces,
  duration,
  position,
  zoom,
  content,
  onSeek,
  onToggle,
  onMove,
}: {
  pieces: Piece[];
  duration: number;
  position: number;
  zoom: number;
  content: Content;
  onSeek: (seconds: number) => void;
  onToggle: (id: string) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  const t = content.editor.timeline;
  const safeDuration = duration > 0 ? duration : 1;

  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div className="relative" style={{ width: `${zoom * 100}%`, minWidth: '100%' }}>
          <div className="relative flex h-20 overflow-hidden rounded-lg border border-edge bg-panel">
            {pieces.map((piece, index) => {
              const share = Math.max(0, (piece.to - piece.from) / safeDuration);
              return (
                <div
                  key={piece.id}
                  style={{ width: `${share * 100}%` }}
                  className={`group relative flex min-w-[3px] flex-col justify-between border-r border-base last:border-r-0 ${
                    piece.enabled ? 'bg-lime/15' : 'rc-piece-off bg-panel-2'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onToggle(piece.id)}
                    aria-pressed={piece.enabled}
                    className="flex-1 px-2 pt-1.5 text-left"
                  >
                    <span className="block truncate text-[11px] font-medium text-text">
                      {t.piece} {index + 1}
                    </span>
                    <span className="block truncate text-[10px] tabular-nums text-text-4">
                      {timecode(piece.to - piece.from)}
                    </span>
                    <span className="sr-only">{piece.enabled ? t.disable : t.restore}</span>
                  </button>

                  {/* Reordering: keyboard-reachable, not a drag-only gesture. */}
                  <div className="flex gap-0.5 px-1 pb-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => onMove(index, -1)}
                      disabled={index === 0}
                      className="rounded bg-base/70 px-1 text-[10px] text-text-3 disabled:opacity-30"
                    >
                      <span aria-hidden="true">←</span>
                      <span className="sr-only">{t.moveLeft}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onMove(index, 1)}
                      disabled={index === pieces.length - 1}
                      className="rounded bg-base/70 px-1 text-[10px] text-text-3 disabled:opacity-30"
                    >
                      <span aria-hidden="true">→</span>
                      <span className="sr-only">{t.moveRight}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Playhead */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-[2px] bg-lime"
              style={{ left: `${Math.min(100, (position / safeDuration) * 100)}%` }}
            />
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
        max={safeDuration}
        step={0.05}
        value={Math.min(position, safeDuration)}
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
