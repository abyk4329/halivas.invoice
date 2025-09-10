import Link from 'next/link';

export default function Home() {
  return (
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
  );
}
