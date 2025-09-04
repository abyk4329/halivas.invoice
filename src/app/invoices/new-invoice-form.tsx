'use client';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

type Line = { description: string; qty: number; unitPrice: number };
type FormData = {
  supplierId: number;
  number: string;
  date: string;
  vatRate: number;
  lines: Line[];
};

export default function NewInvoiceForm() {
  const { register, control, handleSubmit, watch, reset } = useForm<FormData>({
    defaultValues: { vatRate: 0.17, date: new Date().toISOString().slice(0, 10), lines: [{ description: '', qty: 1, unitPrice: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/suppliers').then(r => r.json()).then(setSuppliers);
  }, []);

  const values = watch();
  const subtotal = (values.lines || []).reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.unitPrice) || 0), 0);
  const vat = subtotal * (Number(values.vatRate) || 0);
  const total = subtotal + vat;

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      reset();
      location.reload();
    } else {
      alert('שגיאה בשמירת חשבונית');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid" style={{ gap: 12 }}>
      <label>
        ספק
        <select {...register('supplierId', { valueAsNumber: true })}>
          <option value="">בחר ספק…</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>
      <div className="grid cols-2">
        <label>
          מס׳ חשבונית
          <input {...register('number', { required: true })} />
        </label>
        <label>
          תאריך
          <input type="date" {...register('date')} />
        </label>
      </div>
      <div className="card">
        <div className="grid" style={{ gap: 8 }}>
          {fields.map((f, idx) => (
            <div key={f.id} className="grid cols-3" style={{ alignItems: 'end', gap: 8 }}>
              <label>
                תיאור
                <input {...register(`lines.${idx}.description` as const)} placeholder="פירוט" />
              </label>
              <label>
                כמות
                <input type="number" step="0.01" {...register(`lines.${idx}.qty` as const, { valueAsNumber: true })} />
              </label>
              <label>
                מחיר יחידה
                <input type="number" step="0.01" {...register(`lines.${idx}.unitPrice` as const, { valueAsNumber: true })} />
              </label>
              <button type="button" onClick={() => remove(idx)}>מחק</button>
            </div>
          ))}
          <button type="button" onClick={() => append({ description: '', qty: 1, unitPrice: 0 })}>הוסף שורה</button>
        </div>
      </div>
      <div className="grid cols-3">
        <label>
          מע"מ (%)
          <input type="number" step="0.01" {...register('vatRate', { valueAsNumber: true })} />
        </label>
        <div className="card">ביניים: {subtotal.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</div>
        <div className="card">סה"כ: {total.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</div>
      </div>
      <div>
        <button className="primary" type="submit">שמירה</button>
      </div>
    </form>
  );
}
