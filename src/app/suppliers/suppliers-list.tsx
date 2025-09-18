'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface SuppliersListProps {
  suppliers: any[];
}

export default function SuppliersList({ suppliers }: SuppliersListProps) {
  const router = useRouter();
  const [contactModalOpen, setContactModalOpen] = useState<number | null>(null);

  const handleDeleteSupplier = async (id: number, name: string) => {
    const confirmed = confirm(`האם אתה בטוח שברצונך למחוק את הספק "${name}"?\nפעולה זו אינה ניתנת לביטול.`);
    
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('הספק נמחק בהצלחה');
        router.refresh();
      } else {
        const body = await res.json();
        alert(body.error || 'שגיאה במחיקת הספק');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('שגיאה במחיקת הספק');
    }
  };

  const openContactModal = (supplierId: number) => {
    setContactModalOpen(supplierId);
  };

  const closeContactModal = () => {
    setContactModalOpen(null);
  };

  // חלוקת ספקים לקטגוריות וסידור לפי פעילות
  const categorizeAndSortSuppliers = () => {
    // הוספת כמות חשבוניות לכל ספק (נתון דמה - בפועל יגיע מה-API)
    const suppliersWithActivity = suppliers.map(supplier => ({
      ...supplier,
      invoiceCount: Math.floor(Math.random() * 50) // נתון זמני - צריך להחליף בנתון אמיתי
    }));

    // חלוקה לקטגוריות
    const regular = suppliersWithActivity.filter(s => s.category === 'SUPPLIERS' && s.type !== 'DIRECT_DEBIT' && s.type !== 'FX');
    const directDebit = suppliersWithActivity.filter(s => s.type === 'DIRECT_DEBIT');
    const fx = suppliersWithActivity.filter(s => s.type === 'FX');
    const adhoc = suppliersWithActivity.filter(s => s.category === 'ADHOC');

    // סידור לפי כמות חשבוניות (יורד)
    const sortByActivity = (arr: any[]) => arr.sort((a, b) => b.invoiceCount - a.invoiceCount);

    return {
      regular: sortByActivity(regular),
      directDebit: sortByActivity(directDebit),
      fx: sortByActivity(fx),
      adhoc: sortByActivity(adhoc)
    };
  };

  if (suppliers.length === 0) {
    return (
      <div className="empty-state">
        <p>עדיין לא הוספו ספקים למערכת</p>
        <p className="text-muted">התחילו בהוספת הספק הראשון שלכם</p>
        <Link href="/suppliers/new" className="btn-primary">
          הוספת ספק ראשון
        </Link>
      </div>
    );
  }

  const categorizedSuppliers = categorizeAndSortSuppliers();

  const renderSupplierCard = (supplier: any) => (
    <div key={supplier.id} className="supplier-card-compact glass-panel">
      <div className="supplier-card-main">
        <div className="supplier-info">
          <div className="supplier-name">
            <span className="name">{supplier.name}</span>
            {supplier.taxId && <span className="tax-id">ח.פ: {supplier.taxId}</span>}
          </div>
          <div className="supplier-details">
            <span className="detail">{supplier.subcategory || supplier.category || 'ללא קטגוריה'}</span>
            <span className="separator">•</span>
            <span className="detail">{supplier.paymentMethod || 'ללא אופן תשלום'}</span>
            {supplier.invoiceCount > 0 && (
              <>
                <span className="separator">•</span>
                <span className="activity">{supplier.invoiceCount} חשבוניות</span>
              </>
            )}
          </div>
        </div>
        <div className="supplier-actions">
          {(supplier.contact || supplier.phone || supplier.email) && (
            <button
              className="contact-btn-compact"
              onClick={() => openContactModal(supplier.id)}
              type="button"
              title="פרטי קשר"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </button>
          )}
          <Link 
            href={`/suppliers/edit/${supplier.id}`} 
            className="action-btn-compact edit-btn"
            title="עריכה"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </Link>
          <button
            onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
            className="action-btn-compact delete-btn"
            type="button"
            title="מחיקה"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSection = (title: string, suppliers: any[]) => {
    if (suppliers.length === 0) return null;
    
    return (
      <div className="suppliers-section">
        <h3 className="section-title">{title}</h3>
        <div className="suppliers-grid">
          {suppliers.map(renderSupplierCard)}
        </div>
      </div>
    );
  };

  return (
    <div className="suppliers-container">
      {/* ספקים קבועים */}
      <div className="category-group">
        <h2 className="category-title">ספקים קבועים</h2>
        {renderSection('רגילים', categorizedSuppliers.regular)}
        {renderSection('הוראות קבע', categorizedSuppliers.directDebit)}
        {renderSection('מט״ח', categorizedSuppliers.fx)}
      </div>

      {/* ספקים מזדמנים */}
      {categorizedSuppliers.adhoc.length > 0 && (
        <div className="category-group">
          <h2 className="category-title">ספקים מזדמנים</h2>
          {renderSection('', categorizedSuppliers.adhoc)}
        </div>
      )}

      {/* Contact Modal */}
      {contactModalOpen && (
        <div className="modal-overlay" onClick={closeContactModal}>
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const supplier = suppliers.find(s => s.id === contactModalOpen);
              if (!supplier) return null;
              
              return (
                <>
                  <div className="modal-header">
                    <h3>פרטי קשר - {supplier.name}</h3>
                    <button 
                      className="close-btn" 
                      onClick={closeContactModal}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                  <div className="modal-content">
                    {supplier.contact && (
                      <div className="contact-item">
                        <span className="contact-label">איש קשר:</span>
                        <span>{supplier.contact}</span>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="contact-item">
                        <span className="contact-label">טלפון:</span>
                        <span>{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.email && (
                      <div className="contact-item">
                        <span className="contact-label">מייל:</span>
                        <span>{supplier.email}</span>
                      </div>
                    )}
                    {!supplier.contact && !supplier.phone && !supplier.email && (
                      <div className="no-contact">אין פרטי קשר זמינים</div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );

  if (suppliers.length === 0) {
    return (
      <div className="empty-state">
        <p>עדיין לא הוספו ספקים למערכת</p>
        <p className="text-muted">התחילו בהוספת הספק הראשון שלכם</p>
        <Link href="/suppliers/new" className="btn-primary">
          הוספת ספק ראשון
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* תצוגת טבלה למסכים גדולים */}
      <div className="table-container desktop-only">
        <table className="suppliers-table">
          <thead>
            <tr>
              <th>שם ספק</th>
              <th>פרטי קשר</th>
              <th>קטגוריה</th>
              <th>תת קטגוריה</th>
              <th>סוג</th>
              <th>אופן תשלום</th>
              <th>תנאי תשלום</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier: any) => (
              <tr key={supplier.id} className="supplier-row">
                <td>
                  <div className="supplier-name">
                    <div className="name">{supplier.name}</div>
                    {supplier.taxId && (
                      <div className="tax-id">ח.פ: {supplier.taxId}</div>
                    )}
                  </div>
                </td>
                <td>
                  <button
                    className="contact-btn"
                    onClick={() => openContactModal(supplier.id)}
                    type="button"
                  >
                    פרטי קשר
                  </button>
                </td>
                <td>{supplier.category || '-'}</td>
                <td>{supplier.subcategory || '-'}</td>
                <td>{supplier.type || '-'}</td>
                <td>{supplier.paymentMethod || '-'}</td>
                <td>{supplier.paymentTerms || '-'}</td>
                <td>
                  <div className="actions">
                    <Link 
                      href={`/suppliers/edit/${supplier.id}`} 
                      className="action-btn edit-btn"
                      title="עריכה"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                      className="action-btn delete-btn"
                      type="button"
                      title="מחיקה"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  </div>
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
              <div className="supplier-name">
                <div className="name">{supplier.name}</div>
                {supplier.taxId && (
                  <div className="tax-id">ח.פ: {supplier.taxId}</div>
                )}
              </div>
            </div>
            
            <div className="supplier-card-content">
              <div className="info-row">
                <span className="label">קטגוריה:</span>
                <span>{supplier.category || '-'}</span>
              </div>
              
              <div className="info-row">
                <span className="label">תת קטגוריה:</span>
                <span>{supplier.subcategory || '-'}</span>
              </div>
              
              <div className="info-row">
                <span className="label">סוג:</span>
                <span>{supplier.type || '-'}</span>
              </div>
              
              <div className="info-row">
                <span className="label">אופן תשלום:</span>
                <span>{supplier.paymentMethod || '-'}</span>
              </div>
              
              <div className="contact-section">
                <button
                  className="contact-btn"
                  onClick={() => openContactModal(supplier.id)}
                  type="button"
                >
                  פרטי קשר
                </button>
              </div>
            </div>
            
            <div className="supplier-card-actions">
              <Link 
                href={`/suppliers/edit/${supplier.id}`} 
                className="action-btn edit-btn"
                title="עריכה"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </Link>
              <button
                onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                className="action-btn delete-btn"
                type="button"
                title="מחיקה"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Modal */}
      {contactModalOpen && (
        <div className="modal-overlay" onClick={closeContactModal}>
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const supplier = suppliers.find(s => s.id === contactModalOpen);
              if (!supplier) return null;
              
              return (
                <>
                  <div className="modal-header">
                    <h3>פרטי קשר - {supplier.name}</h3>
                    <button 
                      className="close-btn" 
                      onClick={closeContactModal}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                  <div className="modal-content">
                    {supplier.contact && (
                      <div className="contact-item">
                        <span className="contact-label">איש קשר:</span>
                        <span>{supplier.contact}</span>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="contact-item">
                        <span className="contact-label">טלפון:</span>
                        <span>{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.email && (
                      <div className="contact-item">
                        <span className="contact-label">מייל:</span>
                        <span>{supplier.email}</span>
                      </div>
                    )}
                    {!supplier.contact && !supplier.phone && !supplier.email && (
                      <div className="no-contact">אין פרטי קשר זמינים</div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}
