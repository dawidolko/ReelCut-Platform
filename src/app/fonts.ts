import { Space_Grotesk, Inter } from 'next/font/google';

/*
 * Fetched at build time and served from the site itself. Only the latin subset
 * is preloaded; latin-ext stays declared, so Polish glyphs load on demand.
 */
const display = Space_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-space-grotesk' });
const body = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const fontVariables = `${display.variable} ${body.variable}`;
