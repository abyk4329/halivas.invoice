import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim() || '';
  const yearParam = url.searchParams.get('year');
  const year = yearParam ? Number(yearParam) : new Date().getFullYear();
  const status = url.searchParams.get('status'); // ACTIVE/INACTIVE
  const subcategory = url.searchParams.get('subcategory');

  const where: any = {
    category: 'SUPPLIERS',
  };
  if (q) where.name = { contains: q, mode: 'insensitive' };
  if (status) where.status = status as any;
  if (subcategory) where.subcategory = subcategory as any;

  const suppliers = await prisma.supplier.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  const supplierIds = suppliers.map((s) => s.id);
  // Invoices and payments for the given year
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  const [invoices, payments] = await Promise.all([
    prisma.invoice.findMany({
      where: { supplierId: { in: supplierIds } },
      select: {
        id: true,
        supplierId: true,
        total: true,
        date: true,
        allocations: { select: { amount: true } },
        status: true,
      },
    }),
    prisma.payment.findMany({
      where: { supplierId: { in: supplierIds }, date: { gte: start, lt: end } },
      select: { supplierId: true, amount: true, date: true },
    }),
  ]);

  const balances = new Map<number, number>();
  const paidThisYear = new Map<number, number>();
  const expenseThisYear = new Map<number, number>();

  for (const inv of invoices as any[]) {
    const paid = (inv.allocations as any[]).reduce(
      (s: number, a: any) => s + Number(a.amount),
      0,
    );
    const bal = Number(inv.total) - paid;
    balances.set(inv.supplierId, (balances.get(inv.supplierId) || 0) + bal);
    if (inv.date >= start && inv.date < end) {
      expenseThisYear.set(
        inv.supplierId,
        (expenseThisYear.get(inv.supplierId) || 0) + Number(inv.total),
      );
    }
  }
  for (const p of payments as any[]) {
    paidThisYear.set(
      p.supplierId,
      (paidThisYear.get(p.supplierId) || 0) + Number(p.amount),
    );
  }

  return NextResponse.json(
    suppliers.map((s: any) => ({
      ...s,
      balance: Number(balances.get(s.id) || 0),
      paidThisYear: Number(paidThisYear.get(s.id) || 0),
      expenseThisYear: Number(expenseThisYear.get(s.id) || 0),
    })),
  );
}

export async function POST(req: Request) {
  const data = await req.json();
  const supplier = await prisma.supplier.create({
    data: {
  name: data.name,
      phone: data.phone ?? null,
      email: data.email ?? null,
      taxId: data.taxId ?? null,
      notes: data.notes ?? null,
    },
  });
  return NextResponse.json(supplier, { status: 201 });
}
