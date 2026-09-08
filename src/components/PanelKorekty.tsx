'use client';

import type { Korekty, Napis } from './model';
import { KOREKTY_STARTOWE } from './model';
import type { Tresc } from './tresc';

/*
 * Panel korekt.
 *
 * Kazdy suwak ma aria-valuetext z wartoscia w postaci, ktora ma sens dla
 * czlowieka — czytnik ekranu przeczyta "120%", a nie "1.2".
 */
export function PanelKorekty({
  korekty,
  napis,
  t,
  onKorekty,
  onNapis,
}: {
  korekty: Korekty;
  napis: Napis;
  t: Tresc;
  onKorekty: (zmiana: (poprzednie: Korekty) => Korekty) => void;
  onNapis: (zmiana: (poprzedni: Napis) => Napis) => void;
}) {
  const k = t.edytor.korekty;

  const Suwak = ({
    id,
    etykieta,
    wartosc,
    min,
    max,
    krok = 0.05,
    format,
    onZmiana,
  }: {
    id: string;
    etykieta: string;
    wartosc: number;
    min: number;
    max: number;
    krok?: number;
    format: (v: number) => string;
    onZmiana: (v: number) => void;
  }) => (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-mist-100">
          {etykieta}
        </label>
        <span className="text-xs tabular-nums text-mist-400">{format(wartosc)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={krok}
        value={wartosc}
        aria-valuetext={format(wartosc)}
        onChange={(e) => onZmiana(Number(e.target.value))}
        className="suwak-osi w-full"
      />
    </div>
  );

  const procent = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <div className="space-y-4">
      <Suwak id="k-jasnosc" etykieta={k.jasnosc} wartosc={korekty.jasnosc} min={0.5} max={1.5} format={procent} onZmiana={(v) => onKorekty((p) => ({ ...p, jasnosc: v }))} />
      <Suwak id="k-kontrast" etykieta={k.kontrast} wartosc={korekty.kontrast} min={0.5} max={1.5} format={procent} onZmiana={(v) => onKorekty((p) => ({ ...p, kontrast: v }))} />
      <Suwak id="k-nasycenie" etykieta={k.nasycenie} wartosc={korekty.nasycenie} min={0} max={2} format={procent} onZmiana={(v) => onKorekty((p) => ({ ...p, nasycenie: v }))} />
      <Suwak id="k-predkosc" etykieta={k.predkosc} wartosc={korekty.predkosc} min={0.5} max={2} krok={0.1} format={(v) => `${v.toFixed(1)}×`} onZmiana={(v) => onKorekty((p) => ({ ...p, predkosc: v }))} />
      <Suwak id="k-glosnosc" etykieta={k.glosnosc} wartosc={korekty.glosnosc} min={0} max={1} format={procent} onZmiana={(v) => onKorekty((p) => ({ ...p, glosnosc: v }))} />

      <label className="flex items-center gap-2 text-sm text-mist-100">
        <input
          type="checkbox"
          checked={korekty.wyciszony}
          onChange={(e) => onKorekty((p) => ({ ...p, wyciszony: e.target.checked }))}
          className="size-4 rounded border-night-600 bg-night-800 text-coral-500"
        />
        {k.wyciszony}
      </label>

      <fieldset className="rounded-lg border border-night-600 p-3">
        <legend className="px-1 text-sm font-medium text-mist-100">{k.napis}</legend>
        <div className="space-y-3">
          <div>
            <label htmlFor="n-tekst" className="mb-1 block text-xs font-medium text-mist-300">
              {k.napisTekst}
            </label>
            <input
              id="n-tekst"
              type="text"
              value={napis.tekst}
              maxLength={80}
              onChange={(e) => onNapis((p) => ({ ...p, tekst: e.target.value }))}
              className="w-full rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm text-mist-100 placeholder:text-mist-400"
            />
          </div>
          <div>
            <span className="mb-1 block text-xs font-medium text-mist-300">{k.napisPozycja}</span>
            <div className="flex gap-2">
              {(['gora', 'dol'] as const).map((pozycja) => (
                <button
                  key={pozycja}
                  type="button"
                  onClick={() => onNapis((p) => ({ ...p, pozycja }))}
                  aria-pressed={napis.pozycja === pozycja}
                  className={`flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                    napis.pozycja === pozycja
                      ? 'border-teal-400 bg-teal-400/15 text-teal-400'
                      : 'border-night-600 text-mist-300 hover:border-mist-400 hover:text-mist-100'
                  }`}
                >
                  {pozycja === 'gora' ? k.gora : k.dol}
                </button>
              ))}
            </div>
          </div>
        </div>
      </fieldset>

      <button
        type="button"
        onClick={() => {
          onKorekty(() => ({ ...KOREKTY_STARTOWE }));
          onNapis((p) => ({ ...p, tekst: '' }));
        }}
        className="w-full rounded-lg border border-night-600 px-3 py-2 text-sm font-medium text-mist-300 transition-colors hover:border-coral-500 hover:text-coral-400"
      >
        {k.reset}
      </button>
    </div>
  );
}
