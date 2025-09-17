import React from 'react';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

function getBaseUrl() {
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return env;
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

async function getData(year: number, category?: string) {
  const baseUrl = getBaseUrl();
  const qs = new URLSearchParams({ year: String(year) });
  if (category && category !== 'ALL') qs.set('category', category);
  const invoicesRes = await fetch(`${baseUrl}/api/invoices?${qs.toString()}`, { cache: 'no-store' });
  const paymentsRes = await fetch(`${baseUrl}/api/payments?year=${year}`, { cache: 'no-store' });
  const invoices = invoicesRes.ok ? await invoicesRes.json() : [];
  const payments = paymentsRes.ok ? await paymentsRes.json() : [];
  return { invoices, payments } as { invoices: any[]; payments: any[] };
}

function sum(nums: number[]) { return nums.reduce((s, n) => s + Number(n || 0), 0); }

export default async function DashboardPage({ searchParams }: { searchParams?: { year?: string; category?: string } }) {
  const year = Number(searchParams?.year || new Date().getFullYear());
  const category = (searchParams?.category as string) || 'ALL';
  const { invoices, payments } = await getData(year, category);
  const totalExpenses = sum(invoices.map((i: any) => Number(i.total)));
  const totalPayments = sum(payments.map((p: any) => Number(p.amount)));
  const outstanding = sum(invoices.map((i: any) => Number(i.balance ?? 0)));

  // Monthly totals
  const monthly = Array.from({ length: 12 }, (_, m) => ({ m: m + 1, total: 0 }));
  for (const inv of invoices as any[]) {
    const d = new Date(inv.date);
    const m = d.getUTCMonth();
    monthly[m].total += Number(inv.total || 0);
  }

  // Top suppliers by expense
  const bySupplier = new Map<number, { name: string; sum: number }>();
  for (const inv of invoices as any[]) {
    const sId = inv.supplierId;
    const name = inv.supplier?.name || `#${sId}`;
    const entry = bySupplier.get(sId) || { name, sum: 0 };
    entry.sum += Number(inv.total || 0);
    bySupplier.set(sId, entry);
  }
  const topSup = Array.from(bySupplier.values())
    .sort((a, b) => b.sum - a.sum)
    .slice(0, 5);

  const maxMonth = Math.max(1, ...monthly.map((x) => x.total));
  const height = 160;

  return (
    <main>
      <h1>לוח בקרה</h1>
      <div className="grid cols-4">
        <div className="card">
          <div>הוצאות {year}</div>
          <b>{totalExpenses.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</b>
        </div>
        <div className="card">
          <div>תשלומים {year}</div>
          <b>{totalPayments.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</b>
        </div>
        <div className="card">
          <div>יתרת התחייבויות</div>
          <b>{outstanding.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</b>
        </div>
        <div className="card">
          <div>סינון</div>
          <form action="/dashboard" method="get" className="grid" style={{ gap: 8 }}>
            <div className="grid cols-2">
              <label>
                שנה
                <select name="year" defaultValue={String(year)}>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </label>
              <label>
                קטגוריה
                <select name="category" defaultValue={category}>
                  <option value="ALL">הכל</option>
                  <option value="REGULAR">רגיל</option>
                  <option value="FX">מט&quot;ח</option>
                  <option value="DIRECT_DEBIT">הוראת קבע</option>
                  <option value="AUTHORITIES">רשויות</option>
                </select>
              </label>
            </div>
            <button type="submit">עדכן</button>
          </form>
        </div>
      </div>
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3>הוצאות חודשיות</h3>
          <svg width="100%" viewBox={`0 0 600 ${height + 30}`} preserveAspectRatio="none">
            {monthly.map((x, i) => {
              const barW = 600 / 12 - 6;
              const h = Math.round((x.total / maxMonth) * height);
              const xPos = i * (600 / 12) + 3;
              const yPos = height - h + 10;
              return (
                <g key={i}>
                  <rect x={xPos} y={yPos} width={barW} height={h} fill="#4f46e5" rx={4} />
                  <text x={xPos + barW / 2} y={height + 25} fontSize="10" textAnchor="middle">
                    {i + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="card">
          <h3>5 ספקים מובילים</h3>
          <ol>
            {topSup.map((s, idx) => (
              <li key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{s.name}</span>
                <b>{s.sum.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</b>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}
