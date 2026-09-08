'use client';

import type { Adjustments, Caption, CaptionStyle } from './project';
import { DEFAULT_ADJUSTMENTS } from './project';
import type { Content } from './content';

/*
 * Defined at module level on purpose: a component declared inside another
 * component's body is a new type on every render, so React remounts its
 * subtree - which loses focus mid-drag on a slider.
 */
function Slider({
  id,
  label,
  value,
  min,
  max,
  step = 0.05,
  format,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
        <span className="text-xs tabular-nums text-text-4">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={format(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rc-slider w-full"
      />
    </div>
  );
}

/*
 * Picture, sound and caption.
 *
 * Every slider carries aria-valuetext with a value that means something to a
 * person — a screen reader says "140%", not "1.4".
 */
export function AdjustPanel({
  adjustments,
  caption,
  content,
  onAdjustments,
  onCaption,
}: {
  adjustments: Adjustments;
  caption: Caption;
  content: Content;
  onAdjustments: (update: (previous: Adjustments) => Adjustments) => void;
  onCaption: (update: (previous: Caption) => Caption) => void;
}) {
  const a = content.editor.adjust;

  const percent = (value: number) => `${Math.round(value * 100)}%`;

  return (
    <div className="space-y-4">
      <Slider id="adj-brightness" label={a.brightness} value={adjustments.brightness} min={0.5} max={1.5} format={percent} onChange={(v) => onAdjustments((p) => ({ ...p, brightness: v }))} />
      <Slider id="adj-contrast" label={a.contrast} value={adjustments.contrast} min={0.5} max={1.5} format={percent} onChange={(v) => onAdjustments((p) => ({ ...p, contrast: v }))} />
      <Slider id="adj-saturation" label={a.saturation} value={adjustments.saturation} min={0} max={2} format={percent} onChange={(v) => onAdjustments((p) => ({ ...p, saturation: v }))} />
      <Slider id="adj-speed" label={a.speed} value={adjustments.speed} min={0.5} max={2} step={0.1} format={(v) => `${v.toFixed(1)}×`} onChange={(v) => onAdjustments((p) => ({ ...p, speed: v }))} />
      <Slider id="adj-volume" label={a.volume} value={adjustments.volume} min={0} max={1} format={percent} onChange={(v) => onAdjustments((p) => ({ ...p, volume: v }))} />

      <label className="flex items-center gap-2 text-sm text-text">
        <input
          type="checkbox"
          checked={adjustments.muted}
          onChange={(event) => onAdjustments((p) => ({ ...p, muted: event.target.checked }))}
          className="size-4 rounded border-edge-2 bg-panel text-cut"
        />
        {a.muted}
      </label>

      <fieldset className="rounded-lg border border-edge p-3">
        <legend className="px-1 text-sm font-medium text-text">{a.caption}</legend>
        <div className="space-y-3">
          <div>
            <label htmlFor="caption-text" className="mb-1 block text-xs font-medium text-text-3">
              {a.captionText}
            </label>
            <input
              id="caption-text"
              type="text"
              value={caption.text}
              maxLength={80}
              onChange={(event) => onCaption((p) => ({ ...p, text: event.target.value }))}
              className="w-full rounded-md border border-edge bg-base px-3 py-2 text-sm text-text placeholder:text-text-4"
            />
          </div>

          <div>
            <span className="mb-1 block text-xs font-medium text-text-3">{a.captionStyle}</span>
            <div className="flex gap-2">
              {(['bar', 'outline', 'plain'] as CaptionStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => onCaption((p) => ({ ...p, style }))}
                  aria-pressed={caption.style === style}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                    caption.style === style ? 'border-lime bg-lime-soft text-lime' : 'border-edge text-text-3 hover:border-edge-2 hover:text-text'
                  }`}
                >
                  {a.styles[style]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1 block text-xs font-medium text-text-3">{a.captionPosition}</span>
            <div className="flex gap-2">
              {(['top', 'bottom'] as const).map((position) => (
                <button
                  key={position}
                  type="button"
                  onClick={() => onCaption((p) => ({ ...p, position }))}
                  aria-pressed={caption.position === position}
                  className={`flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                    caption.position === position ? 'border-lime bg-lime-soft text-lime' : 'border-edge text-text-3 hover:border-edge-2 hover:text-text'
                  }`}
                >
                  {position === 'top' ? a.top : a.bottom}
                </button>
              ))}
            </div>
          </div>

          <Slider
            id="caption-size"
            label={a.captionSize}
            value={caption.size}
            min={0.03}
            max={0.1}
            step={0.005}
            format={(v) => `${Math.round(v * 1000) / 10}%`}
            onChange={(v) => onCaption((p) => ({ ...p, size: v }))}
          />
        </div>
      </fieldset>

      <button
        type="button"
        onClick={() => {
          onAdjustments(() => ({ ...DEFAULT_ADJUSTMENTS }));
          onCaption((p) => ({ ...p, text: '' }));
        }}
        className="w-full rounded-lg border border-edge px-3 py-2 text-sm font-medium text-text-3 transition-colors hover:border-cut hover:text-cut"
      >
        {a.reset}
      </button>
    </div>
  );
}
