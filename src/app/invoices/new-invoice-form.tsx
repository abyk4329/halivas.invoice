'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';

type Line = { description: string; qty: number; unitPrice: number };
type FormData = {
  supplierId: number;
  number: string;
  date: string;
  vatRate: number;
  type: 'INVOICE' | 'TAX_INVOICE' | 'TAX_INVOICE_RECEIPT' | 'CREDIT';
  category: 'REGULAR' | 'FX' | 'DIRECT_DEBIT' | 'AUTHORITIES';
  lines: Line[];
};

export default function NewInvoiceForm() {
  const router = useRouter();
  const { register, control, handleSubmit, watch, reset, setValue, getValues } = useForm<FormData>({
    defaultValues: {
      vatRate: 0.17,
      date: new Date().toISOString().slice(0, 10),
      type: 'INVOICE',
      category: 'REGULAR',
      lines: [{ description: '', qty: 1, unitPrice: 0 }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierQuery, setSupplierQuery] = useState('');

  useEffect(() => {
    fetch('/api/suppliers')
      .then((r) => r.json())
      .then(setSuppliers);
  }, []);

  const filteredSuppliers = useMemo(() => {
    const q = supplierQuery.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter((s) => s.name.toLowerCase().includes(q));
  }, [supplierQuery, suppliers]);

  const values = watch();
  const subtotal = (values.lines || []).reduce(
    (s, l) => s + (Number(l.qty) || 0) * (Number(l.unitPrice) || 0),
    0,
  );
  const vat = subtotal * (Number(values.vatRate) || 0);
  const total = subtotal + vat;

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
  const inv = await res.json();
  const totalAmount = total;
      // If TAX_INVOICE_RECEIPT -> go to payments prefilled
      if (data.type === 'TAX_INVOICE_RECEIPT') {
        const params = new URLSearchParams({
          supplierId: String(data.supplierId),
          amount: String(total),
          invoiceId: String(inv.id),
        });
        router.push(`/payments?${params.toString()}`);
        return;
      }
      reset();
      router.refresh();
    } else {
      alert('שגיאה בשמירת חשבונית');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid"
      style={{ gap: 12 }}
    >
      <div className="grid cols-2">
        <label>
          ספק
          <select {...register('supplierId', { valueAsNumber: true })}>
            <option value="">בחר ספק…</option>
            {filteredSuppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          חיפוש ספק / יצירה מהירה
          <div className="grid cols-2" style={{ gap: 8 }}>
            <input
              value={supplierQuery}
              onChange={(e) => setSupplierQuery(e.target.value)}
              placeholder="הקלד שם ספק…"
            />
            <button
              type="button"
              onClick={async () => {
                const name = supplierQuery.trim();
                if (!name) return;
                const res = await fetch('/api/suppliers', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name }),
                });
                if (res.ok) {
                  const s = await res.json();
                  setSuppliers((prev) => [...prev, s]);
                  setValue('supplierId', s.id);
                  setSupplierQuery('');
                } else {
                  alert('שגיאה ביצירת ספק');
                }
              }}
            >
              יצירת ספק חדש
            </button>
          </div>
        </label>
      </div>
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
      <div className="grid cols-2">
        <label>
          סוג מסמך
          <select {...register('type')}>
            <option value="INVOICE">חשבונית</option>
            <option value="TAX_INVOICE">חשבונית מס</option>
            <option value="TAX_INVOICE_RECEIPT">חשבונית מס קבלה</option>
            <option value="CREDIT">חשבונית זיכוי</option>
          </select>
        </label>
        <label>
          קטגוריה
          <select {...register('category')}>
            <option value="REGULAR">רגיל</option>
            <option value="FX">מט&quot;ח</option>
            <option value="DIRECT_DEBIT">הוראת קבע</option>
            <option value="AUTHORITIES">רשויות</option>
          </select>
        </label>
      </div>
      <div className="card">
        <div className="grid" style={{ gap: 8 }}>
          {fields.map((f, idx) => (
            <div
              key={f.id}
              className="grid cols-3"
              style={{ alignItems: 'end', gap: 8 }}
            >
              <label>
                תיאור
                <input
                  {...register(`lines.${idx}.description` as const)}
                  placeholder="פירוט"
                />
              </label>
              <label>
                כמות
                <input
                  type="number"
                  step="0.01"
                  {...register(`lines.${idx}.qty` as const, {
                    valueAsNumber: true,
                  })}
                />
              </label>
              <label>
                מחיר יחידה
                <input
                  type="number"
                  step="0.01"
                  {...register(`lines.${idx}.unitPrice` as const, {
                    valueAsNumber: true,
                  })}
                />
              </label>
              <button type="button" onClick={() => remove(idx)}>
                מחק
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ description: '', qty: 1, unitPrice: 0 })}
          >
            הוסף שורה
          </button>
        </div>
      </div>
      <div className="grid cols-3">
        <label>
          מע&quot;מ (%)
          <input
            type="number"
            step="0.01"
            {...register('vatRate', { valueAsNumber: true })}
          />
        </label>
        <div className="card">
          ביניים:{' '}
          {subtotal.toLocaleString('he-IL', {
            style: 'currency',
            currency: 'ILS',
          })}
        </div>
        <div className="card">
          סה&quot;כ:{' '}
          {total.toLocaleString('he-IL', {
            style: 'currency',
            currency: 'ILS',
          })}
        </div>
      </div>
      <div>
        <button className="primary" type="submit">
          שמירה
        </button>
      </div>
    </form>
  );
}
