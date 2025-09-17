import RecurringForm from './recurring-form';

export const dynamic = 'force-dynamic';

async function getRecurring() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const res = await fetch(`${baseUrl}/api/recurring`, { cache: 'no-store' });
    if (!res.ok) return [] as any[];
    return (await res.json()) as any[];
  } catch (error) {
    console.error('Failed to fetch recurring:', error);
    return [] as any[];
  }
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
          <div style={{ marginTop: 12 }}>
            <form
              action={async () => {
                'use server';
              }}
            >
              <button
                className="primary"
                formAction={async () => {
                  'use server';
                  const now = new Date();
                  const year = now.getFullYear();
                  const month = now.getMonth() + 1;
                  await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/recurring/generate?year=${year}&month=${month}`,
                    { method: 'POST' },
                  );
                }}
                style={{ marginTop: 8 }}
              >
                יצירת חיובי חודש
              </button>
            </form>
          </div>
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
