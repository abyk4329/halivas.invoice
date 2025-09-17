import NewPaymentForm from './payment-form';
import { Suspense } from 'react';
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

async function getPayments(params: { year?: number } = {}) {
  try {
    const baseUrl = getBaseUrl();
  const qs = new URLSearchParams();
  if (params.year) qs.set('year', String(params.year));
  const res = await fetch(`${baseUrl}/api/payments${qs.size ? `?${qs.toString()}` : ''}`, { cache: 'no-store' });
    if (!res.ok) return [] as any[];
    return (await res.json()) as any[];
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return [] as any[];
  }
}

export default async function PaymentsPage() {
  const year = new Date().getFullYear();
  const payments = await getPayments({ year });
  return (
    <main>
      <h1>תשלומים</h1>
      <div className="grid cols-2">
        <div className="card">
          <h3>תשלום חדש</h3>
          <Suspense>
            <NewPaymentForm />
          </Suspense>
        </div>
        <div className="card">
          <h3>רשימת תשלומים</h3>
          <table>
            <thead>
              <tr>
                <th>תאריך</th>
                <th>ספק</th>
                <th>סכום</th>
                <th>שיטה</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: any) => (
                <tr key={p.id}>
                  <td>{new Date(p.date).toLocaleDateString('he-IL')}</td>
                  <td>{p.supplier?.name}</td>
                  <td>
                    {Number(p.amount).toLocaleString('he-IL', {
                      style: 'currency',
                      currency: p.currency || 'ILS',
                    })}
                  </td>
                  <td>{p.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
