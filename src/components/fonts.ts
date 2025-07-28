import localFont from "next/font/local";
import { Jersey_10, Roboto } from "next/font/google";

export function getFontClassName(font: string) {
    switch (font) {
        case 'bloxat':
            return bloxat.className;
        case 'arial':
            return arial.className;
        case 'roboto':
            return roboto.className;
        case 'timesNewRoman':
            return timesNewRoman.className;
        default:
            return bloxat.className;
    }
}

export function getFontName(font: string) {
    switch (font) {
        case bloxat.className:
            return 'Bloxat';
        case arial.className:
            return 'Arial';
        case roboto.className:
            return 'Roboto';
        case timesNewRoman.className:
            return 'Times New Roman';
    }
}

export const jersey10 = Jersey_10({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jersey10',
});

export const bloxat = localFont({
  src: '../../public/bloxat.ttf',
  display: 'swap',
});

// Arial font
export const arial = localFont({
  src: '../../public/arial.ttf',
  display: 'swap',
});

// Roboto font
export const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// Times New Roman font
export const timesNewRoman = localFont({
  src: '../../public/times.ttf',
  display: 'swap',
});
