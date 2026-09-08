/*
 * Cala tresc serwisu w dwoch jezykach. Uklad jest wspolny — rozni je wylacznie
 * ten obiekt.
 */

import type { Jezyk } from './model';

export type Tresc = {
  jezyk: Jezyk;
  sciezka: string;
  drugiJezyk: { kod: string; etykieta: string; sciezka: string };
  nav: { edytor: string; mozliwosci: string; jak: string; faq: string };
  hero: { naglowek: string; lead: string; cta: string; ctaDrugie: string; znaczniki: string[] };
  zalety: { tytul: string; opis: string }[];
  jak: { tytul: string; wstep: string; kroki: { tytul: string; opis: string }[] };
  edytor: {
    tytul: string;
    wstep: string;
    wczytaj: { naglowek: string; opis: string; przycisk: string; formaty: string; bladFormatu: string };
    transport: { odtworz: string; pauza: string; doPoczatku: string; klatkaWstecz: string; klatkaWPrzod: string };
    os: {
      tytul: string;
      opis: string;
      poczatek: string;
      koniec: string;
      podziel: string;
      usunFragment: string;
      przywroc: string;
      fragment: string;
      pusto: string;
      dlugoscZrodla: string;
      dlugoscMontazu: string;
    };
    korekty: {
      tytul: string;
      jasnosc: string;
      kontrast: string;
      nasycenie: string;
      predkosc: string;
      glosnosc: string;
      wyciszony: string;
      napis: string;
      napisTekst: string;
      napisPozycja: string;
      gora: string;
      dol: string;
      reset: string;
    };
    eksport: {
      tytul: string;
      opis: string;
      przycisk: string;
      wTrakcie: string;
      przerwij: string;
      gotowe: string;
      pobierz: string;
      niedostepny: string;
      ostrzezenieCzas: string;
      postep: string;
    };
  };
  faq: { tytul: string; pozycje: { pytanie: string; odpowiedz: string }[] };
  stopka: { opis: string; autor: string; kod: string; prawa: string };
  wspolne: { przejdzDoTresci: string; zmienJezyk: string };
};

