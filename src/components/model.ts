/*
 * Model projektu montazowego.
 *
 * Material zrodlowy nigdy nie jest modyfikowany — projekt opisuje wylacznie,
 * ktore fragmenty zachowac i jak je pokazac. Dzieki temu cofniecie ciecia
 * polega na przywroceniu liczby, a nie na odzyskiwaniu klatek.
 */

export type Jezyk = 'pl' | 'en';

/** Fragment materialu zrodlowego, w sekundach. */
export type Segment = {
  id: string;
  od: number;
  do: number;
  /* Wylaczony fragment zostaje na osi, ale nie trafia do renderu — dzieki temu
     cofniecie decyzji to jedno klikniecie, a nie ponowne ciecie. */
  aktywny: boolean;
};

export type Korekty = {
  jasnosc: number; // 0.5 - 1.5
  kontrast: number; // 0.5 - 1.5
  nasycenie: number; // 0 - 2
  predkosc: number; // 0.5 - 2
  glosnosc: number; // 0 - 1
  wyciszony: boolean;
};

export type Napis = {
  tekst: string;
  pozycja: 'gora' | 'dol';
};

export const KOREKTY_STARTOWE: Korekty = {
  jasnosc: 1,
  kontrast: 1,
  nasycenie: 1,
  predkosc: 1,
  glosnosc: 1,
  wyciszony: false,
};

export function nowyId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** mm:ss.d — dziesiate czesci sekundy, bo przy cieciu licza sie klatki. */
export function czas(sekundy: number): string {
  if (!Number.isFinite(sekundy) || sekundy < 0) return '0:00.0';
  const m = Math.floor(sekundy / 60);
  const s = Math.floor(sekundy % 60);
  const d = Math.floor((sekundy % 1) * 10);
  return `${m}:${String(s).padStart(2, '0')}.${d}`;
}

/** Fragmenty, ktore faktycznie trafia do renderu. */
export function aktywne(segmenty: Segment[]): Segment[] {
  return segmenty.filter((s) => s.aktywny && s.do > s.od);
}

/** Laczny czas materialu wynikowego, z uwzglednieniem predkosci odtwarzania. */
export function dlugoscMontazu(segmenty: Segment[], predkosc: number): number {
  const suma = aktywne(segmenty).reduce((acc, s) => acc + Math.max(0, s.do - s.od), 0);
  return predkosc > 0 ? suma / predkosc : suma;
}

/**
 * Dzieli segment w podanym punkcie.
 * Punkt poza segmentem albo zbyt blisko krawedzi nie tworzy pustego fragmentu.
 */
export function podziel(segmenty: Segment[], czasCiecia: number, minimum = 0.1): Segment[] {
  const wynik: Segment[] = [];
  for (const s of segmenty) {
    const wSrodku = czasCiecia > s.od + minimum && czasCiecia < s.do - minimum;
    if (wSrodku) {
      wynik.push({ id: nowyId(), od: s.od, do: czasCiecia, aktywny: s.aktywny });
      wynik.push({ id: nowyId(), od: czasCiecia, do: s.do, aktywny: s.aktywny });
    } else {
      wynik.push(s);
    }
  }
  return wynik;
}

/** Filtr CSS/canvas budowany z korekt — jedno zrodlo dla podgladu i eksportu. */
export function filtrCSS(korekty: Korekty): string {
  return `brightness(${korekty.jasnosc}) contrast(${korekty.kontrast}) saturate(${korekty.nasycenie})`;
}

/**
 * Przelicza pozycje w materiale wynikowym na pozycje w zrodle.
 * Uzywane przez podglad, ktory odtwarza sekwencje segmentow jako calosc.
 */
export function pozycjaWZrodle(segmenty: Segment[], pozycjaWynikowa: number): { indeks: number; czas: number } | null {
  let pozostalo = pozycjaWynikowa;
  for (let i = 0; i < segmenty.length; i++) {
    const dlugosc = segmenty[i].do - segmenty[i].od;
    if (pozostalo <= dlugosc) {
      return { indeks: i, czas: segmenty[i].od + pozostalo };
    }
    pozostalo -= dlugosc;
  }
  return null;
}

/** Rozmiar plikow w postaci czytelnej dla czlowieka. */
export function rozmiar(bajty: number): string {
  if (bajty < 1024) return `${bajty} B`;
  if (bajty < 1024 * 1024) return `${(bajty / 1024).toFixed(0)} KB`;
  return `${(bajty / (1024 * 1024)).toFixed(1)} MB`;
}
