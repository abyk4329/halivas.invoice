import type { Metadata } from 'next';
import { Assistant } from 'next/font/google';
import './globals.css';

const assistant = Assistant({
  subsets: ['hebrew'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'חליווס – מערכת ספקים וחשבוניות',
  description: 'ניהול חשבוניות, ספקים ותשלומים לבית העסק חליווס',
  manifest: '/manifest.json',
  icons: [{ rel: 'icon', url: '/favicon.svg' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={assistant.className}>
        <header className="appbar">
          <div className="logo-section">
            <img src="/halivas-logo.png" alt="HALIVAS Logo" className="logo-image" />
            <div className="logo-text">
              <h1>חליווס</h1>
              <p>מערכת ספקים ותשלומים</p>
            </div>
          </div>
          <nav>
            <a href="/">בית</a>
            <a href="/suppliers">ספקים</a>
            <a href="/invoices">חשבוניות</a>
            <a href="/payments">תשלומים</a>
            <a href="/recurring">הוצאות קבועות</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
