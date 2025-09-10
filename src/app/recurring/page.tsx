import RecurringForm from './recurring-form';

async function getRecurring() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/recurring`,
    { cache: 'no-store' },
  );
  if (!res.ok) return [] as any[];
  return (await res.json()) as any[];
}

export default async function RecurringPage() {
  const rows = await getRecurring();
  return (
    <main>
      <h1>הוצאות קבועות</h1>
      <div className="grid cols-2">
        <div className="card">
          <h3>הוספה</h3>
          <RecurringForm />
        </div>
        <div className="card">
          <h3>רשימה</h3>
          <table>
            <thead>
              <tr>
                <th>ספק</th>
                <th>כותרת</th>
                <th>סכום</th>
                <th>יום בחודש</th>
                <th>פעיל</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.id}>
                  <td>{r.supplier?.name}</td>
                  <td>{r.title}</td>
                  <td>
                    {Number(r.amount).toLocaleString('he-IL', {
                      style: 'currency',
                      currency: 'ILS',
                    })}
                  </td>
                  <td>{r.dayOfMonth}</td>
                  <td>{r.active ? 'כן' : 'לא'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
