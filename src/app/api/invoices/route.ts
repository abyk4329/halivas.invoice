import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const supplierId = url.searchParams.get('supplierId');
  const category = url.searchParams.get('category');
  const yearParam = url.searchParams.get('year');
  const monthParam = url.searchParams.get('month');
  const where: any = {};
  if (status) where.status = status as any;
  if (supplierId) where.supplierId = Number(supplierId);
  if (category) where.category = category as any;
  if (yearParam) {
    const y = Number(yearParam);
    const start = new Date(Date.UTC(y, 0, 1));
    const end = new Date(Date.UTC(y + 1, 0, 1));
    where.date = { gte: start, lt: end };
  }
  if (monthParam && yearParam) {
    const y = Number(yearParam);
    const m = Number(monthParam) - 1;
    const start = new Date(Date.UTC(y, m, 1));
    const end = new Date(Date.UTC(y, m + 1, 1));
    where.date = { gte: start, lt: end };
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: { supplier: true, allocations: true },
    orderBy: { date: 'desc' },
  });
  // compute balance and derived fields
  const hebrewMonths = [
    'ינואר',
    'פברואר',
    'מרץ',
    'אפריל',
    'מאי',
    'יוני',
    'יולי',
    'אוגוסט',
    'ספטמבר',
    'אוקטובר',
    'נובמבר',
    'דצמבר',
  ];
  const withDerived = (invoices as any[]).map((inv: any) => {
    const paid = (inv.allocations as any[]).reduce(
      (s: number, a: any) => s + Number(a.amount),
      0,
    );
    const balance = Math.round((Number(inv.total) - paid) * 100) / 100;
    const d = new Date(inv.date);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const monthName = hebrewMonths[month - 1];
    let st = 'OPEN';
    if (balance <= 0) st = 'PAID';
    else if (paid > 0) st = 'PARTIALLY_PAID';
    return { ...inv, paid, balance, year, month, monthName, status: st } as any;
  });
  return NextResponse.json(withDerived);
}

export async function POST(req: Request) {
  const data = await req.json();
  // Expect: { supplierId, number, type, date, dueDate?, currency?, lines: [{ description, qty, unitPrice }], vatRate? }
  const lines = data.lines || [];
  const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
  const subtotal = round2(
    lines.reduce(
      (s: number, l: any) => s + Number(l.qty || 1) * Number(l.unitPrice || 0),
      0,
    ),
  );
  const vatRate = typeof data.vatRate === 'number' ? data.vatRate : 0.17;
  const vat = round2(subtotal * vatRate);
  const total = round2(subtotal + vat);

  const invoice = await prisma.invoice.create({
    data: {
      supplierId: data.supplierId,
      number: data.number,
      type: data.type ?? 'INVOICE',
  category: data.category ?? 'REGULAR',
      date: new Date(data.date),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      currency: data.currency || 'ILS',
      subtotal,
      vat,
      total,
      lines: {
        create: lines.map((l: any) => ({
          description: l.description,
          qty: l.qty || 1,
          unitPrice: l.unitPrice || 0,
          total: round2(Number(l.qty || 1) * Number(l.unitPrice || 0)),
        })),
      },
    },
  });

  return NextResponse.json(invoice, { status: 201 });
}
