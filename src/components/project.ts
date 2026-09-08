/*
 * The editing project model.
 *
 * The source file is never modified — a project only describes which parts of
 * it to keep and how they should look. Undoing a cut therefore restores a
 * number rather than recovering frames.
 */

export type Locale = 'pl' | 'en';

/** A slice of the source footage, in seconds. */
export type Piece = {
  id: string;
  from: number;
  to: number;
  /* A piece switched off stays on the timeline but is left out of the render,
     so changing your mind is one click rather than another cut. */
  enabled: boolean;
};

export type Adjustments = {
  brightness: number; // 0.5 - 1.5
  contrast: number; // 0.5 - 1.5
  saturation: number; // 0 - 2
  speed: number; // 0.5 - 2
  volume: number; // 0 - 1
  muted: boolean;
};

export type CaptionStyle = 'plain' | 'outline' | 'bar';

export type Caption = {
  text: string;
  position: 'top' | 'bottom';
  style: CaptionStyle;
  size: number; // share of frame height
};

/**
 * Output shapes. Short-form platforms want 9:16; the rest are here because a
 * clip rarely gets published in only one place.
 */
export type AspectId = 'source' | 'vertical' | 'portrait' | 'square' | 'wide';

export const ASPECTS: { id: AspectId; ratio: number | null }[] = [
  { id: 'source', ratio: null },
  { id: 'vertical', ratio: 9 / 16 },
  { id: 'portrait', ratio: 4 / 5 },
  { id: 'square', ratio: 1 },
  { id: 'wide', ratio: 16 / 9 },
];

/** Long edge of the exported frame. */
export const RESOLUTIONS = [480, 720, 1080] as const;
export type Resolution = (typeof RESOLUTIONS)[number];

export type Format = {
  aspect: AspectId;
  resolution: Resolution;
};

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
  speed: 1,
  volume: 1,
  muted: false,
};

export const DEFAULT_CAPTION: Caption = { text: '', position: 'bottom', style: 'bar', size: 0.055 };
export const DEFAULT_FORMAT: Format = { aspect: 'source', resolution: 720 };

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** m:ss.d — tenths matter when trimming. */
export function timecode(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00.0';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);
  return `${minutes}:${String(secs).padStart(2, '0')}.${tenths}`;
}

/** The pieces that actually reach the render. */
export function enabledPieces(pieces: Piece[]): Piece[] {
  return pieces.filter((piece) => piece.enabled && piece.to > piece.from);
}

/** Length of the finished cut, with playback speed applied. */
export function editedDuration(pieces: Piece[], speed: number): number {
  const total = enabledPieces(pieces).reduce((sum, piece) => sum + Math.max(0, piece.to - piece.from), 0);
  return speed > 0 ? total / speed : total;
}

/**
 * Splits a piece at the given point. A point outside the piece, or too close
 * to an edge, is ignored rather than creating an empty fragment.
 */
export function splitAt(pieces: Piece[], time: number, minimum = 0.1): Piece[] {
  const result: Piece[] = [];
  for (const piece of pieces) {
    const inside = time > piece.from + minimum && time < piece.to - minimum;
    if (inside) {
      result.push({ id: newId(), from: piece.from, to: time, enabled: piece.enabled });
      result.push({ id: newId(), from: time, to: piece.to, enabled: piece.enabled });
    } else {
      result.push(piece);
    }
  }
  return result;
}

/** Moves a piece one place along the timeline. */
export function movePiece(pieces: Piece[], index: number, direction: -1 | 1): Piece[] {
  const target = index + direction;
  if (target < 0 || target >= pieces.length) return pieces;
  const copy = [...pieces];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

/** The CSS filter string — one source of truth for the preview and the render. */
export function cssFilter(adjustments: Adjustments): string {
  return `brightness(${adjustments.brightness}) contrast(${adjustments.contrast}) saturate(${adjustments.saturation})`;
}

/**
 * Output frame size for a format, given the source dimensions. A centre crop
 * is applied when the target aspect differs from the source.
 */
export function outputSize(
  format: Format,
  sourceWidth: number,
  sourceHeight: number,
): { width: number; height: number } {
  const source = sourceWidth > 0 && sourceHeight > 0 ? sourceWidth / sourceHeight : 16 / 9;
  const ratio = ASPECTS.find((entry) => entry.id === format.aspect)?.ratio ?? source;

  // The resolution names the long edge, so a vertical clip is 720 tall, not wide.
  const long = format.resolution;
  const width = ratio >= 1 ? long : Math.round(long * ratio);
  const height = ratio >= 1 ? Math.round(long / ratio) : long;

  // Even dimensions keep encoders happy.
  return { width: Math.max(2, width - (width % 2)), height: Math.max(2, height - (height % 2)) };
}

/**
 * The centre-crop rectangle to take from the source so it fills the output
 * without distortion.
 */
export function cropRect(
  sourceWidth: number,
  sourceHeight: number,
  outWidth: number,
  outHeight: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = outWidth / outHeight;

  if (sourceRatio > targetRatio) {
    // Source is wider: trim the sides.
    const sw = sourceHeight * targetRatio;
    return { sx: (sourceWidth - sw) / 2, sy: 0, sw, sh: sourceHeight };
  }
  // Source is taller: trim top and bottom.
  const sh = sourceWidth / targetRatio;
  return { sx: 0, sy: (sourceHeight - sh) / 2, sw: sourceWidth, sh };
}

/** File sizes in a form a human reads. */
export function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
