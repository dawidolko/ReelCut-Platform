import type { Metadata } from 'next';
import '../globals.css';
import { fontVariables } from '../fonts';
import { CONTENT_SECURITY_POLICY } from '../csp';
import { THEME_INIT_SCRIPT } from '@/components/ThemeToggle';

const OPIS =
  'Montaż wideo działający w przeglądarce: przytnij, poskładaj, popraw obraz i wyrenderuj gotowy plik. Materiał nie jest nigdzie wysyłany, bo serwis nie ma backendu.';

const OG_ALT = 'ReelCut: edytor wideo działający w przeglądarce';

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
    images: [{ url: 'https://reelcut.dawidolko.pl/og-image.png', width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: { card: 'summary_large_image', title: 'ReelCut — montaż wideo w przeglądarce', description: OPIS, images: ['https://reelcut.dawidolko.pl/og-image.png'] },
  alternates: {
    canonical: 'https://reelcut.dawidolko.pl/pl/',
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
    <html lang="pl" className={fontVariables} suppressHydrationWarning>
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
