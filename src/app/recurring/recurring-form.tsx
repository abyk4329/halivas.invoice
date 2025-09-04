'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recurringSchema } from '@/lib/validation';
import { useRouter } from 'next/navigation';

type FormData = { supplierId: number; title: string; amount: number; dayOfMonth: number; active: boolean; notes?: string };

export default function RecurringForm() {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: { dayOfMonth: 1, active: true },
    resolver: zodResolver(recurringSchema as any),
  });
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => { fetch('/api/suppliers').then(r => r.json()).then(setSuppliers); }, []);

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/recurring', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (res.ok) { reset(); router.refresh(); } else { alert('שגיאה בשמירה'); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid" style={{ gap: 12 }}>
      <label>ספק
        <select {...register('supplierId', { valueAsNumber: true })}>
          <option value="">בחר ספק…</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      <label>כותרת<input {...register('title', { required: true })} placeholder="לדוגמה: בזק" /></label>
      <div className="grid cols-3">
        <label>סכום<input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} /></label>
        <label>יום בחודש<input type="number" min={1} max={31} {...register('dayOfMonth', { valueAsNumber: true })} /></label>
        <label>פעיל <input type="checkbox" {...register('active')} /></label>
      </div>
      <label>הערות<input {...register('notes')} /></label>
  <div><button className="primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'שומר…' : 'שמירה'}</button></div>
    </form>
  );
}
