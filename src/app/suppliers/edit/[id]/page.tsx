import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import SuppliersForm from '../../suppliers-form';

export const dynamic = 'force-dynamic';

function getBaseUrl() {
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return env;
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

async function getSupplier(id: string) {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/suppliers/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch supplier:', error);
    return null;
  }
}

export default async function EditSupplierPage({ params }: { params: { id: string } }) {
  const supplier = await getSupplier(params.id);
  
  if (!supplier) {
    notFound();
  }
  
  return (
    <main className="new-supplier-page">
      <div className="page-header">
        <h1>עריכת ספק</h1>
        <p>עדכון פרטי הספק במערכת</p>
      </div>

      <div className="form-container">
        <div className="card">
          <SuppliersForm 
            initialData={supplier} 
            isEdit={true} 
            supplierId={parseInt(params.id)}
          />
        </div>
      </div>
    </main>
  );
}
