'use client';

import { useEffect, useState } from 'react';
import type { Tresc } from './tresc';

export function SiteHeader({ t }: { t: Tresc }) {
  const [otwarte, setOtwarte] = useState(false);

  /*
   * Escape zamyka menu na telefonie. Bez tego jedynym wyjsciem jest trafienie
   * w przycisk — a osoba poruszajaca sie klawiatura nie ma jak sie wycofac.
   */
  useEffect(() => {
    if (!otwarte) return;
    const naKlawisz = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOtwarte(false);
    };
    document.addEventListener('keydown', naKlawisz);
    return () => document.removeEventListener('keydown', naKlawisz);
  }, [otwarte]);

  const linki = [
    { href: '#edytor', label: t.nav.edytor },
    { href: '#mozliwosci', label: t.nav.mozliwosci },
    { href: '#jak', label: t.nav.jak },
    { href: '#faq', label: t.nav.faq },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-night-700 bg-night-900/90 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href={t.sciezka} className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-md bg-coral-500 font-display text-lg font-bold text-night-900"
          >
            RC
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-mist-50">ReelCut</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label={t.nav.edytor}>
          {linki.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-mist-300 transition-colors hover:bg-night-800 hover:text-mist-50"
            >
              {link.label}
            </a>
          ))}
          <a
            href={t.drugiJezyk.sciezka}
            hrefLang={t.drugiJezyk.kod}
            className="ml-2 rounded-md border border-night-600 px-3 py-1.5 text-sm font-medium text-mist-300 transition-colors hover:border-teal-400 hover:text-teal-400"
          >
            {t.drugiJezyk.etykieta}
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOtwarte((v) => !v)}
          aria-expanded={otwarte}
          aria-controls="menu-mobilne"
          className="rounded-md p-2 text-mist-300 transition-colors hover:bg-night-800 hover:text-mist-50 md:hidden"
        >
          <span className="sr-only">{t.nav.edytor}</span>
          <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {otwarte && (
        <nav id="menu-mobilne" className="border-t border-night-700 px-4 py-3 md:hidden" aria-label={t.nav.edytor}>
          <ul className="space-y-1">
            {linki.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOtwarte(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-mist-100 hover:bg-night-800"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={t.drugiJezyk.sciezka}
                hrefLang={t.drugiJezyk.kod}
                className="block rounded-md px-3 py-2 text-sm font-medium text-teal-400 hover:bg-night-800"
              >
                {t.drugiJezyk.etykieta}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
