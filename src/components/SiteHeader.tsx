'use client';

import { useEffect, useState } from 'react';
import type { Content } from './content';
import { ThemeToggle } from './ThemeToggle';

export function SiteHeader({ content }: { content: Content }) {
  const [open, setOpen] = useState(false);

  /* Escape closes the mobile menu — otherwise the only way out is the button. */
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const links = [
    { href: '#editor', label: content.nav.editor },
    { href: '#features', label: content.nav.features },
    { href: '#how', label: content.nav.how },
    { href: '#faq', label: content.nav.faq },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-base/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href={content.path} className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-md bg-lime font-display text-lg font-bold text-base"
          >
            RC
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-text">ReelCut</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label={content.nav.editor}>
          {links.map((link, index) => (
            <a
              key={`${link.href}-${index}`}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-text-3 transition-colors hover:bg-panel hover:text-text"
            >
              {link.label}
            </a>
          ))}
          <a
            href={content.otherLocale.path}
            hrefLang={content.otherLocale.code}
            className="ml-2 rounded-md border border-edge px-3 py-1.5 text-sm font-medium text-text-3 transition-colors hover:border-lime hover:text-lime"
          >
            {content.otherLocale.label}
          </a>
          <ThemeToggle content={content} />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle content={content} />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="rounded-md p-2 text-text-3 transition-colors hover:bg-panel hover:text-text"
          >
            <span className="sr-only">{content.common.openMenu}</span>
            <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className="border-t border-edge px-4 py-3 md:hidden" aria-label={content.nav.editor}>
          <ul className="space-y-1">
            {links.map((link, index) => (
              <li key={`${link.href}-${index}`}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-panel"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={content.otherLocale.path}
                hrefLang={content.otherLocale.code}
                className="block rounded-md px-3 py-2 text-sm font-medium text-lime hover:bg-panel"
              >
                {content.otherLocale.label}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
