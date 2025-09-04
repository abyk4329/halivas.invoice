import NewInvoiceForm from './new-invoice-form';

async function getInvoices() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/invoices`, { cache: 'no-store' });
  if (!res.ok) return [] as any[];
  return (await res.json()) as any[];
}

export default async function InvoicesPage() {
  const invoices = await getInvoices();
  return (
    <main>
      <h1>חשבוניות</h1>
      <div className="grid cols-2">
        <div className="card">
          <h3>חשבונית חדשה</h3>
          <NewInvoiceForm />
        </div>
        <div className="card">
          <h3>רשימת חשבוניות</h3>
          <table>
            <thead>
              <tr>
                <th>תאריך</th>
                <th>ספק</th>
                <th>מס׳ חשבונית</th>
                <th>סה"כ</th>
                <th>יתרה</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: any) => (
                <tr key={inv.id}>
                  <td>{new Date(inv.date).toLocaleDateString('he-IL')}</td>
                  <td>{inv.supplier?.name}</td>
                  <td>{inv.number}</td>
                  <td>{Number(inv.total).toLocaleString('he-IL', { style: 'currency', currency: inv.currency || 'ILS' })}</td>
                  <td>{Number(inv.balance ?? 0).toLocaleString('he-IL', { style: 'currency', currency: inv.currency || 'ILS' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