const PL: Tresc = {
  jezyk: 'pl',
  sciezka: '/pl/',
  drugiJezyk: { kod: 'en', etykieta: 'English', sciezka: '/' },
  nav: { edytor: 'Edytor', mozliwosci: 'Możliwości', jak: 'Jak to działa', faq: 'FAQ' },
  hero: {
    naglowek: 'Zmontuj film bez wysyłania go w świat',
    lead: 'Wytnij, poskładaj, popraw obraz i wyrenderuj gotowy plik — wszystko w karcie przeglądarki. Materiał nie opuszcza Twojego dysku, bo nie ma dokąd go wysłać: ten serwis nie ma backendu.',
    cta: 'Otwórz edytor',
    ctaDrugie: 'Zobacz, jak to działa',
    znaczniki: ['Bez wgrywania plików', 'Bez konta', 'Render w przeglądarce'],
  },
  zalety: [
    {
      tytul: 'Plik zostaje u Ciebie',
      opis: 'Materiał trafia do odtwarzacza przez adres blob w pamięci karty. Nie ma serwera, który mógłby go przyjąć — i dlatego nie ma też limitu rozmiaru ani kolejki.',
    },
    {
      tytul: 'Montaż nieniszczący',
      opis: 'Cięcie zapisuje liczby, nie klatki. Usunięty fragment wraca jednym kliknięciem, bo źródło przez cały czas pozostaje nietknięte.',
    },
    {
      tytul: 'Render bez ffmpeg.wasm',
      opis: 'Klatki idą przez płótno do MediaRecordera. Nie trzeba pobierać trzydziestu megabajtów WebAssembly ani nagłówków, których statyczny hosting i tak nie ustawi.',
    },
    {
      tytul: 'Obsługa z klawiatury',
      opis: 'Spacja odtwarza i pauzuje, strzałki przesuwają o klatkę, a każdy suwak ma opisaną wartość — także dla czytnika ekranu.',
    },
  ],
  jak: {
    tytul: 'Jak to działa',
    wstep: 'Cztery kroki od surowego materiału do gotowego pliku.',
    kroki: [
      { tytul: 'Wczytaj materiał', opis: 'Przeciągnij plik albo wybierz go z dysku. Odtwarzacz dostaje adres blob — nic się nie wgrywa.' },
      { tytul: 'Potnij oś czasu', opis: 'Ustaw głowicę i podziel materiał na fragmenty. Niepotrzebne wyłącz — zostaną na osi, na wypadek zmiany zdania.' },
      { tytul: 'Popraw obraz', opis: 'Jasność, kontrast, nasycenie, prędkość i głośność. Do tego napis na górze albo na dole kadru.' },
      { tytul: 'Wyrenderuj plik', opis: 'Render przechodzi przez zachowane fragmenty i zapisuje je do pliku WebM, który od razu pobierzesz.' },
    ],
  },
  edytor: {
    tytul: 'Edytor',
    wstep: 'Materiał zostaje w przeglądarce. Zamknięcie karty kończy pracę — nic nie jest nigdzie zapisywane.',
    wczytaj: {
      naglowek: 'Wczytaj plik wideo',
      opis: 'Przeciągnij plik tutaj albo wybierz go z dysku. Obsługiwane jest wszystko, co potrafi odtworzyć Twoja przeglądarka.',
      przycisk: 'Wybierz plik',
      formaty: 'MP4, WebM, MOV — zależnie od przeglądarki',
      bladFormatu: 'Tej przeglądarce nie udało się odtworzyć tego pliku. Spróbuj z MP4 lub WebM.',
    },
    transport: {
      odtworz: 'Odtwórz',
      pauza: 'Pauza',
      doPoczatku: 'Na początek',
      klatkaWstecz: 'Klatka wstecz',
      klatkaWPrzod: 'Klatka w przód',
    },
    os: {
      tytul: 'Oś czasu',
      opis: 'Głowica wyznacza miejsce cięcia. Wyłączone fragmenty nie trafiają do renderu.',
      poczatek: 'Początek',
      koniec: 'Koniec',
      podziel: 'Podziel w tym miejscu',
      usunFragment: 'Wyłącz fragment',
      przywroc: 'Przywróć fragment',
      fragment: 'Fragment',
      pusto: 'Wszystkie fragmenty są wyłączone — render nie ma czego zapisać.',
      dlugoscZrodla: 'Materiał źródłowy',
      dlugoscMontazu: 'Po montażu',
    },
    korekty: {
      tytul: 'Korekta obrazu i dźwięku',
      jasnosc: 'Jasność',
      kontrast: 'Kontrast',
      nasycenie: 'Nasycenie',
      predkosc: 'Prędkość',
      glosnosc: 'Głośność',
      wyciszony: 'Wycisz dźwięk',
      napis: 'Napis w kadrze',
      napisTekst: 'Treść napisu',
      napisPozycja: 'Pozycja',
      gora: 'Góra',
      dol: 'Dół',
      reset: 'Przywróć domyślne',
    },
    eksport: {
      tytul: 'Render',
      opis: 'Zachowane fragmenty trafiają do jednego pliku WebM.',
      przycisk: 'Renderuj plik',
      wTrakcie: 'Renderowanie…',
      przerwij: 'Przerwij',
      gotowe: 'Plik gotowy',
      pobierz: 'Pobierz plik',
      niedostepny: 'Ta przeglądarka nie udostępnia MediaRecordera — render jest niedostępny. Edytor i podgląd działają normalnie.',
      ostrzezenieCzas: 'Render biegnie w czasie rzeczywistym: minuta materiału to około minuty renderowania. Nie zamykaj karty w trakcie.',
      postep: 'Postęp renderowania',
    },
  },
  faq: {
    tytul: 'Pytania i odpowiedzi',
    pozycje: [
      {
        pytanie: 'Czy mój film gdzieś się wgrywa?',
        odpowiedz: 'Nie. Plik jest podłączany do odtwarzacza przez adres blob, który istnieje wyłącznie w pamięci tej karty. Serwis to zbiór statycznych plików — nie ma serwera, który mógłby cokolwiek przyjąć.',
      },
      {
        pytanie: 'Dlaczego render trwa tyle, ile film?',
        odpowiedz: 'Bo klatki muszą faktycznie przejść przez odtwarzacz i płótno, zanim MediaRecorder je zapisze. To cena renderowania bez ffmpeg.wasm, który z kolei wymaga nagłówków COOP/COEP — a tych statyczny hosting nie ustawia.',
      },
      {
        pytanie: 'W jakim formacie dostanę plik?',
        odpowiedz: 'WebM z kodekiem VP9 lub VP8, zależnie od przeglądarki. To format, który MediaRecorder potrafi zapisać natywnie; odtworzy go każda współczesna przeglądarka i większość odtwarzaczy.',
      },
      {
        pytanie: 'Czy praca zostanie zapamiętana?',
        odpowiedz: 'Nie. Materiału wideo nie da się sensownie trzymać w pamięci przeglądarki, a zapisywanie samych cięć bez pliku byłoby mylące. Zamknięcie karty kończy sesję.',
      },
      {
        pytanie: 'Czy to zastąpi program do montażu?',
        odpowiedz: 'Nie i nie taki jest cel. To narzędzie do szybkiego przycięcia i poprawienia jednego materiału — bez instalacji i bez wysyłania pliku do cudzej chmury.',
      },
    ],
  },
  stopka: {
    opis: 'ReelCut — montaż wideo działający w całości w przeglądarce.',
    autor: 'Autor',
    kod: 'Kod źródłowy',
    prawa: 'Wszelkie prawa zastrzeżone.',
  },
  wspolne: { przejdzDoTresci: 'Przejdź do treści', zmienJezyk: 'Zmień język' },
};

