import type { Metadata } from 'next';
import '../globals.css';

const OPIS =
  'A video editor that runs entirely in your browser: trim, arrange, adjust and render a finished file. Your footage is never uploaded, because the site has no backend.';

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
  },
  twitter: { card: 'summary_large_image', title: 'ReelCut — edit video in your browser', description: OPIS },
  alternates: {
    canonical: 'https://reelcut.dawidolko.pl/',
    // Obie wersje wskazuja na siebie nawzajem; angielska jest domyslna dla
    // odwiedzajacych spoza listy jezykow.
    languages: {
      en: 'https://reelcut.dawidolko.pl/',
      pl: 'https://reelcut.dawidolko.pl/pl/',
      'x-default': 'https://reelcut.dawidolko.pl/',
    },
  },
  robots: { index: true, follow: true },
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(daneStrukturalne) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
