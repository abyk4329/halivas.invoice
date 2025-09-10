import Link from 'next/link';

export default function Home() {
  return (
    <>
      <header className="appbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/favicon.svg" alt="חליווס" width={28} height={28} />
          <b>חליווס – מערכת ספקים</b>
        </div>
        <nav style={{ display: 'flex', gap: 8 }}>
          <Link href="/suppliers">ספקים</Link>
          <Link href="/invoices">חשבוניות</Link>
          <Link href="/payments">תשלומים</Link>
          <Link href="/recurring">הוצאות קבועות</Link>
        </nav>
      </header>
      <main>
        <div className="grid cols-3">
          <div className="card">
            <h3>יתרות פתוחות</h3>
            <p>סיכום מהיר של יתרות ספקים שטרם שולמו.</p>
          </div>
          <div className="card">
            <h3>תשלומים קרובים</h3>
            <p>תשלומים עתידיים לפי צ׳קים/אשראי.</p>
          </div>
          <div className="card">
            <h3>הוצאות קבועות</h3>
            <p>בזק, רעות כאבה ועוד – תקציר חודשי.</p>
          </div>
        </div>
      </main>
    </>
  );
}
