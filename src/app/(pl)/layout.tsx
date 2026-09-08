import type { Metadata } from 'next';
import '../globals.css';

const OPIS =
  'Montaż wideo działający w całości w przeglądarce: przytnij, poskładaj, popraw obraz i wyrenderuj gotowy plik. Materiał nie jest nigdzie wysyłany, bo serwis nie ma backendu.';

export const metadata: Metadata = {
  metadataBase: new URL('https://reelcut.dawidolko.pl'),
  title: { default: 'ReelCut — montaż wideo w przeglądarce', template: '%s — ReelCut' },
  description: OPIS,
  keywords: ['montaż wideo', 'edytor wideo online', 'przycinanie filmu', 'cięcie wideo', 'montaż w przeglądarce'],
  authors: [{ name: 'Dawid Olko', url: 'https://dawidolko.pl' }],
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    alternateLocale: 'en_GB',
    url: 'https://reelcut.dawidolko.pl/pl/',
    siteName: 'ReelCut',
    title: 'ReelCut — montaż wideo w przeglądarce',
    description: OPIS,
  },
  twitter: { card: 'summary_large_image', title: 'ReelCut — montaż wideo w przeglądarce', description: OPIS },
  alternates: {
    canonical: 'https://reelcut.dawidolko.pl/pl/',
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
  url: 'https://reelcut.dawidolko.pl/pl/',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Dowolna przeglądarka',
  description: OPIS,
  inLanguage: 'pl',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'PLN' },
  author: { '@type': 'Person', name: 'Dawid Olko', url: 'https://dawidolko.pl' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
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
