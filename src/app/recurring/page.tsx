import RecurringForm from './recurring-form';
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

async function getRecurring() {
  try {
    const baseUrl = getBaseUrl();
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
                  const base = getBaseUrl();
                  await fetch(`${base}/api/recurring/generate?year=${year}&month=${month}`,
                    { method: 'POST' });
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
