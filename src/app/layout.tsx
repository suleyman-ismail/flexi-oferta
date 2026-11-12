import type { Metadata, Viewport } from 'next';
import './globals.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const viewport: Viewport = {
  themeColor: '#1B365D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Flexi Home | ОФЕРТА Studio — „С 1 ТРЕЙД“ ЕООД (flexi-home.eu)',
  description:
    'Official Bulgarian & English 4-Page Offer (ОФЕРТА) Builder and Vector PDF Generator for Flexi Home (flexi-home.eu / „С 1 ТРЕЙД“ ЕООД) prefabricated and steel frame homes.',
  metadataBase: new URL('https://suleyman-ismail.github.io'),
  manifest: `${basePath}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Flexi Оферта',
  },
  icons: {
    icon: `${basePath}/icon-192.png`,
    apple: `${basePath}/icon-180.png`,
  },
  openGraph: {
    title: 'Flexi Home | ОФЕРТА Studio — „С 1 ТРЕЙД“ ЕООД',
    description:
      'Generate official 4-page A4 Bulgarian & English quotes (ОФЕРТА) with live preview and vector PDF export.',
    url: 'https://suleyman-ismail.github.io/flexi-oferta/',
    siteName: 'Flexi Home ОФЕРТА Studio',
    locale: 'bg_BG',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg" suppressHydrationWarning>
      <body className="antialiased selection:bg-indigo-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
