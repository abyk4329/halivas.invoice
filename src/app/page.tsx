import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">מערכת ניהול חליווס</h1>
          <p className="hero-subtitle">פלטפורמה מתקדמת לניהול ספקים, חשבוניות ותשלומים</p>
        </div>
      </div>
      
      <div className="features-grid">
        <Link href="/suppliers" className="feature-card">
          <div className="feature-icon suppliers"></div>
          <div className="feature-content">
            <h3 className="feature-title">ספקים</h3>
            <p className="feature-description">ניהול מקצועי של פרטי ספקים ומעקב יתרות פתוחות</p>
          </div>
          <div className="feature-action">צפה בספקים</div>
        </Link>
        
        <Link href="/invoices" className="feature-card">
          <div className="feature-icon invoices"></div>
          <div className="feature-content">
            <h3 className="feature-title">חשבוניות</h3>
            <p className="feature-description">יצירת חשבוניות דיגיטליות ומעקב סטטוס תשלומים</p>
          </div>
          <div className="feature-action">נהל חשבוניות</div>
        </Link>
        
        <Link href="/payments" className="feature-card">
          <div className="feature-icon payments"></div>
          <div className="feature-content">
            <h3 className="feature-title">תשלומים</h3>
            <p className="feature-description">רישום תשלומים, שיוך לחשבוניות ודוחות מפורטים</p>
          </div>
          <div className="feature-action">רשום תשלום</div>
        </Link>
      </div>
      
      <div className="secondary-grid">
        <Link href="/recurring" className="secondary-card">
          <div className="secondary-content">
            <h4 className="secondary-title">הוצאות קבועות</h4>
            <p className="secondary-description">ניהול אוטומטי של הוצאות חודשיות ותזכורות</p>
          </div>
        </Link>
        
        <div className="secondary-card premium">
          <div className="secondary-content">
            <h4 className="secondary-title">דוחות ואנליטיקה</h4>
            <p className="secondary-description">תובנות עסקיות מתקדמות ודוחות מפורטים</p>
            <span className="premium-badge">בקרוב</span>
          </div>
        </div>
      </div>
    </main>
  );
}
