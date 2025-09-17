import SuppliersForm from './suppliers-form';

async function getSuppliers(params: { q?: string; status?: string; subcategory?: string; year?: number } = {}) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.status) qs.set('status', params.status);
  if (params.subcategory) qs.set('subcategory', params.subcategory);
  if (params.year) qs.set('year', String(params.year));
  const res = await fetch(`${baseUrl}/api/suppliers${qs.size ? `?${qs.toString()}` : ''}`, {
      // ensure fresh on server
      cache: 'no-store',
    });
    if (!res.ok) return [] as any[];
    return (await res.json()) as any[];
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    return [] as any[];
  }
}

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const year = Number(searchParams?.year || new Date().getFullYear());
  const q = (searchParams?.q as string) || '';
  const status = (searchParams?.status as string) || '';
  const subcategory = (searchParams?.subcategory as string) || '';
  const suppliers = await getSuppliers({ year, q, status, subcategory });
  return (
    <main>
      <h1>ספקים</h1>
      <form method="GET" className="card" style={{ marginBottom: 12 }}>
        <div className="grid cols-3">
          <label>
            חיפוש
            <input name="q" defaultValue={q} placeholder="שם ספק" />
          </label>
          <label>
            סטטוס
            <select name="status" defaultValue={status}>
              <option value="">הכל</option>
              <option value="ACTIVE">פעיל</option>
              <option value="INACTIVE">לא פעיל</option>
            </select>
          </label>
          <label>
            תת-קטגוריה
            <select name="subcategory" defaultValue={subcategory}>
              <option value="">הכל</option>
              <option value="MATERIALS">חומרים</option>
              <option value="SERVICES">שירותים</option>
              <option value="SOFTWARE_SYSTEMS">מערכות ותוכנות</option>
              <option value="OFFICE_EQUIPMENT">ציוד ומשרדי</option>
              <option value="SUBCONTRACTOR">קבלן משנה</option>
              <option value="MARKETING">שיווק ופרסום</option>
              <option value="FOOD_BEVERAGE">מזון ומשקאות</option>
              <option value="ENERGY_INFRA">אנרגיה ותשתיות</option>
              <option value="PROPERTY_SERVICES">שירותי נכס</option>
              <option value="MAINTENANCE">תחזוקה</option>
              <option value="GENERAL">כללי</option>
              <option value="VEHICLE">רכב</option>
              <option value="LOGISTICS">הובלות</option>
            </select>
          </label>
        </div>
        <div style={{ marginTop: 8 }}>
          <button className="primary" type="submit">סינון</button>
        </div>
      </form>
      <div className="grid cols-2">
        <div className="card">
          <h3>הוספת ספק</h3>
          <SuppliersForm />
        </div>
        <div className="card">
          <h3>רשימת ספקים</h3>
          <table>
            <thead>
              <tr>
                <th>שם</th>
                <th>טלפון</th>
                <th>אימייל</th>
                <th>יתרה</th>
                <th>שולם השנה</th>
                <th>הוצאות השנה</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s: any) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.phone || '-'}</td>
                  <td>{s.email || '-'}</td>
                  <td>
                    {(s.balance ?? 0).toLocaleString('he-IL', {
                      style: 'currency',
                      currency: 'ILS',
                    })}
                  </td>
                  <td>
                    {(s.paidThisYear ?? 0).toLocaleString('he-IL', {
                      style: 'currency',
                      currency: 'ILS',
                    })}
                  </td>
                  <td>
                    {(s.expenseThisYear ?? 0).toLocaleString('he-IL', {
                      style: 'currency',
                      currency: 'ILS',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
