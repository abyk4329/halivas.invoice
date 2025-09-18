'use client';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';

type FormData = {
  name: string;
  taxId?: string;
  contact?: string;
  phone?: string;
  email?: string;
  notes?: string;
  category?: string;
  subcategory?: string;
  type?: string;
  paymentMethod?: string;
  paymentTerms?: string;
  status?: string;
};

interface SuppliersFormProps {
  initialData?: any;
  isEdit?: boolean;
  supplierId?: number;
}

export default function SuppliersForm({ initialData, isEdit = false, supplierId }: SuppliersFormProps) {
  const { register, handleSubmit, reset, setValue } = useForm<FormData>();
  const [saving, setSaving] = useState(false);

  // Set initial values for edit mode
  useEffect(() => {
    if (isEdit && initialData) {
      Object.keys(initialData).forEach((key) => {
        if (initialData[key] !== null && initialData[key] !== undefined) {
          setValue(key as keyof FormData, initialData[key]);
        }
      });
    }
  }, [isEdit, initialData, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true);
      const url = isEdit ? `/api/suppliers/${supplierId}` : '/api/suppliers';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        if (!isEdit) {
          reset();
        }
        // Redirect to suppliers list page after successful save
        window.location.href = '/suppliers';
      } else {
        let msg = isEdit ? 'שגיאה בעדכון ספק' : 'שגיאה בשמירת ספק';
        try {
          const body = await res.json();
          if (body?.error) msg = body.error;
        } catch (e) {
          // ignore
        }
        alert(msg);
      }
    } catch (e: any) {
      alert(isEdit ? 'שגיאה בעדכון ספק' : 'שגיאה בשמירת ספק');
      console.error('Supplier save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="suppliers-form"
    >
      {/* שם ספק */}
      <div className="form-group">
        <label>
          שם ספק *
          <input
            {...register('name', { required: true })}
            placeholder=""
          />
        </label>
      </div>

      {/* ח.פ/ע.מ */}
      <div className="form-group">
        <label>
          ח.פ / ע.מ
          <input {...register('taxId')} placeholder="" />
        </label>
      </div>

      {/* איש קשר */}
      <div className="form-group">
        <label>
          איש קשר
          <input {...register('contact')} placeholder="" />
        </label>
      </div>

      {/* טלפון ומייל */}
      <div className="form-row">
        <label>
          טלפון
          <input {...register('phone')} placeholder="" />
        </label>
        <label>
          מייל
          <input
            type="email"
            {...register('email')}
            placeholder=""
          />
        </label>
      </div>

      {/* הערות */}
      <div className="form-group">
        <label>
          הערות
          <textarea 
            {...register('notes')} 
            placeholder=""
            rows={2}
          />
        </label>
      </div>

      {/* קטגוריה */}
      <div className="form-group">
        <label>
          קטגוריה
          <select {...register('category')} defaultValue={initialData?.category || ""}>
            <option value="">בחר קטגוריה</option>
            <option value="REGULAR">ספק קבוע</option>
            <option value="OCCASIONAL">ספק מזדמן</option>
          </select>
        </label>
      </div>

      {/* סטטוס (רק במצב עריכה) */}
      {isEdit && (
        <div className="form-group">
          <label>
            סטטוס
            <select {...register('status')} defaultValue={initialData?.status || "ACTIVE"}>
              <option value="ACTIVE">פעיל</option>
              <option value="INACTIVE">לא פעיל</option>
            </select>
          </label>
        </div>
      )}

      {/* סוג */}
      <div className="form-group">
        <label>
          סוג
          <select {...register('type')} defaultValue={initialData?.type || ""}>
            <option value="">בחר סוג</option>
            <option value="FX">מט&quot;ח</option>
            <option value="REGULAR">רגיל</option>
          </select>
        </label>
      </div>

      {/* אופן תשלום */}
      <div className="form-group">
        <label>
          אופן תשלום
          <select {...register('paymentMethod')} defaultValue={initialData?.paymentMethod || ""}>
            <option value="">בחר אופן תשלום</option>
            <option value="BANK_TRANSFER">העברה בנקאית</option>
            <option value="BIT">ביט</option>
            <option value="CASH">מזומן</option>
            <option value="CHECK">צ&apos;ק</option>
            <option value="CREDIT_CARD">כרטיס אשראי</option>
          </select>
        </label>
      </div>

      {/* תנאי תשלום */}
      <div className="form-group">
        <label>
          תנאי תשלום
          <select {...register('paymentTerms')} defaultValue={initialData?.paymentTerms || ""}>
            <option value="">בחר תנאי תשלום</option>
            <option value="IMMEDIATE">מיידי</option>
            <option value="PARTNER_30">שותף+30</option>
            <option value="PARTNER_60">שותף+60</option>
            <option value="PARTNER_90">שותף+90</option>
            <option value="PARTNER_120">שותף+120</option>
            <option value="MONTHLY">חודשי</option>
            <option value="BI_MONTHLY">דו-חודשי</option>
            <option value="YEARLY">שנתי</option>
          </select>
        </label>
      </div>

      {/* כפתור שמירה */}
      <div className="form-submit">
        <button className="primary" type="submit" disabled={saving}>
          {saving ? (isEdit ? 'מעדכן…' : 'שומר…') : (isEdit ? 'עדכון ספק' : 'שמירת ספק')}
        </button>
      </div>
    </form>
  );
}
