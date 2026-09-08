/*
 * Every string on the site, in both languages. Layout lives in the components;
 * the two versions differ only in the words.
 */

import type { AspectId, CaptionStyle, Locale } from './project';

export type Content = {
  locale: Locale;
  path: string;
  otherLocale: { code: string; label: string; path: string };
  nav: { editor: string; features: string; how: string; faq: string };
  theme: { toLight: string; toDark: string };
  hero: { heading: string; lead: string; cta: string; ctaSecondary: string; badges: string[] };
  benefits: { title: string; body: string }[];
  how: { title: string; intro: string; steps: { title: string; body: string }[] };
  editor: {
    title: string;
    intro: string;
    load: { heading: string; body: string; button: string; formats: string; formatError: string };
    transport: { play: string; pause: string; toStart: string; prevFrame: string; nextFrame: string };
    timeline: {
      title: string;
      body: string;
      split: string;
      disable: string;
      restore: string;
      moveLeft: string;
      moveRight: string;
      piece: string;
      empty: string;
      sourceLength: string;
      editedLength: string;
      zoom: string;
    };
    format: {
      title: string;
      aspect: string;
      resolution: string;
      aspects: Record<AspectId, string>;
      output: string;
      cropNote: string;
    };
    adjust: {
      title: string;
      brightness: string;
      contrast: string;
      saturation: string;
      speed: string;
      volume: string;
      muted: string;
      caption: string;
      captionText: string;
      captionPosition: string;
      captionStyle: string;
      captionSize: string;
      styles: Record<CaptionStyle, string>;
      top: string;
      bottom: string;
      reset: string;
    };
    render: {
      title: string;
      body: string;
      button: string;
      working: string;
      stop: string;
      done: string;
      download: string;
      unavailable: string;
      timeWarning: string;
      progress: string;
    };
  };
  faq: { title: string; items: { question: string; answer: string }[] };
  footer: { body: string; author: string; code: string; rights: string };
  common: { skipToContent: string; changeLanguage: string; openMenu: string };
};

