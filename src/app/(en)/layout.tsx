import type { Metadata } from 'next';
import '../globals.css';
import { fontVariables } from '../fonts';
import { CONTENT_SECURITY_POLICY } from '../csp';
import { THEME_INIT_SCRIPT } from '@/components/ThemeToggle';

const OPIS =
  'A video editor that runs in your browser: trim, arrange, adjust and render a finished file. Your footage is never uploaded, because the site has no backend.';

const OG_ALT = 'ReelCut: a video editor that runs in your browser';

export const metadata: Metadata = {
  metadataBase: new URL('https://reelcut.dawidolko.pl'),
  title: { default: 'ReelCut — edit video in your browser', template: '%s — ReelCut' },
  description: OPIS,
  keywords: ['video editor', 'browser video editor', 'trim video online', 'cut video', 'no upload video editor', 'WebM export'],
  authors: [{ name: 'Dawid Olko', url: 'https://dawidolko.pl' }],
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    alternateLocale: 'pl_PL',
    url: 'https://reelcut.dawidolko.pl/',
    siteName: 'ReelCut',
    title: 'ReelCut — edit video in your browser',
    description: OPIS,
    images: [{ url: 'https://reelcut.dawidolko.pl/og-image.png', width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: { card: 'summary_large_image', title: 'ReelCut — edit video in your browser', description: OPIS, images: ['https://reelcut.dawidolko.pl/og-image.png'] },
  alternates: {
    canonical: 'https://reelcut.dawidolko.pl/',
    languages: {
      en: 'https://reelcut.dawidolko.pl/',
      pl: 'https://reelcut.dawidolko.pl/pl/',
      'x-default': 'https://reelcut.dawidolko.pl/',
    },
  },
  robots: { index: true, follow: true },
  referrer: 'strict-origin-when-cross-origin',
};

const daneStrukturalne = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'ReelCut',
  url: 'https://reelcut.dawidolko.pl/',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any browser',
  description: OPIS,
  inLanguage: 'en',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Person', name: 'Dawid Olko', url: 'https://dawidolko.pl' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={CONTENT_SECURITY_POLICY} />
        <script src="/a11y/a11y-panel.js" data-accent="#1d4ed8" defer></script>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(daneStrukturalne) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
