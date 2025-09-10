'use client';
import { useEffect, useMemo, useState } from 'react';

type Supplier = { id: number; name: string };
type Invoice = {
  id: number;
  number: string;
  supplierId: number;
  total: number;
  allocations: { amount: number }[];
};

export default function PaymentsForm() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [form, setForm] = useState({
    supplierId: 0,
    date: new Date().toISOString().slice(0, 10),
    method: 'CASH',
    amount: 0,
    reference: '',
  });
  const [allocs, setAllocs] = useState<{ invoiceId: number; amount: number }[]>(
    [],
  );

  useEffect(() => {
    fetch('/api/suppliers')
      .then((r) => r.json())
      .then(setSuppliers);
  }, []);
  useEffect(() => {
    if (!form.supplierId) return;
    fetch(`/api/invoices?supplierId=${form.supplierId}`)
      .then((r) => r.json())
      .then((data: any[]) => {
        setInvoices(data);
        setAllocs(data.map((inv) => ({ invoiceId: inv.id, amount: 0 })));
      });
  }, [form.supplierId]);

  const balances = useMemo(
    () =>
      Object.fromEntries(
        invoices.map((inv) => {
          const paid = (inv.allocations || []).reduce(
            (s, a) => s + Number(a.amount),
            0,
          );
          return [inv.id, Number(inv.total) - paid];
        }),
      ),
    [invoices],
  );

  const updateAlloc = (invoiceId: number, amount: number) => {
    setAllocs((prev) =>
      prev.map((a) => (a.invoiceId === invoiceId ? { ...a, amount } : a)),
    );
  };

  const submit = async () => {
    if (!form.supplierId) return alert('נא לבחור ספק');
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierId: Number(form.supplierId),
        date: form.date,
        method: form.method,
        amount: Number(form.amount),
        reference: form.reference || undefined,
        allocations: allocs.filter((a) => a.amount > 0),
      }),
    });
    if (res.ok) location.reload();
    else alert('שגיאה בשמירת תשלום');
  };

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="grid cols-3">
        <label>
          ספק
          <select
            value={form.supplierId}
            onChange={(e) =>
              setForm((f) => ({ ...f, supplierId: Number(e.target.value) }))
            }
          >
            <option value={0}>בחרו ספק…</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          תאריך
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </label>
        <label>
          שיטת תשלום
          <select
            value={form.method}
            onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
          >
            <option value="CASH">מזומן</option>
            <option value="CHECK">צ׳ק</option>
            <option value="CREDIT_CARD">אשראי</option>
            <option value="BANK_TRANSFER">העברה בנקאית</option>
          </select>
        </label>
      </div>
      <div className="grid cols-2">
        <label>
          סכום
          <input
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) =>
              setForm((f) => ({ ...f, amount: Number(e.target.value) }))
            }
          />
        </label>
        <label>
          הפניה/מס׳ צ׳ק וכו׳
          <input
            value={form.reference}
            onChange={(e) =>
              setForm((f) => ({ ...f, reference: e.target.value }))
            }
          />
        </label>
      </div>
      {!!form.supplierId && (
        <div className="card">
          <b>שיוך לחשבוניות פתוחות</b>
          <table>
            <thead>
              <tr>
                <th>חשבונית</th>
                <th>יתרה</th>
                <th>סכום לתשלום</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>#{inv.number}</td>
                  <td>
                    {Number(balances[inv.id] || 0).toLocaleString('he-IL', {
                      style: 'currency',
                      currency: 'ILS',
                    })}
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={
                        allocs.find((a) => a.invoiceId === inv.id)?.amount || 0
                      }
                      onChange={(e) =>
                        updateAlloc(inv.id, Number(e.target.value))
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div>
        <button className="primary" onClick={submit}>
          שמירה
        </button>
      </div>
    </div>
  );
}
