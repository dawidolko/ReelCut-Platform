import type { Metadata } from 'next';
import './globals.css';
import { fontVariables } from './fonts';
import { CONTENT_SECURITY_POLICY } from './csp';
import { THEME_INIT_SCRIPT } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Page not found — ReelCut',
  description: 'This address does not exist on ReelCut. Go back to the home page or open the Polish version of the site.',
  robots: { index: false, follow: true },
  referrer: 'strict-origin-when-cross-origin',
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={CONTENT_SECURITY_POLICY} />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script src="/a11y/a11y-panel.js" data-accent="#1d4ed8" defer></script>
      </head>
      <body>
        <main id="main-content" className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-16 sm:px-6">
          <p className="font-display text-sm font-bold uppercase tracking-widest text-text-3">404</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-text sm:text-5xl">Page not found</h1>
          <p className="mt-4 text-lg leading-relaxed text-text-3">
            The address may be mistyped, or the page may have moved.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/" className="rounded-md px-6 py-3 font-bold transition bg-lime text-base hover:bg-lime-2">
              Back to the home page
            </a>
            <a href="/pl/" lang="pl" hrefLang="pl" className="rounded-md px-6 py-3 font-bold transition border border-edge-2 text-text-2 hover:border-lime hover:text-lime">
              Strona główna po polsku
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
