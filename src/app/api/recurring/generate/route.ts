import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const year = Number(url.searchParams.get('year') || new Date().getFullYear());
  const month = Number(url.searchParams.get('month') || new Date().getMonth() + 1); // 1-12
  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json({ error: 'year/month invalid' }, { status: 400 });
  }

  const rows = await prisma.recurringExpense.findMany({
    where: { active: true },
    include: { supplier: true },
  });

  const created: any[] = [];
  for (const r of rows) {
    const day = Math.min(
      r.dayOfMonth,
      new Date(Date.UTC(year, month, 0)).getUTCDate(),
    ); // last day of month safeguard
    const date = new Date(Date.UTC(year, month - 1, day));
    const yyyymm = `${year}${String(month).padStart(2, '0')}`;
    const ref = `RECURRING-${r.id}-${yyyymm}`;

    // Idempotency: skip if invoice with this reference exists
    const existing = await prisma.invoice.findFirst({ where: { reference: ref } });
    if (existing) continue;

    const subtotal = round2(Number(r.amount));
    const vat = 0; // recurring stored as net without VAT unless user edits later
    const total = subtotal + vat;

    const category = r.fixedCategory === 'AUTHORITIES' ? 'AUTHORITIES' : 'DIRECT_DEBIT';

    const inv = await prisma.invoice.create({
      data: {
        supplierId: r.supplierId,
        number: `AUTO-${yyyymm}-${r.id}`,
        type: 'INVOICE',
        category,
        date,
        currency: 'ILS',
        subtotal,
        vat,
        total,
        reference: ref,
        description: r.title,
        lines: {
          create: [
            {
              description: r.title,
              qty: 1,
              unitPrice: subtotal,
              total: subtotal,
            },
          ],
        },
      },
    });
    created.push(inv);
  }

  return NextResponse.json({ created: created.length }, { status: 201 });
}
