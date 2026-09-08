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

import type { Adjustments, Caption, Clip, Format, Piece } from './project';
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

/*
 * Audio for a multi-clip render.
 *
 * MediaRecorder takes its tracks when recording starts, so swapping a track
 * per clip mid-render is not an option. Instead every player is routed through
 * one AudioContext into a single destination, and the recorder gets that.
 *
 * createMediaElementSource can only be called once per element and it takes
 * the audio away from the speakers, so the nodes are cached and also connected
 * to the normal output - otherwise the preview would fall silent after the
 * first render.
 */
type AudioRig = {
  context: AudioContext;
  destination: MediaStreamAudioDestinationNode;
  sources: WeakMap<HTMLVideoElement, MediaElementAudioSourceNode>;
};

let audioRig: AudioRig | null = null;

function mixerFor(videos: HTMLVideoElement[]): MediaStreamAudioDestinationNode | null {
  try {
    if (!audioRig) {
      const context = new AudioContext();
      audioRig = { context, destination: context.createMediaStreamDestination(), sources: new WeakMap() };
    }
    const rig = audioRig;
    void rig.context.resume();

    for (const video of videos) {
      if (rig.sources.has(video)) continue;
      const source = rig.context.createMediaElementSource(video);
      source.connect(rig.destination);
      source.connect(rig.context.destination);
      rig.sources.set(video, source);
    }
    return rig.destination;
  } catch {
    // No Web Audio (or an element already wired elsewhere): render stays silent.
    return null;
  }
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
  /** One player per loaded clip, keyed by clip id. */
  videos: Map<string, HTMLVideoElement>;
  clips: Clip[];
  pieces: Piece[];
  adjustments: Adjustments;
  caption: Caption;
  format: Format;
  onProgress?: (progress: RenderProgress) => void;
  cancelled?: () => boolean;
}): Promise<RenderResult> {
  const { videos, clips, pieces, adjustments, caption, format, onProgress, cancelled } = options;

  const container = pickFormat();
  if (!container) throw new Error('This browser cannot record any of the supported formats.');

  const toRender = enabledPieces(pieces).filter((piece) => videos.has(piece.clipId));
  if (toRender.length === 0) throw new Error('There are no pieces to render.');

  /*
   * The output shape comes from the first clip on the timeline. Every other
   * clip is cropped into that same frame, so a mixed-orientation timeline
   * still produces one consistent file rather than a jumping picture.
   */
  const first = clips.find((clip) => clip.id === toRender[0].clipId);
  const sourceWidth = first?.width || 1280;
  const sourceHeight = first?.height || 720;
  const { width, height } = outputSize(format, sourceWidth, sourceHeight);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create a 2D context.');

  const players = [...videos.values()];
  const canvasStream = canvas.captureStream(30);

  if (!adjustments.muted) {
    const mixed = players.length > 1 ? mixerFor(players) : null;
    const tracks = mixed
      ? mixed.stream.getAudioTracks()
      : (sourceStream(players[0])?.getAudioTracks() ?? []);
    for (const track of tracks) canvasStream.addTrack(track);
  }

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

  const before = players.map((player) => ({
    player,
    time: player.currentTime,
    speed: player.playbackRate,
    volume: player.volume,
    muted: player.muted,
  }));

  for (const player of players) {
    player.playbackRate = adjustments.speed;
    player.volume = adjustments.volume;
    player.muted = adjustments.muted;
  }

  recorder.start(250);

  try {
    for (const piece of toRender) {
      if (cancelled?.()) break;

      const video = videos.get(piece.clipId);
      if (!video) continue;

      // Each clip is cropped from its own dimensions into the shared frame.
      const crop = cropRect(video.videoWidth || sourceWidth, video.videoHeight || sourceHeight, width, height);

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
    for (const player of players) player.pause();
    if (recorder.state !== 'inactive') recorder.stop();
    await finished;

    // Put every player back as it was, so the preview keeps working.
    for (const state of before) {
      state.player.playbackRate = state.speed;
      state.player.volume = state.volume;
      state.player.muted = state.muted;
      state.player.currentTime = state.time;
    }
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
