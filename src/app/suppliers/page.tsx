import { headers } from 'next/headers';
import Link from 'next/link';
import SuppliersList from './suppliers-list';

export const dynamic = 'force-dynamic';

function getBaseUrl() {
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return env;
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

async function getSuppliers() {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/suppliers`, {
      cache: 'no-store',
    });
    if (!res.ok) return [] as any[];
    return (await res.json()) as any[];
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    return [] as any[];
  }
}

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();
  
  return (
    <main className="suppliers-page">
      <div className="page-header">
        <h1>ספקים</h1>
        <p>ניהול מידע ספקים ומעקב יתרות</p>
      </div>

      <div className="suppliers-actions">
        <Link href="/suppliers/new" className="btn-primary">
          + הוספת ספק חדש
        </Link>
      </div>

      <div className="suppliers-list-container">
        <SuppliersList suppliers={suppliers} />
      </div>
    </main>
  );
}
