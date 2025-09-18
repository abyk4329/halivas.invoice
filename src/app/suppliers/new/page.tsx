import SuppliersForm from '../suppliers-form';
import Link from 'next/link';

export default function NewSupplierPage() {
  return (
    <main className="new-supplier-page">
      <div className="page-header">
        <h1>הוספת ספק חדש</h1>
        <p>מלא את הפרטים הנדרשים להוספת ספק חדש למערכת</p>
      </div>

      <div className="new-supplier-content">
        <div className="navigation-back">
          <Link href="/suppliers" className="btn-secondary">
            ← חזרה לרשימת ספקים
          </Link>
        </div>

        <div className="form-container">
          <div className="card">
            <h3>פרטי הספק</h3>
            <SuppliersForm />
          </div>
        </div>
      </div>
    </main>
  );
}
