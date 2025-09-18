import { headers } from 'next/headers';
import DashboardStats from './dashboard-stats';
import DashboardCharts from './dashboard-charts';

export const dynamic = 'force-dynamic';

function getBaseUrl() {
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return env;
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

async function getDashboardData() {
  try {
    const baseUrl = getBaseUrl();
    const [suppliersRes, paymentsRes, invoicesRes] = await Promise.all([
      fetch(`${baseUrl}/api/suppliers`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/payments?year=${new Date().getFullYear()}`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/invoices?year=${new Date().getFullYear()}`, { cache: 'no-store' })
    ]);

    const [suppliers, payments, invoices] = await Promise.all([
      suppliersRes.ok ? suppliersRes.json() : [],
      paymentsRes.ok ? paymentsRes.json() : [],
      invoicesRes.ok ? invoicesRes.json() : []
    ]);

    return { suppliers, payments, invoices };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return { suppliers: [], payments: [], invoices: [] };
  }
}

export default async function Home() {
  const { suppliers, payments, invoices } = await getDashboardData();
  
  return (
    <main className="dashboard-page">
      <div className="dashboard-header">
        <h1>לוח בקרה</h1>
        <p>סקירה כללית של מערכת חליווס</p>
      </div>

      <DashboardStats 
        suppliers={suppliers}
        payments={payments}
        invoices={invoices}
      />

      <DashboardCharts 
        suppliers={suppliers}
        payments={payments}
        invoices={invoices}
      />
    </main>
  );
}
