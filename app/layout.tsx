import type { Metadata } from 'next';
import { Space_Grotesk, Manrope, Space_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-head',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Novatek — Tech accessories in Sri Lanka',
  description: 'Tech accessories in Sri Lanka — earbuds, chargers, power banks, holders and cables. Pay on delivery, order on WhatsApp.',
  metadataBase: new URL('https://novatek.lk'), // TODO: confirm real domain
  openGraph: {
    siteName: 'Novatek',
    locale: 'en_LK',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${manrope.variable} ${spaceMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
