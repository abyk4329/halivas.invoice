import SuppliersForm from './suppliers-form';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

function getBaseUrl() {
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return env;
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

async function getSuppliers() {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/suppliers`, {
      cache: 'no-store',
    });
    if (!res.ok) return [] as any[];
    return (await res.json()) as any[];
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    return [] as any[];
  }
}

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();
  
  return (
    <main className="suppliers-page">
      <div className="page-header">
        <h1>ספקים</h1>
        <p>ניהול מידע ספקים ומעקב יתרות</p>
      </div>

      <div className="suppliers-layout">
        {/* הוספת ספק */}
        <div className="suppliers-form-section">
          <div className="card">
            <h3>הוספת ספק חדש</h3>
            <SuppliersForm />
          </div>
        </div>

        {/* רשימת ספקים */}
        <div className="suppliers-list-section">
          <div className="card">
            <div className="list-header">
              <h3>רשימת ספקים</h3>
              <span className="count">({suppliers.length} ספקים)</span>
            </div>
            
            {suppliers.length === 0 ? (
              <div className="empty-state">
                <p>עדיין לא הוספו ספקים למערכת</p>
                <p className="text-muted">התחילו בהוספת הספק הראשון שלכם</p>
              </div>
            ) : (
              <>
                {/* תצוגת טבלה למסכים גדולים */}
                <div className="table-container desktop-only">
                  <table className="suppliers-table">
                    <thead>
                      <tr>
                        <th>שם הספק</th>
                        <th>פרטי קשר</th>
                        <th>סטטוס</th>
                        <th>יתרה פתוחה</th>
                        <th>שולם השנה</th>
                        <th>סה&quot;כ הוצאות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map((supplier: any) => (
                        <tr key={supplier.id}>
                          <td>
                            <div className="supplier-name">
                              <strong>{supplier.name}</strong>
                              {supplier.taxId && (
                                <small className="tax-id">ח.פ: {supplier.taxId}</small>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="contact-info">
                              {supplier.phone && <div>{supplier.phone}</div>}
                              {supplier.email && <div className="email">{supplier.email}</div>}
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${supplier.status?.toLowerCase()}`}>
                              {supplier.status === 'ACTIVE' ? 'פעיל' : 'לא פעיל'}
                            </span>
                          </td>
                          <td className="amount">
                            {(supplier.balance ?? 0).toLocaleString('he-IL', {
                              style: 'currency',
                              currency: 'ILS',
                            })}
                          </td>
                          <td className="amount">
                            {(supplier.paidThisYear ?? 0).toLocaleString('he-IL', {
                              style: 'currency',
                              currency: 'ILS',
                            })}
                          </td>
                          <td className="amount">
                            {(supplier.expenseThisYear ?? 0).toLocaleString('he-IL', {
                              style: 'currency',
                              currency: 'ILS',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* תצוגת כרטיסים למובייל וטאבלט */}
                <div className="suppliers-cards mobile-tablet-only">
                  {suppliers.map((supplier: any) => (
                    <div key={supplier.id} className="supplier-card">
                      <div className="supplier-card-header">
                        <h4>{supplier.name}</h4>
                        <span className={`status-badge ${supplier.status?.toLowerCase()}`}>
                          {supplier.status === 'ACTIVE' ? 'פעיל' : 'לא פעיל'}
                        </span>
                      </div>
                      
                      <div className="supplier-card-content">
                        {(supplier.phone || supplier.email) && (
                          <div className="contact-section">
                            {supplier.phone && <div>📞 {supplier.phone}</div>}
                            {supplier.email && <div>✉️ {supplier.email}</div>}
                          </div>
                        )}
                        
                        <div className="financial-section">
                          <div className="financial-item">
                            <span className="label">יתרה פתוחה:</span>
                            <span className="amount">
                              {(supplier.balance ?? 0).toLocaleString('he-IL', {
                                style: 'currency',
                                currency: 'ILS',
                              })}
                            </span>
                          </div>
                          <div className="financial-item">
                            <span className="label">שולם השנה:</span>
                            <span className="amount">
                              {(supplier.paidThisYear ?? 0).toLocaleString('he-IL', {
                                style: 'currency',
                                currency: 'ILS',
                              })}
                            </span>
                          </div>
                          <div className="financial-item">
                            <span className="label">סה&quot;כ הוצאות:</span>
                            <span className="amount">
                              {(supplier.expenseThisYear ?? 0).toLocaleString('he-IL', {
                                style: 'currency',
                                currency: 'ILS',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
