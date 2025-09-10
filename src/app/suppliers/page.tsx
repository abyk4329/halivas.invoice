import SuppliersForm from './suppliers-form';

async function getSuppliers() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/suppliers`,
    {
      // ensure fresh on server
      cache: 'no-store',
    },
  );
  if (!res.ok) return [] as any[];
  return (await res.json()) as any[];
}

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();
  return (
    <main>
      <h1>ספקים</h1>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
