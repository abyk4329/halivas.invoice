'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierSchema } from '@/lib/validation';
import { useRouter } from 'next/navigation';

type FormData = {
  name: string;
  phone?: string | null;
  email?: string | null;
  taxId?: string | null;
  notes?: string | null;
};

export default function SuppliersForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(supplierSchema),
  });
  const router = useRouter();
  const onError = () => alert('שגיאה בשמירת ספק');

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      reset();
      router.refresh();
    } else {
      onError();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid" style={{ gap: 12 }}>
      <label>
        שם ספק
        <input {...register('name')} placeholder="לדוגמה: בזק" />
        {errors.name && <small style={{ color: 'crimson' }}>שדה חובה</small>}
      </label>
      <div className="grid cols-2">
        <label>
          טלפון
          <input {...register('phone')} placeholder="050-1234567" />
        </label>
        <label>
          אימייל
          <input type="email" {...register('email')} placeholder="name@domain.com" />
        </label>
      </div>
      <div className="grid cols-2">
        <label>
          ח.פ / ע.מ
          <input {...register('taxId')} />
        </label>
        <label>
          הערות
          <input {...register('notes')} />
        </label>
      </div>
      <div>
  <button className="primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'שומר…' : 'שמירה'}</button>
      </div>
    </form>
  );
}
