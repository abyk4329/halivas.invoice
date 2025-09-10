'use client';
import { useEffect, useState } from 'react';

type Supplier = { id: number; name: string };
type Line = { description: string; qty: number; unitPrice: number };

export default function InvoicesForm() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [lines, setLines] = useState<Line[]>([
    { description: '', qty: 1, unitPrice: 0 },
  ]);
  const [form, setForm] = useState({
    supplierId: 0,
    number: '',
    date: new Date().toISOString().slice(0, 10),
    vatRate: 0.17,
  });

  useEffect(() => {
    fetch('/api/suppliers')
      .then((r) => r.json())
      .then(setSuppliers);
  }, []);

  const totals = (() => {
    const subtotal = lines.reduce(
      (s, l) => s + (Number(l.qty) || 0) * (Number(l.unitPrice) || 0),
      0,
    );
    const vat = subtotal * Number(form.vatRate || 0);
    return { subtotal, vat, total: subtotal + vat };
  })();

  const setLine = (i: number, patch: Partial<Line>) => {
    setLines((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    );
  };

  const addLine = () =>
    setLines((prev) => [...prev, { description: '', qty: 1, unitPrice: 0 }]);
  const removeLine = (i: number) =>
    setLines((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async () => {
    if (!form.supplierId) return alert('נא לבחור ספק');
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierId: Number(form.supplierId),
        number: form.number,
        date: form.date,
        lines,
        vatRate: Number(form.vatRate),
      }),
    });
    if (res.ok) {
      setLines([{ description: '', qty: 1, unitPrice: 0 }]);
      setForm({ ...form, number: '' });
      location.reload();
    } else {
      alert('שגיאה בשמירת חשבונית');
    }
  };

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="grid cols-2">
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
      </div>
      <div className="grid cols-2">
        <label>
          מספר חשבונית
          <input
            value={form.number}
            onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
          />
        </label>
        <label>
          מע&quot;מ
          <input
            type="number"
            step="0.01"
            value={form.vatRate}
            onChange={(e) =>
              setForm((f) => ({ ...f, vatRate: Number(e.target.value) }))
            }
          />
        </label>
      </div>
      <div className="card">
        <b>שורות</b>
        {lines.map((l, i) => (
          <div key={i} className="grid cols-3" style={{ alignItems: 'end' }}>
            <label>
              תיאור
              <input
                value={l.description}
                onChange={(e) => setLine(i, { description: e.target.value })}
              />
            </label>
            <label>
              כמות
              <input
                type="number"
                step="0.01"
                value={l.qty}
                onChange={(e) => setLine(i, { qty: Number(e.target.value) })}
              />
            </label>
            <label>
              מחיר יחידה
              <input
                type="number"
                step="0.01"
                value={l.unitPrice}
                onChange={(e) =>
                  setLine(i, { unitPrice: Number(e.target.value) })
                }
              />
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={addLine}>
                +
              </button>
              {lines.length > 1 && (
                <button type="button" onClick={() => removeLine(i)}>
                  -
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="grid cols-3">
        <div className="card">
          ביניים:{' '}
          {totals.subtotal.toLocaleString('he-IL', {
            style: 'currency',
            currency: 'ILS',
          })}
        </div>
        <div className="card">
          מע&quot;מ:{' '}
          {totals.vat.toLocaleString('he-IL', {
            style: 'currency',
            currency: 'ILS',
          })}
        </div>
        <div className="card">
          סה&quot;כ:{' '}
          {totals.total.toLocaleString('he-IL', {
            style: 'currency',
            currency: 'ILS',
          })}
        </div>
      </div>
      <div>
        <button className="primary" onClick={submit}>
          שמירה
        </button>
      </div>
    </div>
  );
}
