'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';

type Allocation = { invoiceId: number; amount: number };
type FormData = {
  supplierId: number;
  date: string;
  method: 'CASH' | 'CHECK' | 'CREDIT_CARD' | 'BANK_TRANSFER';
  amount: number;
  reference?: string;
  details?: string;
  allocations: Allocation[];
};

export default function NewPaymentForm() {
  const searchParams = useSearchParams();
  const { register, handleSubmit, watch, setValue, reset } = useForm<FormData>({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      method: 'BANK_TRANSFER',
      allocations: [],
    },
  });
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [generalPayment, setGeneralPayment] = useState(false);

  const supplierId = watch('supplierId');
  useEffect(() => {
    fetch('/api/suppliers')
      .then((r) => r.json())
      .then(setSuppliers);
  }, []);

  // Prefill from query params (supplierId, amount, invoiceId)
  useEffect(() => {
    const supplierId = Number(searchParams.get('supplierId') || 0);
    const amount = Number(searchParams.get('amount') || 0);
    const invoiceId = Number(searchParams.get('invoiceId') || 0);
    if (supplierId) setValue('supplierId', supplierId as any);
    if (amount) setValue('amount', amount as any);
    if (invoiceId) {
      // We'll auto-allocate after invoices load
  setGeneralPayment(false);
    }
  }, [searchParams, setValue]);

  useEffect(() => {
    if (!supplierId) {
      setInvoices([]);
      return;
    }
    fetch(`/api/invoices?supplierId=${supplierId}&status=OPEN`)
      .then((r) => r.json())
      .then((list) => {
        setInvoices(list);
        const targetInvoiceId = Number(searchParams.get('invoiceId') || 0);
        const amount = Number(searchParams.get('amount') || 0);
        if (targetInvoiceId && amount) {
          // set single allocation to that invoice, capped by its balance
          const inv = list.find((x: any) => x.id === targetInvoiceId);
          if (inv) {
            const paid = (inv.allocations || []).reduce(
              (s: number, a: any) => s + Number(a.amount),
              0,
            );
            const balance = Math.max(0, Number(inv.total) - paid);
            const alloc = Math.min(balance, amount);
            setValue('allocations', [{ invoiceId: inv.id, amount: alloc }]);
          }
        } else {
          setValue('allocations', []);
        }
      });
  }, [supplierId, setValue, searchParams]);

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      reset();
      location.reload();
    } else {
      let msg = 'שגיאה בשמירת תשלום';
      try {
        const body = await res.json();
        if (body?.error) msg = body.error;
      } catch {}
      alert(msg);
    }
  };

  const watchedAllocations = watch('allocations');
  const amount = Number(watch('amount') || 0);
  const allocs = useMemo(() => watchedAllocations || [], [watchedAllocations]);
  const allocSum = useMemo(() => {
    return allocs.reduce((s, a) => s + Number(a.amount || 0), 0);
  }, [allocs]);

  const toggleAlloc = (invoiceId: number, value: number) => {
    const idx = allocs.findIndex((a) => a.invoiceId === invoiceId);
    const next = [...allocs];
    if (idx >= 0) next[idx] = { invoiceId, amount: value };
    else next.push({ invoiceId, amount: value });
    setValue('allocations', next);
  };

  const method = watch('method');
  const supplierSelected = !!supplierId;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid"
      style={{ gap: 12 }}
    >
      <label>
        ספק
        <select {...register('supplierId', { valueAsNumber: true })}>
          <option value="">בחר ספק…</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid cols-3">
        <label>
          תאריך
          <input type="date" {...register('date')} />
        </label>
        <label>
          שיטת תשלום
          <select {...register('method')}>
            <option value="BANK_TRANSFER">העברה בנקאית</option>
            <option value="CREDIT_CARD">כרטיס אשראי</option>
            <option value="CHECK">צ׳ק</option>
            <option value="CASH">מזומן</option>
          </select>
        </label>
        <label>
          סכום
          <input
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
          />
        </label>
      </div>
      <div className="grid cols-2">
        <label>
          ייחוס
          <input
            {...register('reference')}
            placeholder=""
          />
        </label>
        <label>
          פרטים
          <input {...register('details')} placeholder="" />
        </label>
      </div>
      {method === 'CREDIT_CARD' && (
        <div className="grid cols-2">
          <label>
            מס׳ תשלומים (אשראי)
            <select onChange={(e) => setValue('details', `תשלומים: ${e.target.value}`)}>
              {[1,2,3,4,5].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      {method === 'CHECK' && (
        <div className="grid cols-2">
          <label>
            מס׳ צ׳קים
            <select onChange={(e) => setValue('details', `צ׳קים: ${e.target.value}`)}>
              {[1,2,3,4,5].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
      )}
  {supplierSelected && (
        <div className="card">
          <div className="grid cols-2" style={{ alignItems: 'center' }}>
            <b>שיוכים לחשבוניות פתוחות</b>
            <label style={{ justifySelf: 'end' }}>
              <input
                type="checkbox"
        checked={generalPayment}
        onChange={(e) => setGeneralPayment(e.target.checked)}
              />{' '}
              תשלום כללי ללא שיוך
            </label>
          </div>
      {!generalPayment && (
            <>
              <table>
                <thead>
                  <tr>
                    <th>חשבונית</th>
                    <th>יתרה</th>
                    <th>סכום לתשלום</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const balance =
                      Number(inv.total) -
                      (inv.allocations || []).reduce(
                        (s: number, a: any) => s + Number(a.amount),
                        0,
                      );
                    const current =
                      allocs.find((a) => a.invoiceId === inv.id)?.amount || 0;
                    return (
                      <tr key={inv.id}>
                        <td>{inv.number}</td>
                        <td>
                          {balance.toLocaleString('he-IL', {
                            style: 'currency',
                            currency: 'ILS',
                          })}
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            value={current}
                            onChange={(e) =>
                              toggleAlloc(inv.id, Number(e.target.value))
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="grid cols-2">
                <div className="card">
                  סך שיוכים:{' '}
                  {allocSum.toLocaleString('he-IL', {
                    style: 'currency',
                    currency: 'ILS',
                  })}
                </div>
                <div className="card">
                  סכום תשלום:{' '}
                  {amount.toLocaleString('he-IL', {
                    style: 'currency',
                    currency: 'ILS',
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {!!supplierId && (
        <div className="card">
          <b>שיוכים לחשבוניות פתוחות</b>
          <table>
            <thead>
              <tr>
                <th>חשבונית</th>
                <th>יתרה</th>
                <th>סכום לתשלום</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const balance =
                  Number(inv.total) -
                  (inv.allocations || []).reduce(
                    (s: number, a: any) => s + Number(a.amount),
                    0,
                  );
                const current =
                  allocs.find((a) => a.invoiceId === inv.id)?.amount || 0;
                return (
                  <tr key={inv.id}>
                    <td>{inv.number}</td>
                    <td>
                      {balance.toLocaleString('he-IL', {
                        style: 'currency',
                        currency: 'ILS',
                      })}
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={current}
                        onChange={(e) =>
                          toggleAlloc(inv.id, Number(e.target.value))
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="grid cols-2">
            <div className="card">
              סך שיוכים:{' '}
              {allocSum.toLocaleString('he-IL', {
                style: 'currency',
                currency: 'ILS',
              })}
            </div>
            <div className="card">
              סכום תשלום:{' '}
              {amount.toLocaleString('he-IL', {
                style: 'currency',
                currency: 'ILS',
              })}
            </div>
          </div>
        </div>
      )}
      <div>
        <button className="primary" type="submit">
          שמירה
        </button>
      </div>
    </form>
  );
}
