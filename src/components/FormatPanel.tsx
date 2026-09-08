'use client';

import type { AspectId, Format, Resolution } from './project';
import { ASPECTS, RESOLUTIONS, outputSize } from './project';
import type { Content } from './content';

/*
 * Crop and resolution.
 *
 * The little rectangles are drawn to the real aspect ratio, so the choice is
 * visible rather than a word. The resolution names the long edge — a vertical
 * clip at 720 is 720 tall, not wide.
 */
export function FormatPanel({
  format,
  sourceWidth,
  sourceHeight,
  content,
  onChange,
}: {
  format: Format;
  sourceWidth: number;
  sourceHeight: number;
  content: Content;
  onChange: (update: (previous: Format) => Format) => void;
}) {
  const f = content.editor.format;
  const output = outputSize(format, sourceWidth, sourceHeight);
  const sourceRatio = sourceWidth > 0 && sourceHeight > 0 ? sourceWidth / sourceHeight : 16 / 9;

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-text">{f.aspect}</legend>
        <div className="grid grid-cols-5 gap-2">
          {ASPECTS.map((entry) => {
            const ratio = entry.ratio ?? sourceRatio;
            const selected = format.aspect === entry.id;
            // The swatch is the shape itself, capped so a wide clip stays small.
            const width = ratio >= 1 ? 26 : 26 * ratio;
            const height = ratio >= 1 ? 26 / ratio : 26;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onChange((previous) => ({ ...previous, aspect: entry.id as AspectId }))}
                aria-pressed={selected}
                title={f.aspects[entry.id]}
                className={`flex flex-col items-center gap-1.5 rounded-lg border px-1 py-2 transition-colors ${
                  selected ? 'border-lime bg-lime-soft' : 'border-edge hover:border-edge-2'
                }`}
              >
                <span className="grid h-7 place-items-center" aria-hidden="true">
                  <span
                    className={`block rounded-[2px] border-2 ${selected ? 'border-lime' : 'border-text-4'}`}
                    style={{ width, height }}
                  />
                </span>
                <span className={`text-[10px] font-medium ${selected ? 'text-lime' : 'text-text-4'}`}>
                  {entry.id === 'source' ? '=' : entry.id === 'vertical' ? '9:16' : entry.id === 'portrait' ? '4:5' : entry.id === 'square' ? '1:1' : '16:9'}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-text-4">{f.aspects[format.aspect]}</p>
      </fieldset>

      <div>
        <label htmlFor="format-resolution" className="mb-1 block text-sm font-medium text-text">
          {f.resolution}
        </label>
        <div className="flex gap-2">
          {RESOLUTIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange((previous) => ({ ...previous, resolution: value as Resolution }))}
              aria-pressed={format.resolution === value}
              className={`flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                format.resolution === value ? 'border-lime bg-lime-soft text-lime' : 'border-edge text-text-3 hover:border-edge-2 hover:text-text'
              }`}
            >
              {value}p
            </button>
          ))}
        </div>
      </div>

      <p className="rounded-lg border border-edge bg-base px-3 py-2 text-xs text-text-3">
        {f.output}: <span className="font-medium tabular-nums text-text">{output.width}×{output.height}</span>
        {format.aspect !== 'source' && <span className="mt-1 block text-text-4">{f.cropNote}</span>}
      </p>
    </div>
  );
}
