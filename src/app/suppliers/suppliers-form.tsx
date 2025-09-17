'use client';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

type FormData = {
  name: string;
  phone?: string;
  email?: string;
  taxId?: string;
  notes?: string;
};

export default function SuppliersForm() {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [saving, setSaving] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true);
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        reset();
        location.reload();
      } else {
        let msg = 'שגיאה בשמירת ספק';
        try {
          const body = await res.json();
          if (body?.error) msg = body.error;
        } catch (e) {
          // ignore
        }
        alert(msg);
      }
    } catch (e: any) {
      alert('שגיאה בשמירת ספק');
      console.error('Supplier save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid"
      style={{ gap: 12 }}
    >
      <label>
        שם ספק
        <input
          {...register('name', { required: true })}
          placeholder="לדוגמה: בזק"
        />
      </label>
      <div className="grid cols-2">
        <label>
          טלפון
          <input {...register('phone')} placeholder="050-1234567" />
        </label>
        <label>
          אימייל
          <input
            type="email"
            {...register('email')}
            placeholder="name@domain.com"
          />
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
        <button className="primary" type="submit" disabled={saving}>
          {saving ? 'שומר…' : 'שמירה'}
        </button>
      </div>
    </form>
  );
}
