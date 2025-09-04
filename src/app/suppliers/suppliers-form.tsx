'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

type FormData = {
  name: string;
  phone?: string;
  email?: string;
  taxId?: string;
  notes?: string;
};

export default function SuppliersForm() {
  const { register, handleSubmit, reset } = useForm<FormData>();
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
        <input {...register('name', { required: true })} placeholder="לדוגמה: בזק" />
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
        <button className="primary" type="submit">שמירה</button>
      </div>
    </form>
  );
}
