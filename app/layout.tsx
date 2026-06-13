import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

// Funnel Display — display / headings (variable, 300–800)
const funnelDisplay = localFont({
  src: './fonts/FunnelDisplay-VariableFont_wght.ttf',
  weight: '300 800',
  variable: '--font-head',
  display: 'swap',
});

// Stack Sans Text — UI labels, body, prices, captions (variable, 200–700)
const stackSans = localFont({
  src: './fonts/StackSansText-VariableFont_wght.ttf',
  weight: '200 700',
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Novatek — Tech accessories in Sri Lanka',
  description: 'Tech accessories in Sri Lanka — earbuds, chargers, power banks, holders and cables. Pay on delivery, order on WhatsApp.',
  metadataBase: new URL('https://novatek.lk'),
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    siteName: 'Novatek',
    locale: 'en_LK',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#F7F8FA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${funnelDisplay.variable} ${stackSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
