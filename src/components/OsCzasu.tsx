'use client';

import type { Segment } from './model';
import { czas } from './model';

/*
 * Os czasu.
 *
 * Fragmenty rysujemy proporcjonalnie do dlugosci zrodla, zeby szerokosc paska
 * odpowiadala temu, ile materialu faktycznie zajmuje. Wylaczony fragment
 * zostaje widoczny — inaczej nie dalo by sie go przywrocic.
 */
export function OsCzasu({
  segmenty,
  dlugosc,
  pozycja,
  etykiety,
  onPozycja,
  onPrzelacz,
}: {
  segmenty: Segment[];
  dlugosc: number;
  pozycja: number;
  etykiety: {
    fragment: string;
    usunFragment: string;
    przywroc: string;
    poczatek: string;
    koniec: string;
  };
  onPozycja: (sekundy: number) => void;
  onPrzelacz: (id: string) => void;
}) {
  const bezpiecznaDlugosc = dlugosc > 0 ? dlugosc : 1;

  return (
    <div>
      {/* Pasek fragmentow */}
      <div className="relative h-16 overflow-hidden rounded-lg border border-night-600 bg-night-800">
        <div className="flex h-full">
          {segmenty.map((segment, i) => {
            const udzial = Math.max(0, (segment.do - segment.od) / bezpiecznaDlugosc);
            return (
              <button
                key={segment.id}
                type="button"
                onClick={() => onPrzelacz(segment.id)}
                style={{ width: `${udzial * 100}%` }}
                aria-pressed={segment.aktywny}
                className={`group relative h-full min-w-[2px] border-r border-night-900 px-2 text-left transition-colors last:border-r-0 ${
                  segment.aktywny
                    ? 'bg-teal-500/25 hover:bg-teal-500/35'
                    : 'bg-night-700 hover:bg-night-600'
                }`}
              >
                <span className="pointer-events-none block truncate pt-1.5 text-[11px] font-medium text-mist-100">
                  {etykiety.fragment} {i + 1}
                </span>
                <span className="pointer-events-none block truncate text-[10px] tabular-nums text-mist-400">
                  {czas(segment.do - segment.od)}
                </span>
                <span className="sr-only">
                  {segment.aktywny ? etykiety.usunFragment : etykiety.przywroc}
                </span>
                {!segment.aktywny && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(244,96,62,0.22)_5px,rgba(244,96,62,0.22)_10px)]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Glowica */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-[2px] bg-teal-400"
          style={{ left: `${Math.min(100, (pozycja / bezpiecznaDlugosc) * 100)}%` }}
        />
      </div>

      {/* Przewijanie */}
      <label htmlFor="os-pozycja" className="sr-only">
        {etykiety.poczatek} – {etykiety.koniec}
      </label>
      <input
        id="os-pozycja"
        type="range"
        min={0}
        max={bezpiecznaDlugosc}
        step={0.05}
        value={Math.min(pozycja, bezpiecznaDlugosc)}
        aria-valuetext={czas(pozycja)}
        onChange={(e) => onPozycja(Number(e.target.value))}
        className="suwak-osi mt-3 w-full"
      />

      <div className="mt-1 flex justify-between text-xs tabular-nums text-mist-400">
        <span>{czas(pozycja)}</span>
        <span>{czas(dlugosc)}</span>
      </div>
    </div>
  );
}
