import NewPaymentForm from './payment-form';

async function getPayments() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const res = await fetch(`${baseUrl}/api/payments`, { cache: 'no-store' });
    if (!res.ok) return [] as any[];
    return (await res.json()) as any[];
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return [] as any[];
  }
}

export default async function PaymentsPage() {
  const payments = await getPayments();
  return (
    <main>
      <h1>תשלומים</h1>
      <div className="grid cols-2">
        <div className="card">
          <h3>תשלום חדש</h3>
          <NewPaymentForm />
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
