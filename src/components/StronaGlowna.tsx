import type { Tresc } from './tresc';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { Edytor } from './Edytor';

/*
 * Uklad strony. Wersja polska i angielska korzystaja z tego samego komponentu —
 * rozni je wylacznie obiekt z trescia.
 */
export function StronaGlowna({ t }: { t: Tresc }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-teal-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-night-900"
      >
        {t.wspolne.przejdzDoTresci}
      </a>

      <SiteHeader t={t} />

      <main id="main-content">
        {/* Hero */}
        <section className="border-b border-night-700">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-night-600 bg-night-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-400">
                ReelCut
              </p>
              <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-mist-50 sm:text-5xl">
                {t.hero.naglowek}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-mist-300">{t.hero.lead}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#edytor"
                  className="rounded-lg bg-coral-500 px-6 py-3 text-sm font-semibold text-night-900 transition-colors hover:bg-coral-400"
                >
                  {t.hero.cta}
                </a>
                <a
                  href="#jak"
                  className="rounded-lg border border-night-600 px-6 py-3 text-sm font-semibold text-mist-100 transition-colors hover:border-teal-400 hover:text-teal-400"
                >
                  {t.hero.ctaDrugie}
                </a>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mist-300">
                {t.hero.znaczniki.map((znacznik) => (
                  <li key={znacznik} className="flex items-center gap-2">
                    <span aria-hidden="true" className="text-teal-400">
                      ✓
                    </span>
                    {znacznik}
                  </li>
                ))}
              </ul>
            </div>

            {/* Szkic osi czasu — sama typografia i bloki, bez obrazka. */}
            <div aria-hidden="true" className="hidden lg:block">
              <div className="rounded-xl border border-night-600 bg-night-800 p-4">
                <div className="aspect-video w-full rounded-lg bg-gradient-to-br from-night-700 to-night-900" />
                <div className="mt-4 flex gap-1">
                  <div className="h-12 flex-[3] rounded bg-teal-500/25" />
                  <div className="h-12 flex-[2] rounded bg-night-700" />
                  <div className="h-12 flex-[4] rounded bg-teal-500/25" />
                  <div className="h-12 flex-[1] rounded bg-night-700" />
                </div>
                <div className="relative mt-3 h-1 rounded-full bg-night-600">
                  <div className="absolute left-[45%] top-1/2 h-4 w-0.5 -translate-y-1/2 bg-teal-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mozliwosci */}
        <section id="mozliwosci" className="scroll-mt-20 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {t.zalety.map((zaleta, i) => (
                <li key={zaleta.tytul} className="rounded-xl border border-night-700 bg-night-800 p-6">
                  <span aria-hidden="true" className="font-display text-sm font-bold tabular-nums text-coral-500">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="mt-2 font-display text-lg font-bold text-mist-50">{zaleta.tytul}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-mist-300">{zaleta.opis}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Edytor */}
        <Edytor t={t} />

        {/* Jak to dziala */}
        <section id="jak" className="scroll-mt-20 border-t border-night-700 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-mist-50 sm:text-4xl">{t.jak.tytul}</h2>
            <p className="mt-3 max-w-2xl text-mist-300">{t.jak.wstep}</p>

            <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {t.jak.kroki.map((krok, i) => (
                <li key={krok.tytul} className="rounded-xl border border-night-700 bg-night-800 p-6">
                  <span
                    aria-hidden="true"
                    className="grid size-8 place-items-center rounded-full bg-teal-500 font-display text-sm font-bold text-night-900"
                  >
                    {i + 1}
                  </span>
                  <h3 className="mt-3 font-display text-base font-bold text-mist-50">{krok.tytul}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-300">{krok.opis}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ — same details/summary, bez JavaScriptu. */}
        <section id="faq" className="scroll-mt-20 border-t border-night-700 py-14 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-mist-50 sm:text-4xl">{t.faq.tytul}</h2>
            <div className="mt-8 divide-y divide-night-700 border-y border-night-700">
              {t.faq.pozycje.map((pozycja) => (
                <details key={pozycja.pytanie} className="group py-4">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-display text-base font-semibold text-mist-50 marker:content-['']">
                    {pozycja.pytanie}
                    <span aria-hidden="true" className="shrink-0 text-coral-500 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-mist-300">{pozycja.odpowiedz}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter t={t} />
    </>
  );
}