const PL: Content = {
  locale: 'pl',
  path: '/pl/',
  otherLocale: { code: 'en', label: 'English', path: '/' },
  nav: { editor: 'Edytor', features: 'Możliwości', how: 'Jak to działa', faq: 'FAQ' },
  theme: { toLight: 'Włącz tryb jasny', toDark: 'Włącz tryb ciemny' },
  hero: {
    heading: 'Przytnij film pod rolkę bez wysyłania go w świat',
    lead: 'Wytnij, poskładaj, wykadruj do 9:16 i wyrenderuj gotowy plik — wszystko w karcie przeglądarki. Materiał nie opuszcza Twojego dysku, bo nie ma dokąd go wysłać: ten serwis nie ma backendu.',
    cta: 'Otwórz edytor',
    ctaSecondary: 'Zobacz, jak to działa',
    badges: ['Bez wgrywania plików', 'Kadr 9:16 i 1:1', 'Render w przeglądarce'],
  },
  benefits: [
    {
      title: 'Plik zostaje u Ciebie',
      body: 'Materiał trafia do odtwarzacza przez adres blob w pamięci karty. Nie ma serwera, który mógłby go przyjąć — i dlatego nie ma też limitu rozmiaru ani kolejki.',
    },
    {
      title: 'Kadr pod każdą platformę',
      body: 'Jeden materiał, cztery proporcje: pionowe 9:16 pod rolki, 4:5, kwadrat i 16:9. Kadr jest przycinany od środka, bez rozciągania obrazu.',
    },
    {
      title: 'Montaż nieniszczący',
      body: 'Cięcie zapisuje liczby, nie klatki. Wyłączony fragment zostaje na osi i wraca jednym kliknięciem, bo źródło przez cały czas pozostaje nietknięte.',
    },
    {
      title: 'Render bez ffmpeg.wasm',
      body: 'Klatki idą przez płótno do MediaRecordera. Nie trzeba pobierać trzydziestu megabajtów WebAssembly ani nagłówków, których statyczny hosting i tak nie ustawi.',
    },
  ],
  how: {
    title: 'Jak to działa',
    intro: 'Pięć kroków od surowego materiału do pliku gotowego na rolkę.',
    steps: [
      { title: 'Wczytaj materiał', body: 'Przeciągnij plik albo wybierz go z dysku. Odtwarzacz dostaje adres blob — nic się nie wgrywa.' },
      { title: 'Potnij oś czasu', body: 'Ustaw głowicę i podziel materiał. Niepotrzebne fragmenty wyłącz — zostaną na osi, na wypadek zmiany zdania.' },
      { title: 'Wybierz kadr', body: 'Pionowy 9:16 pod rolki i shorty, 4:5, kwadrat albo szeroki. Podgląd od razu pokazuje, co zostanie w kadrze.' },
      { title: 'Popraw obraz i dodaj napis', body: 'Jasność, kontrast, nasycenie, prędkość i głośność. Napis w trzech stylach — z paskiem, z obrysem albo z cieniem.' },
      { title: 'Wyrenderuj plik', body: 'Wybierz rozdzielczość i uruchom render. Zachowane fragmenty trafiają do jednego pliku WebM, gotowego do pobrania.' },
    ],
  },
  editor: {
    title: 'Edytor',
    intro: 'Materiał zostaje w przeglądarce. Zamknięcie karty kończy pracę — nic nie jest nigdzie zapisywane.',
    load: {
      heading: 'Wczytaj plik wideo',
      body: 'Przeciągnij plik tutaj albo wybierz go z dysku. Obsługiwane jest wszystko, co potrafi odtworzyć Twoja przeglądarka.',
      button: 'Wybierz plik',
      formats: 'MP4, WebM, MOV — zależnie od przeglądarki',
      formatError: 'Tej przeglądarce nie udało się odtworzyć tego pliku. Spróbuj z MP4 lub WebM.',
    },
    transport: { play: 'Odtwórz', pause: 'Pauza', toStart: 'Na początek', prevFrame: 'Klatka wstecz', nextFrame: 'Klatka w przód' },
    timeline: {
      title: 'Oś czasu',
      body: 'Głowica wyznacza miejsce cięcia. Wyłączone fragmenty nie trafiają do renderu.',
      split: 'Podziel w tym miejscu',
      disable: 'Wyłącz fragment',
      restore: 'Przywróć fragment',
      moveLeft: 'Przesuń w lewo',
      moveRight: 'Przesuń w prawo',
      piece: 'Fragment',
      empty: 'Wszystkie fragmenty są wyłączone — render nie ma czego zapisać.',
      sourceLength: 'Materiał źródłowy',
      editedLength: 'Po montażu',
      zoom: 'Powiększenie osi',
    },
    format: {
      title: 'Kadr i rozdzielczość',
      aspect: 'Proporcje',
      resolution: 'Rozdzielczość',
      aspects: {
        source: 'Jak w źródle',
        vertical: 'Pionowy 9:16 — rolki, shorty',
        portrait: 'Portret 4:5',
        square: 'Kwadrat 1:1',
        wide: 'Szeroki 16:9',
      },
      output: 'Plik wynikowy',
      cropNote: 'Kadr przycinany od środka — obraz nie jest rozciągany.',
    },
    adjust: {
      title: 'Obraz, dźwięk i napis',
      brightness: 'Jasność',
      contrast: 'Kontrast',
      saturation: 'Nasycenie',
      speed: 'Prędkość',
      volume: 'Głośność',
      muted: 'Wycisz dźwięk',
      caption: 'Napis w kadrze',
      captionText: 'Treść napisu',
      captionPosition: 'Pozycja',
      captionStyle: 'Styl',
      captionSize: 'Wielkość',
      styles: { plain: 'Cień', outline: 'Obrys', bar: 'Pasek' },
      top: 'Góra',
      bottom: 'Dół',
      reset: 'Przywróć domyślne',
    },
    render: {
      title: 'Render',
      body: 'Zachowane fragmenty trafiają do jednego pliku.',
      button: 'Renderuj plik',
      working: 'Renderowanie…',
      stop: 'Przerwij',
      done: 'Plik gotowy',
      download: 'Pobierz plik',
      unavailable: 'Ta przeglądarka nie udostępnia MediaRecordera — render jest niedostępny. Edytor i podgląd działają normalnie.',
      timeWarning: 'Render biegnie w czasie rzeczywistym: minuta materiału to około minuty renderowania. Nie zamykaj karty w trakcie.',
      progress: 'Postęp renderowania',
    },
  },
  faq: {
    title: 'Pytania i odpowiedzi',
    items: [
      {
        question: 'Czy mój film gdzieś się wgrywa?',
        answer: 'Nie. Plik jest podłączany do odtwarzacza przez adres blob, który istnieje wyłącznie w pamięci tej karty. Serwis to zbiór statycznych plików — nie ma serwera, który mógłby cokolwiek przyjąć.',
      },
      {
        question: 'Dlaczego render trwa tyle, ile film?',
        answer: 'Bo klatki muszą faktycznie przejść przez odtwarzacz i płótno, zanim MediaRecorder je zapisze. To cena renderowania bez ffmpeg.wasm, który z kolei wymaga nagłówków COOP/COEP — a tych statyczny hosting nie ustawia.',
      },
      {
        question: 'Jak działa kadrowanie do 9:16?',
        answer: 'Obraz jest przycinany od środka do wybranych proporcji, nigdy rozciągany. Przy materiale poziomym oznacza to, że boki wypadną z kadru — podgląd pokazuje dokładnie to, co zostanie.',
      },
      {
        question: 'W jakim formacie dostanę plik?',
        answer: 'WebM z kodekiem VP9 lub VP8, zależnie od przeglądarki. To format, który MediaRecorder potrafi zapisać natywnie; odtworzy go każda współczesna przeglądarka i większość serwisów przyjmuje go bez konwersji.',
      },
      {
        question: 'Czy praca zostanie zapamiętana?',
        answer: 'Nie. Materiału wideo nie da się sensownie trzymać w pamięci przeglądarki, a zapisywanie samych cięć bez pliku byłoby mylące. Zamknięcie karty kończy sesję.',
      },
    ],
  },
  footer: { body: 'ReelCut — montaż wideo działający w całości w przeglądarce.', author: 'Autor', code: 'Kod źródłowy', rights: 'Wszelkie prawa zastrzeżone.' },
  common: { skipToContent: 'Przejdź do treści', changeLanguage: 'Zmień język', openMenu: 'Menu' },
};

