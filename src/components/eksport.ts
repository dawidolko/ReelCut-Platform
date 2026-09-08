/*
 * Renderowanie materialu wynikowego.
 *
 * Eksport dziala bez serwera i bez ffmpeg.wasm: plotno dostaje strumien przez
 * captureStream(), a MediaRecorder zapisuje go do pliku WebM. Ffmpeg w wersji
 * wielowatkowej wymaga naglowkow COOP/COEP, ktorych GitHub Pages nie ustawia,
 * wiec tam ta droga bylaby slepa.
 *
 * Cena tego rozwiazania jest uczciwa i podana wprost w interfejsie: render
 * biegnie w czasie rzeczywistym, bo klatki musza faktycznie przejsc przez
 * odtwarzacz.
 */

import type { Korekty, Napis, Segment } from './model';
import { aktywne, filtrCSS } from './model';

export type PostepEksportu = {
  gotoweSekundy: number;
  wszystkieSekundy: number;
};

export type WynikEksportu = {
  blob: Blob;
  rozszerzenie: string;
};

/** Pierwszy format, ktory przegladarka faktycznie potrafi nagrac. */
function wybierzFormat(): { mimeType: string; rozszerzenie: string } | null {
  const kandydaci = [
    { mimeType: 'video/webm;codecs=vp9,opus', rozszerzenie: 'webm' },
    { mimeType: 'video/webm;codecs=vp8,opus', rozszerzenie: 'webm' },
    { mimeType: 'video/webm', rozszerzenie: 'webm' },
    { mimeType: 'video/mp4', rozszerzenie: 'mp4' },
  ];
  for (const kandydat of kandydaci) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(kandydat.mimeType)) {
      return kandydat;
    }
  }
  return null;
}

export function eksportDostepny(): boolean {
  return (
    typeof MediaRecorder !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined' &&
    typeof HTMLCanvasElement.prototype.captureStream === 'function' &&
    wybierzFormat() !== null
  );
}

/** Przewija material i czeka, az przegladarka faktycznie pokaze nowa klatke. */
function przewin(video: HTMLVideoElement, doSekundy: number): Promise<void> {
  return new Promise((resolve) => {
    const gotowe = () => {
      video.removeEventListener('seeked', gotowe);
      resolve();
    };
    video.addEventListener('seeked', gotowe);
    video.currentTime = doSekundy;
  });
}

/*
 * Sciezka dzwiekowa pochodzi ze strumienia odtwarzacza. Chrome udostepnia
 * captureStream(), Firefox mozCaptureStream() — bez tego eksport wychodzilby
 * niemy.
 */
function strumienZrodla(video: HTMLVideoElement): MediaStream | null {
  type ZeStrumieniem = HTMLVideoElement & {
    captureStream?: () => MediaStream;
    mozCaptureStream?: () => MediaStream;
  };
  const el = video as ZeStrumieniem;
  try {
    if (typeof el.captureStream === 'function') return el.captureStream();
    if (typeof el.mozCaptureStream === 'function') return el.mozCaptureStream();
  } catch {
    return null;
  }
  return null;
}

