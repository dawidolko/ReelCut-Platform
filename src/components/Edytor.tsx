'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Korekty, Napis, Segment } from './model';
import { KOREKTY_STARTOWE, aktywne, czas, dlugoscMontazu, filtrCSS, nowyId, podziel, rozmiar } from './model';
import type { Tresc } from './tresc';
import { OsCzasu } from './OsCzasu';
import { PanelKorekty } from './PanelKorekty';
import { eksportDostepny, pobierz, renderuj } from './eksport';

/*
 * Edytor — powloka trzymajaca caly stan sesji montazowej.
 *
 * Material zyje pod adresem blob wygenerowanym z pliku wybranego przez
 * uzytkownika. Nie ma tu ani wysylania, ani zapisu: zamkniecie karty konczy
 * prace i tak to opisujemy w interfejsie, zamiast udawac, ze cos przetrwa.
 */
export function Edytor({ t }: { t: Tresc }) {
  const [zrodlo, setZrodlo] = useState<{ url: string; nazwa: string; rozmiar: number } | null>(null);
  const [dlugosc, setDlugosc] = useState(0);
  const [segmenty, setSegmenty] = useState<Segment[]>([]);
  const [pozycja, setPozycja] = useState(0);
  const [gra, setGra] = useState(false);
  const [korekty, setKorekty] = useState<Korekty>({ ...KOREKTY_STARTOWE });
  const [napis, setNapis] = useState<Napis>({ tekst: '', pozycja: 'dol' });
  const [blad, setBlad] = useState('');
  const [postep, setPostep] = useState<{ gotowe: number; wszystko: number } | null>(null);
  const [wynik, setWynik] = useState<{ blob: Blob; rozszerzenie: string } | null>(null);
  const [nadPolem, setNadPolem] = useState(false);
  const [mozliwyRender, setMozliwyRender] = useState(true);

  const video = useRef<HTMLVideoElement>(null);
  const polePliku = useRef<HTMLInputElement>(null);
  const przerwane = useRef(false);

  // MediaRecorder sprawdzamy dopiero w przegladarce — w buildzie go nie ma.
  useEffect(() => setMozliwyRender(eksportDostepny()), []);

  // Adres blob trzeba zwolnic, inaczej material zostaje w pamieci karty.
  useEffect(() => {
    return () => {
      if (zrodlo) URL.revokeObjectURL(zrodlo.url);
    };
  }, [zrodlo]);

  const wczytajPlik = useCallback(
    (plik: File) => {
      setBlad('');
      setWynik(null);
      if (zrodlo) URL.revokeObjectURL(zrodlo.url);
      setZrodlo({ url: URL.createObjectURL(plik), nazwa: plik.name, rozmiar: plik.size });
      setSegmenty([]);
      setPozycja(0);
      setGra(false);
    },
    [zrodlo],
  );

  function poZaladowaniu() {
    const el = video.current;
    if (!el || !Number.isFinite(el.duration)) return;
    setDlugosc(el.duration);
    setSegmenty([{ id: nowyId(), od: 0, do: el.duration, aktywny: true }]);
  }

  const przewin = useCallback((sekundy: number) => {
    const el = video.current;
    if (!el) return;
    const cel = Math.max(0, Math.min(sekundy, el.duration || 0));
    el.currentTime = cel;
    setPozycja(cel);
  }, []);

  function przelaczOdtwarzanie() {
    const el = video.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setGra(true);
    } else {
      el.pause();
      setGra(false);
    }
  }

  /* Spacja i strzalki dzialaja tylko wtedy, gdy fokus nie siedzi w polu — inaczej
     nie dalo by sie wpisac spacji w tresc napisu. */
  useEffect(() => {
    if (!zrodlo) return;
    const naKlawisz = (e: KeyboardEvent) => {
      const cel = e.target as HTMLElement | null;
      if (cel && ['INPUT', 'TEXTAREA', 'SELECT'].includes(cel.tagName)) return;

      if (e.key === ' ') {
        e.preventDefault();
        przelaczOdtwarzanie();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        przewin((video.current?.currentTime ?? 0) - 1 / 25);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        przewin((video.current?.currentTime ?? 0) + 1 / 25);
      }
    };
    window.addEventListener('keydown', naKlawisz);
    return () => window.removeEventListener('keydown', naKlawisz);
  }, [zrodlo, przewin]);

  async function uruchomRender() {
    const el = video.current;
    if (!el) return;
    przerwane.current = false;
    setWynik(null);
    setBlad('');
    setPostep({ gotowe: 0, wszystko: dlugoscMontazu(segmenty, 1) });
    setGra(false);
    el.pause();

    try {
      const rezultat = await renderuj({
        video: el,
        segmenty,
        korekty,
        napis,
        onPostep: (p) => setPostep({ gotowe: p.gotoweSekundy, wszystko: p.wszystkieSekundy }),
        przerwij: () => przerwane.current,
      });
      setWynik(rezultat);
    } catch (e) {
      setBlad(e instanceof Error ? e.message : String(e));
    } finally {
      setPostep(null);
    }
  }

  const e = t.edytor;
  const doRenderu = aktywne(segmenty);
  const przyciskDrugi =
    'rounded-lg border border-night-600 px-3 py-2 text-sm font-medium text-mist-100 transition-colors hover:border-teal-400 hover:text-teal-400';

  return (
    <section id="edytor" className="scroll-mt-20 border-t border-night-700 bg-night-800/40 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="mb-8 max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-mist-50 sm:text-4xl">{e.tytul}</h2>
          <p className="mt-3 text-mist-300">{e.wstep}</p>
        </header>

        {!zrodlo ? (
          /* Pole wczytywania */
          <div
            onDragOver={(ev) => {
              ev.preventDefault();
              setNadPolem(true);
            }}
            onDragLeave={() => setNadPolem(false)}
            onDrop={(ev) => {
              ev.preventDefault();
              setNadPolem(false);
              const plik = ev.dataTransfer.files?.[0];
              if (plik) wczytajPlik(plik);
            }}
            className={`rounded-2xl border-2 border-dashed p-10 text-center transition-colors sm:p-16 ${
              nadPolem ? 'border-teal-400 bg-teal-400/5' : 'border-night-600 bg-night-800'
            }`}
          >
            <h3 className="font-display text-xl font-bold text-mist-50">{e.wczytaj.naglowek}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-mist-300">{e.wczytaj.opis}</p>
            <button
              type="button"
              onClick={() => polePliku.current?.click()}
              className="mt-6 rounded-lg bg-coral-500 px-6 py-3 text-sm font-semibold text-night-900 transition-colors hover:bg-coral-400"
            >
              {e.wczytaj.przycisk}
            </button>
            <p className="mt-3 text-xs text-mist-400">{e.wczytaj.formaty}</p>
            <input
              ref={polePliku}
              type="file"
              accept="video/*"
              className="sr-only"
              aria-label={e.wczytaj.przycisk}
              onChange={(ev) => {
                const plik = ev.target.files?.[0];
                if (plik) wczytajPlik(plik);
                ev.target.value = '';
              }}
            />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* Podglad i os czasu */}
            <div>
              <div className="overflow-hidden rounded-xl border border-night-600 bg-night-900">
                <div className="relative">
                  <video
                    ref={video}
                    src={zrodlo.url}
                    onLoadedMetadata={poZaladowaniu}
                    onTimeUpdate={(ev) => setPozycja(ev.currentTarget.currentTime)}
                    onPlay={() => setGra(true)}
                    onPause={() => setGra(false)}
                    onError={() => setBlad(e.wczytaj.bladFormatu)}
                    style={{ filter: filtrCSS(korekty) }}
                    className="aspect-video w-full bg-black"
                    playsInline
                  />
                  {napis.tekst.trim() && (
                    <p
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-x-0 px-4 text-center text-lg font-semibold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)] sm:text-2xl ${
                        napis.pozycja === 'gora' ? 'top-[6%]' : 'bottom-[6%]'
                      }`}
                    >
                      {napis.tekst}
                    </p>
                  )}
                </div>

                {/* Transport */}
                <div className="flex flex-wrap items-center gap-2 border-t border-night-700 p-3">
                  <button type="button" onClick={przelaczOdtwarzanie} className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-night-900 transition-colors hover:bg-teal-400">
                    {gra ? e.transport.pauza : e.transport.odtworz}
                  </button>
                  <button type="button" onClick={() => przewin(0)} className={przyciskDrugi}>
                    {e.transport.doPoczatku}
                  </button>
                  <button type="button" onClick={() => przewin(pozycja - 1 / 25)} className={przyciskDrugi}>
                    {e.transport.klatkaWstecz}
                  </button>
                  <button type="button" onClick={() => przewin(pozycja + 1 / 25)} className={przyciskDrugi}>
                    {e.transport.klatkaWPrzod}
                  </button>
                  <span className="ml-auto text-sm tabular-nums text-mist-300">
                    {czas(pozycja)} / {czas(dlugosc)}
                  </span>
                </div>
              </div>

              {/* Os czasu */}
              <div className="mt-5 rounded-xl border border-night-600 bg-night-800 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-mist-300">{e.os.tytul}</h3>
                    <p className="mt-0.5 text-xs text-mist-400">{e.os.opis}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSegmenty((s) => podziel(s, pozycja))}
                    className="rounded-lg bg-coral-500 px-4 py-2 text-sm font-semibold text-night-900 transition-colors hover:bg-coral-400"
                  >
                    {e.os.podziel}
                  </button>
                </div>

                <OsCzasu
                  segmenty={segmenty}
                  dlugosc={dlugosc}
                  pozycja={pozycja}
                  etykiety={{
                    fragment: e.os.fragment,
                    usunFragment: e.os.usunFragment,
                    przywroc: e.os.przywroc,
                    poczatek: e.os.poczatek,
                    koniec: e.os.koniec,
                  }}
                  onPozycja={przewin}
                  onPrzelacz={(id) =>
                    setSegmenty((s) => s.map((seg) => (seg.id === id ? { ...seg, aktywny: !seg.aktywny } : seg)))
                  }
                />

                <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="text-mist-400">{e.os.dlugoscZrodla}:</dt>
                    <dd className="tabular-nums text-mist-100">{czas(dlugosc)}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-mist-400">{e.os.dlugoscMontazu}:</dt>
                    <dd className="tabular-nums text-teal-400">{czas(dlugoscMontazu(segmenty, korekty.predkosc))}</dd>
                  </div>
                </dl>

                {doRenderu.length === 0 && <p className="mt-3 text-sm text-coral-400">{e.os.pusto}</p>}
              </div>
            </div>

            {/* Panel boczny */}
            <div className="space-y-5">
              <div className="rounded-xl border border-night-600 bg-night-800 p-4">
                <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-mist-300">
                  {e.korekty.tytul}
                </h3>
                <PanelKorekty korekty={korekty} napis={napis} t={t} onKorekty={setKorekty} onNapis={setNapis} />
              </div>

              <div className="rounded-xl border border-night-600 bg-night-800 p-4">
                <h3 className="mb-1 font-display text-sm font-bold uppercase tracking-wider text-mist-300">
                  {e.eksport.tytul}
                </h3>
                <p className="mb-3 text-xs text-mist-400">{e.eksport.opis}</p>

                {!mozliwyRender ? (
                  <p className="text-sm text-coral-400">{e.eksport.niedostepny}</p>
                ) : postep ? (
                  <div>
                    <p className="mb-2 text-sm text-mist-100">{e.eksport.wTrakcie}</p>
                    <div
                      role="progressbar"
                      aria-label={e.eksport.postep}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(postep.wszystko > 0 ? (postep.gotowe / postep.wszystko) * 100 : 0)}
                      className="h-2 overflow-hidden rounded-full bg-night-600"
                    >
                      <div
                        className="h-full bg-teal-400 transition-[width]"
                        style={{ width: `${postep.wszystko > 0 ? (postep.gotowe / postep.wszystko) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs tabular-nums text-mist-400">
                      {czas(postep.gotowe)} / {czas(postep.wszystko)}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        przerwane.current = true;
                      }}
                      className="mt-3 w-full rounded-lg border border-night-600 px-3 py-2 text-sm font-medium text-mist-300 hover:border-coral-500 hover:text-coral-400"
                    >
                      {e.eksport.przerwij}
                    </button>
                  </div>
                ) : wynik ? (
                  <div>
                    <p className="text-sm font-medium text-teal-400">
                      {e.eksport.gotowe} — {rozmiar(wynik.blob.size)}
                    </p>
                    <button
                      type="button"
                      onClick={() => pobierz(wynik.blob, zrodlo.nazwa, wynik.rozszerzenie)}
                      className="mt-3 w-full rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-night-900 transition-colors hover:bg-teal-400"
                    >
                      {e.eksport.pobierz}
                    </button>
                    <button type="button" onClick={() => setWynik(null)} className={`mt-2 w-full ${przyciskDrugi}`}>
                      {e.eksport.przycisk}
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={uruchomRender}
                      disabled={doRenderu.length === 0}
                      className="w-full rounded-lg bg-coral-500 px-4 py-2.5 text-sm font-semibold text-night-900 transition-colors hover:bg-coral-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {e.eksport.przycisk}
                    </button>
                    <p className="mt-2 text-xs leading-relaxed text-mist-400">{e.eksport.ostrzezenieCzas}</p>
                  </>
                )}

                {blad && (
                  <p role="alert" className="mt-3 text-sm text-coral-400">
                    {blad}
                  </p>
                )}
              </div>

              <p className="px-1 text-xs text-mist-400">
                {zrodlo.nazwa} · {rozmiar(zrodlo.rozmiar)}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