const EN: Content = {
  locale: 'en',
  path: '/',
  otherLocale: { code: 'pl', label: 'Polski', path: '/pl/' },
  nav: { editor: 'Editor', features: 'Features', how: 'How it works', faq: 'FAQ' },
  theme: { toLight: 'Switch to light mode', toDark: 'Switch to dark mode' },
  hero: {
    heading: 'Cut a clip for reels without sending it anywhere',
    lead: 'Trim, arrange, crop to 9:16 and render a finished file — all inside a browser tab. Your footage never leaves your disk, because there is nowhere to send it: this site has no backend.',
    cta: 'Open the editor',
    ctaSecondary: 'See how it works',
    badges: ['No uploads', '9:16 and 1:1 crops', 'Rendered in the browser'],
  },
  benefits: [
    {
      title: 'The file stays with you',
      body: 'Footage reaches the player through a blob URL held in this tab. There is no server to receive it — which is also why there is no size limit and no queue.',
    },
    {
      title: 'A crop for every platform',
      body: 'One clip, four shapes: vertical 9:16 for reels, 4:5, square and 16:9. The frame is cropped from the centre, never stretched.',
    },
    {
      title: 'Non-destructive editing',
      body: 'A cut stores numbers, not frames. A piece switched off stays on the timeline and comes back with one click, because the source is never touched.',
    },
    {
      title: 'Rendering without ffmpeg.wasm',
      body: 'Frames travel through a canvas into MediaRecorder. No thirty-megabyte WebAssembly download, and no COOP/COEP headers that static hosting cannot set anyway.',
    },
  ],
  how: {
    title: 'How it works',
    intro: 'Five steps from raw footage to a file ready to post.',
    steps: [
      { title: 'Load the footage', body: 'Drop a file or pick one from disk. The player gets a blob URL — nothing is uploaded.' },
      { title: 'Cut the timeline', body: 'Position the playhead and split the footage. Switch off what you do not need; it stays on the timeline in case you change your mind.' },
      { title: 'Choose the crop', body: 'Vertical 9:16 for reels and shorts, 4:5, square or wide. The preview shows exactly what stays in frame.' },
      { title: 'Adjust and caption', body: 'Brightness, contrast, saturation, speed and volume. Captions in three styles — bar, outline or shadow.' },
      { title: 'Render the file', body: 'Pick a resolution and start. The pieces you kept are written into a single WebM file, ready to download.' },
    ],
  },
  editor: {
    title: 'Editor',
    intro: 'The footage stays in your browser. Closing the tab ends the session — nothing is stored anywhere.',
    load: {
      heading: 'Load a video file',
      body: 'Drop a file here or pick one from disk. Anything your browser can play will work.',
      button: 'Choose a file',
      formats: 'MP4, WebM, MOV — depending on the browser',
      formatError: 'This browser could not play that file. Try MP4 or WebM.',
    },
    transport: { play: 'Play', pause: 'Pause', toStart: 'Back to start', prevFrame: 'Previous frame', nextFrame: 'Next frame' },
    timeline: {
      title: 'Timeline',
      body: 'The playhead marks where a cut lands. Pieces switched off are left out of the render.',
      split: 'Split here',
      disable: 'Switch off',
      restore: 'Bring back',
      moveLeft: 'Move left',
      moveRight: 'Move right',
      piece: 'Piece',
      empty: 'Every piece is switched off — the render has nothing to write.',
      sourceLength: 'Source footage',
      editedLength: 'After editing',
      zoom: 'Timeline zoom',
    },
    format: {
      title: 'Crop and resolution',
      aspect: 'Aspect ratio',
      resolution: 'Resolution',
      aspects: {
        source: 'Same as source',
        vertical: 'Vertical 9:16 — reels, shorts',
        portrait: 'Portrait 4:5',
        square: 'Square 1:1',
        wide: 'Wide 16:9',
      },
      output: 'Output file',
      cropNote: 'Cropped from the centre — the picture is never stretched.',
    },
    adjust: {
      title: 'Picture, sound and caption',
      brightness: 'Brightness',
      contrast: 'Contrast',
      saturation: 'Saturation',
      speed: 'Speed',
      volume: 'Volume',
      muted: 'Mute the audio',
      caption: 'Caption',
      captionText: 'Caption text',
      captionPosition: 'Position',
      captionStyle: 'Style',
      captionSize: 'Size',
      styles: { plain: 'Shadow', outline: 'Outline', bar: 'Bar' },
      top: 'Top',
      bottom: 'Bottom',
      reset: 'Reset to defaults',
    },
    render: {
      title: 'Render',
      body: 'The pieces you kept are written into a single file.',
      button: 'Render the file',
      working: 'Rendering…',
      stop: 'Stop',
      done: 'File ready',
      download: 'Download the file',
      unavailable: 'This browser does not expose MediaRecorder, so rendering is unavailable. The editor and preview still work.',
      timeWarning: 'Rendering runs in real time: a minute of footage takes about a minute to render. Keep this tab open.',
      progress: 'Rendering progress',
    },
  },
  faq: {
    title: 'Questions and answers',
    items: [
      {
        question: 'Is my video uploaded anywhere?',
        answer: 'No. The file is attached to the player through a blob URL that exists only in this tab. The site is a set of static files — there is no server that could receive anything.',
      },
      {
        question: 'Why does rendering take as long as the video?',
        answer: 'Because the frames genuinely have to pass through the player and the canvas before MediaRecorder writes them. That is the price of rendering without ffmpeg.wasm, which in turn needs COOP/COEP headers that static hosting does not set.',
      },
      {
        question: 'How does the 9:16 crop work?',
        answer: 'The picture is cropped from the centre to the chosen shape, never stretched. On landscape footage that means the sides fall outside the frame — the preview shows exactly what survives.',
      },
      {
        question: 'What format do I get?',
        answer: 'WebM with VP9 or VP8, depending on the browser. It is what MediaRecorder writes natively; every modern browser opens it and most platforms accept it without conversion.',
      },
      {
        question: 'Is my work remembered?',
        answer: 'No. Video cannot sensibly live in browser storage, and saving the cuts without the file would be misleading. Closing the tab ends the session.',
      },
    ],
  },
  footer: { body: 'ReelCut — video editing that runs entirely in your browser.', author: 'Author', code: 'Source code', rights: 'All rights reserved.' },
  common: { skipToContent: 'Skip to content', changeLanguage: 'Change language', openMenu: 'Menu' },
};

export const CONTENT: Record<Locale, Content> = { pl: PL, en: EN };