function rysujNapis(
  ctx: CanvasRenderingContext2D,
  napis: Napis,
  szerokosc: number,
  wysokosc: number,
): void {
  const tekst = napis.tekst.trim();
  if (!tekst) return;

  const rozmiarPisma = Math.round(wysokosc * 0.055);
  ctx.save();
  ctx.filter = 'none';
  ctx.font = `600 ${rozmiarPisma}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = napis.pozycja === 'gora' ? 'top' : 'bottom';

  const y = napis.pozycja === 'gora' ? wysokosc * 0.06 : wysokosc * 0.94;

  // Cien pod tekstem — napis ma byc czytelny takze na jasnym kadrze.
  ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
  ctx.shadowBlur = Math.round(rozmiarPisma * 0.5);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(tekst, szerokosc / 2, y);
  ctx.restore();
}

export async function renderuj(opcje: {
  video: HTMLVideoElement;
  segmenty: Segment[];
  korekty: Korekty;
  napis: Napis;
  maksSzerokosc?: number;
  onPostep?: (postep: PostepEksportu) => void;
  przerwij?: () => boolean;
}): Promise<WynikEksportu> {
  const { video, segmenty, korekty, napis, onPostep, przerwij } = opcje;

  const format = wybierzFormat();
  if (!format) throw new Error('Przegladarka nie potrafi nagrac zadnego z obslugiwanych formatow.');

  // Do renderu ida wylacznie fragmenty wlaczone na osi.
  const doRenderu = aktywne(segmenty);
  if (doRenderu.length === 0) throw new Error('Brak fragmentow do wyrenderowania.');

  // Wieksze materialy skalujemy w dol — inaczej render w czasie rzeczywistym
  // gubi klatki na slabszym sprzecie.
  const maksSzerokosc = opcje.maksSzerokosc ?? 1280;
  const skala = Math.min(1, maksSzerokosc / (video.videoWidth || maksSzerokosc));
  const szerokosc = Math.max(2, Math.round((video.videoWidth || 1280) * skala));
  const wysokosc = Math.max(2, Math.round((video.videoHeight || 720) * skala));

  const canvas = document.createElement('canvas');
  canvas.width = szerokosc;
  canvas.height = wysokosc;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Nie udalo sie utworzyc kontekstu 2D.');

  const strumienPlotna = canvas.captureStream(30);
  const strumienWideo = strumienZrodla(video);
  const sciezkiDzwieku = korekty.wyciszony ? [] : (strumienWideo?.getAudioTracks() ?? []);
  for (const sciezka of sciezkiDzwieku) strumienPlotna.addTrack(sciezka);

  const rejestrator = new MediaRecorder(strumienPlotna, { mimeType: format.mimeType });
  const kawalki: BlobPart[] = [];
  rejestrator.ondataavailable = (e) => {
    if (e.data.size > 0) kawalki.push(e.data);
  };

  const zakonczone = new Promise<void>((resolve) => {
    rejestrator.onstop = () => resolve();
  });

  const wszystkieSekundy = doRenderu.reduce((acc, s) => acc + Math.max(0, s.do - s.od), 0);
  let juzZrenderowane = 0;

  const stanPrzed = { czas: video.currentTime, predkosc: video.playbackRate, glosnosc: video.volume, wyciszony: video.muted };

  video.playbackRate = korekty.predkosc;
  video.volume = korekty.glosnosc;
  video.muted = korekty.wyciszony;

  rejestrator.start(250);

  try {
    for (const segment of doRenderu) {
      if (przerwij?.()) break;

      await przewin(video, segment.od);
      await video.play();

      await new Promise<void>((resolve) => {
        const klatka = () => {
          if (przerwij?.() || video.currentTime >= segment.do || video.ended) {
            video.pause();
            resolve();
            return;
          }

          ctx.filter = filtrCSS(korekty);
          ctx.drawImage(video, 0, 0, szerokosc, wysokosc);
          rysujNapis(ctx, napis, szerokosc, wysokosc);

          onPostep?.({
            gotoweSekundy: juzZrenderowane + (video.currentTime - segment.od),
            wszystkieSekundy,
          });

          requestAnimationFrame(klatka);
        };
        requestAnimationFrame(klatka);
      });

      juzZrenderowane += Math.max(0, segment.do - segment.od);
      onPostep?.({ gotoweSekundy: juzZrenderowane, wszystkieSekundy });
    }
  } finally {
    video.pause();
    if (rejestrator.state !== 'inactive') rejestrator.stop();
    await zakonczone;

    // Przywracamy odtwarzacz do stanu sprzed renderu, zeby podglad dzialal dalej.
    video.playbackRate = stanPrzed.predkosc;
    video.volume = stanPrzed.glosnosc;
    video.muted = stanPrzed.wyciszony;
    video.currentTime = stanPrzed.czas;
  }

  return { blob: new Blob(kawalki, { type: format.mimeType }), rozszerzenie: format.rozszerzenie };
}

/** Pobiera gotowy material — nazwa pliku wyprowadzona ze zrodla. */
export function pobierz(blob: Blob, nazwaZrodla: string, rozszerzenie: string): void {
  const bazowa = nazwaZrodla.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]+/g, '-') || 'reelcut';
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${bazowa}-reelcut.${rozszerzenie}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