const EN: Tresc = {
  jezyk: 'en',
  sciezka: '/',
  drugiJezyk: { kod: 'pl', etykieta: 'Polski', sciezka: '/pl/' },
  nav: { edytor: 'Editor', mozliwosci: 'Features', jak: 'How it works', faq: 'FAQ' },
  hero: {
    naglowek: 'Edit a video without sending it anywhere',
    lead: 'Cut, arrange, adjust the picture and render a finished file — all inside a browser tab. Your footage never leaves your disk, because there is nowhere to send it: this site has no backend.',
    cta: 'Open the editor',
    ctaDrugie: 'See how it works',
    znaczniki: ['No uploads', 'No account', 'Rendered in the browser'],
  },
  zalety: [
    {
      tytul: 'The file stays with you',
      opis: 'Footage reaches the player through a blob URL held in this tab. There is no server to receive it — which is also why there is no size limit and no queue.',
    },
    {
      tytul: 'Non-destructive editing',
      opis: 'A cut stores numbers, not frames. A discarded piece comes back with one click, because the source is never touched.',
    },
    {
      tytul: 'Rendering without ffmpeg.wasm',
      opis: 'Frames travel through a canvas into MediaRecorder. No thirty-megabyte WebAssembly download, and no COOP/COEP headers that static hosting cannot set anyway.',
    },
    {
      tytul: 'Operable from the keyboard',
      opis: 'Space plays and pauses, arrows step a frame at a time, and every slider announces its value — screen readers included.',
    },
  ],
  jak: {
    tytul: 'How it works',
    wstep: 'Four steps from raw footage to a finished file.',
    kroki: [
      { tytul: 'Load the footage', opis: 'Drop a file or pick one from disk. The player gets a blob URL — nothing is uploaded.' },
      { tytul: 'Cut the timeline', opis: 'Position the playhead and split the footage into pieces. Switch off what you do not need; it stays on the timeline in case you change your mind.' },
      { tytul: 'Adjust the picture', opis: 'Brightness, contrast, saturation, speed and volume, plus a caption at the top or bottom of the frame.' },
      { tytul: 'Render the file', opis: 'The render walks through the pieces you kept and writes them into a WebM file you can download straight away.' },
    ],
  },
  edytor: {
    tytul: 'Editor',
    wstep: 'The footage stays in your browser. Closing the tab ends the session — nothing is stored anywhere.',
    wczytaj: {
      naglowek: 'Load a video file',
      opis: 'Drop a file here or pick one from disk. Anything your browser can play will work.',
      przycisk: 'Choose a file',
      formaty: 'MP4, WebM, MOV — depending on the browser',
      bladFormatu: 'This browser could not play that file. Try MP4 or WebM.',
    },
    transport: {
      odtworz: 'Play',
      pauza: 'Pause',
      doPoczatku: 'Back to start',
      klatkaWstecz: 'Previous frame',
      klatkaWPrzod: 'Next frame',
    },
    os: {
      tytul: 'Timeline',
      opis: 'The playhead marks where a cut lands. Pieces switched off are left out of the render.',
      poczatek: 'Start',
      koniec: 'End',
      podziel: 'Split here',
      usunFragment: 'Switch off',
      przywroc: 'Bring back',
      fragment: 'Piece',
      pusto: 'Every piece is switched off — the render has nothing to write.',
      dlugoscZrodla: 'Source footage',
      dlugoscMontazu: 'After editing',
    },
    korekty: {
      tytul: 'Picture and sound',
      jasnosc: 'Brightness',
      kontrast: 'Contrast',
      nasycenie: 'Saturation',
      predkosc: 'Speed',
      glosnosc: 'Volume',
      wyciszony: 'Mute the audio',
      napis: 'Caption',
      napisTekst: 'Caption text',
      napisPozycja: 'Position',
      gora: 'Top',
      dol: 'Bottom',
      reset: 'Reset to defaults',
    },
    eksport: {
      tytul: 'Render',
      opis: 'The pieces you kept are written into a single WebM file.',
      przycisk: 'Render the file',
      wTrakcie: 'Rendering…',
      przerwij: 'Stop',
      gotowe: 'File ready',
      pobierz: 'Download the file',
      niedostepny: 'This browser does not expose MediaRecorder, so rendering is unavailable. The editor and preview still work.',
      ostrzezenieCzas: 'Rendering runs in real time: a minute of footage takes about a minute to render. Keep this tab open.',
      postep: 'Rendering progress',
    },
  },
  faq: {
    tytul: 'Questions and answers',
    pozycje: [
      {
        pytanie: 'Is my video uploaded anywhere?',
        odpowiedz: 'No. The file is attached to the player through a blob URL that exists only in this tab. The site is a set of static files — there is no server that could receive anything.',
      },
      {
        pytanie: 'Why does rendering take as long as the video?',
        odpowiedz: 'Because the frames genuinely have to pass through the player and the canvas before MediaRecorder writes them. That is the price of rendering without ffmpeg.wasm, which in turn needs COOP/COEP headers that static hosting does not set.',
      },
      {
        pytanie: 'What format do I get?',
        odpowiedz: 'WebM with VP9 or VP8, depending on the browser. It is what MediaRecorder writes natively; every modern browser and most players open it.',
      },
      {
        pytanie: 'Is my work remembered?',
        odpowiedz: 'No. Video cannot sensibly live in browser storage, and saving the cuts without the file would be misleading. Closing the tab ends the session.',
      },
      {
        pytanie: 'Does this replace a real editing suite?',
        odpowiedz: 'No, and it is not meant to. It is for trimming and tidying a single clip quickly — with nothing to install and no upload to somebody else’s cloud.',
      },
    ],
  },
  stopka: {
    opis: 'ReelCut — video editing that runs entirely in your browser.',
    autor: 'Author',
    kod: 'Source code',
    prawa: 'All rights reserved.',
  },
  wspolne: { przejdzDoTresci: 'Skip to content', zmienJezyk: 'Change language' },
};

export const TRESC: Record<Jezyk, Tresc> = { pl: PL, en: EN };
