import type { Metadata } from 'next';
import { Assistant } from 'next/font/google';
import './globals.css';

const assistant = Assistant({
  subsets: ['hebrew'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'חליווס – מערכת ניהול ספקים',
  description: 'מעצבים לכם את הבית - מערכת ניהול ספקים, חשבוניות ותשלומים',
  manifest: '/manifest.json',
  keywords: ['ספקים', 'חשבוניות', 'תשלומים', 'ניהול עסק', 'חליווס'],
  themeColor: '#373737',
  icons: {
    icon: [
      { url: '/HBiconfavicon.svg', type: 'image/svg+xml' },
  { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
  { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
  { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  { url: '/apple-touch-icon-167x167.png', sizes: '167x167', type: 'image/png' },
  { url: '/apple-touch-icon-152x152.png', sizes: '152x152', type: 'image/png' },
  { url: '/apple-touch-icon-120x120.png', sizes: '120x120', type: 'image/png' },
    ],
    shortcut: ['/HBiconfavicon.svg'],
  },
  openGraph: {
    title: 'חליווס | מעצבים לכם את הבית',
    description: 'מערכת ניהול ספקים',
    type: 'website',
    locale: 'he_IL',
    siteName: 'חליווס',
  images: [],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'חליווס | מעצבים לכם את הבית',
    description: 'מערכת ניהול ספקים',
  images: [],
  },
  appleWebApp: {
    capable: true,
  // Use translucent so the page background shows through the iOS status bar
  statusBarStyle: 'black-translucent',
    title: 'חליווס',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={assistant.className}>
  {/* iOS status bar safe-area with footer/chrome color */}
  <div className="ios-statusbar" />
        <header className="appbar">
          <div className="logo-section">
            <img src="/HalivasBrand.png" alt="HALIVAS Logo" className="logo-image" />
          </div>
          <nav>
            <a href="/">בית</a>
            <a href="/suppliers">ספקים</a>
            <a href="/invoices">חשבוניות</a>
            <a href="/payments">תשלומים</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
