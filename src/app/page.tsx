import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <div className="text-center" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text)', margin: '0 0 8px 0' }}>
          ברוכים הבאים למערכת חליווס
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          ניהול חכם של ספקים, חשבוניות ותשלומים
        </p>
      </div>
      
      <div className="grid cols-3">
        <Link href="/suppliers" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>🏢 ספקים</h3>
          <p>ניהול פרטי ספקים ומעקב יתרות. הוספה, עריכה ומחיקה של ספקים.</p>
          <div style={{ marginTop: '16px', color: 'var(--color-primary)', fontWeight: '500' }}>
            לחץ לניהול ספקים ←
          </div>
        </Link>
        
        <Link href="/invoices" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>🧾 חשבוניות</h3>
          <p>יצירת חשבוניות חדשות, מעקב סטטוס ויתרות לתשלום.</p>
          <div style={{ marginTop: '16px', color: 'var(--color-primary)', fontWeight: '500' }}>
            לחץ לניהול חשבוניות ←
          </div>
        </Link>
        
        <Link href="/payments" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>💳 תשלומים</h3>
          <p>רישום תשלומים, שיוך לחשבוניות ומעקב אחר כל העסקאות.</p>
          <div style={{ marginTop: '16px', color: 'var(--color-primary)', fontWeight: '500' }}>
            לחץ לניהול תשלומים ←
          </div>
        </Link>
      </div>
      
      <div className="grid cols-2" style={{ marginTop: '24px' }}>
        <Link href="/recurring" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>📅 הוצאות קבועות</h3>
          <p>ניהול הוצאות חודשיות קבועות כמו חשמל, מים, טלפון וכו׳.</p>
          <div style={{ marginTop: '16px', color: 'var(--color-primary)', fontWeight: '500' }}>
            לחץ לניהול הוצאות ←
          </div>
        </Link>
        
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', color: 'white' }}>
          <h3>📊 סטטיסטיקות</h3>
          <p style={{ color: 'rgba(255,255,255,0.9)' }}>צפה בדוחות והתקדמות העסק שלך.</p>
          <div style={{ marginTop: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
            בקרוב...
          </div>
        </div>
      </div>
    </main>
  );
}
