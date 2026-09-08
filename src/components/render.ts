/*
 * Rendering the finished cut.
 *
 * This works without a server and without ffmpeg.wasm: a canvas is captured
 * with captureStream() and MediaRecorder writes it to a WebM file. The threaded
 * build of ffmpeg.wasm needs COOP/COEP headers, which static hosting cannot
 * set, so that route is a dead end here.
 *
 * The price is stated plainly in the interface: the render runs in real time,
 * because the frames genuinely have to pass through the player.
 */

import type { Adjustments, Caption, Format, Piece } from './project';
import { cropRect, cssFilter, enabledPieces, outputSize } from './project';

export type RenderProgress = {
  doneSeconds: number;
  totalSeconds: number;
};

export type RenderResult = {
  blob: Blob;
  extension: string;
};

/** The first container the browser will actually record. */
function pickFormat(): { mimeType: string; extension: string } | null {
  const candidates = [
    { mimeType: 'video/webm;codecs=vp9,opus', extension: 'webm' },
    { mimeType: 'video/webm;codecs=vp8,opus', extension: 'webm' },
    { mimeType: 'video/webm', extension: 'webm' },
    { mimeType: 'video/mp4', extension: 'mp4' },
  ];
  for (const candidate of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(candidate.mimeType)) {
      return candidate;
    }
  }
  return null;
}

export function renderAvailable(): boolean {
  return (
    typeof MediaRecorder !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined' &&
    typeof HTMLCanvasElement.prototype.captureStream === 'function' &&
    pickFormat() !== null
  );
}

/** Seeks and waits until the browser has actually produced the new frame. */
function seek(video: HTMLVideoElement, seconds: number): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      video.removeEventListener('seeked', done);
      resolve();
    };
    video.addEventListener('seeked', done);
    video.currentTime = seconds;
  });
}

/*
 * The audio track comes from the player's own stream. Chrome exposes
 * captureStream(), Firefox mozCaptureStream() — without it the export would be
 * silent.
 */
function sourceStream(video: HTMLVideoElement): MediaStream | null {
  type WithCapture = HTMLVideoElement & {
    captureStream?: () => MediaStream;
    mozCaptureStream?: () => MediaStream;
  };
  const element = video as WithCapture;
  try {
    if (typeof element.captureStream === 'function') return element.captureStream();
    if (typeof element.mozCaptureStream === 'function') return element.mozCaptureStream();
  } catch {
    return null;
  }
  return null;
}

function drawCaption(
  ctx: CanvasRenderingContext2D,
  caption: Caption,
  width: number,
  height: number,
): void {
  const text = caption.text.trim();
  if (!text) return;

  const fontSize = Math.round(height * caption.size);
  ctx.save();
  ctx.filter = 'none';
  ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = caption.position === 'top' ? 'top' : 'bottom';

  const y = caption.position === 'top' ? height * 0.07 : height * 0.93;
  const metrics = ctx.measureText(text);

  if (caption.style === 'bar') {
    // A solid band behind the text: readable over any footage.
    const padX = fontSize * 0.5;
    const padY = fontSize * 0.3;
    const barHeight = fontSize + padY * 2;
    const barY = caption.position === 'top' ? y - padY : y - fontSize - padY;
    ctx.fillStyle = 'rgba(10, 12, 17, 0.78)';
    ctx.fillRect((width - metrics.width) / 2 - padX, barY, metrics.width + padX * 2, barHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, width / 2, y);
  } else if (caption.style === 'outline') {
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2, fontSize * 0.14);
    ctx.strokeStyle = 'rgba(10, 12, 17, 0.9)';
    ctx.strokeText(text, width / 2, y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, width / 2, y);
  } else {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = Math.round(fontSize * 0.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, width / 2, y);
  }

  ctx.restore();
}

export async function render(options: {
  video: HTMLVideoElement;
  pieces: Piece[];
  adjustments: Adjustments;
  caption: Caption;
  format: Format;
  onProgress?: (progress: RenderProgress) => void;
  cancelled?: () => boolean;
}): Promise<RenderResult> {
  const { video, pieces, adjustments, caption, format, onProgress, cancelled } = options;

  const container = pickFormat();
  if (!container) throw new Error('This browser cannot record any of the supported formats.');

  const toRender = enabledPieces(pieces);
  if (toRender.length === 0) throw new Error('There are no pieces to render.');

  const sourceWidth = video.videoWidth || 1280;
  const sourceHeight = video.videoHeight || 720;
  const { width, height } = outputSize(format, sourceWidth, sourceHeight);
  const crop = cropRect(sourceWidth, sourceHeight, width, height);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create a 2D context.');

  const canvasStream = canvas.captureStream(30);
  const playerStream = sourceStream(video);
  const audioTracks = adjustments.muted ? [] : (playerStream?.getAudioTracks() ?? []);
  for (const track of audioTracks) canvasStream.addTrack(track);

  const recorder = new MediaRecorder(canvasStream, { mimeType: container.mimeType });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const finished = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });

  const totalSeconds = toRender.reduce((sum, piece) => sum + Math.max(0, piece.to - piece.from), 0);
  let rendered = 0;

  const before = {
    time: video.currentTime,
    speed: video.playbackRate,
    volume: video.volume,
    muted: video.muted,
  };

  video.playbackRate = adjustments.speed;
  video.volume = adjustments.volume;
  video.muted = adjustments.muted;

  recorder.start(250);

  try {
    for (const piece of toRender) {
      if (cancelled?.()) break;

      await seek(video, piece.from);
      await video.play();

      await new Promise<void>((resolve) => {
        const frame = () => {
          if (cancelled?.() || video.currentTime >= piece.to || video.ended) {
            video.pause();
            resolve();
            return;
          }

          ctx.filter = cssFilter(adjustments);
          ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, height);
          drawCaption(ctx, caption, width, height);

          onProgress?.({
            doneSeconds: rendered + (video.currentTime - piece.from),
            totalSeconds,
          });

          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });

      rendered += Math.max(0, piece.to - piece.from);
      onProgress?.({ doneSeconds: rendered, totalSeconds });
    }
  } finally {
    video.pause();
    if (recorder.state !== 'inactive') recorder.stop();
    await finished;

    // Put the player back as it was, so the preview keeps working.
    video.playbackRate = before.speed;
    video.volume = before.volume;
    video.muted = before.muted;
    video.currentTime = before.time;
  }

  return { blob: new Blob(chunks, { type: container.mimeType }), extension: container.extension };
}

/** Downloads the finished file, named after the source. */
export function download(blob: Blob, sourceName: string, extension: string): void {
  const base = sourceName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]+/g, '-') || 'reelcut';
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${base}-reelcut.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
