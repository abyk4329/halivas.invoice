import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') as any | null;
  const supplierId = url.searchParams.get('supplierId');
  const where: any = {};
  if (status) where.status = status;
  if (supplierId) where.supplierId = Number(supplierId);

  const invoices = await prisma.invoice.findMany({
    where,
    include: { supplier: true, allocations: true },
    orderBy: { date: 'desc' },
  });
  // compute balance per invoice
  const withBalance = (invoices as any[]).map((inv: any) => {
    const paid = (inv.allocations as any[]).reduce((s: number, a: any) => s + Number(a.amount), 0);
    const balance = Number(inv.total) - paid;
    return { ...inv, paid, balance } as any;
  });
  return NextResponse.json(withBalance);
}

export async function POST(req: Request) {
  const data = await req.json();
  // Expect: { supplierId, number, type, date, dueDate?, currency?, lines: [{ description, qty, unitPrice }], vatRate? }
  const lines = data.lines || [];
  const subtotal = lines.reduce((s: number, l: any) => s + Number(l.qty || 1) * Number(l.unitPrice || 0), 0);
  const vatRate = typeof data.vatRate === 'number' ? data.vatRate : 0.17;
  const vat = subtotal * vatRate;
  const total = subtotal + vat;

  const invoice = await prisma.invoice.create({
    data: {
      supplierId: data.supplierId,
      number: data.number,
      type: data.type ?? 'INVOICE',
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
          total: Number(l.qty || 1) * Number(l.unitPrice || 0),
        })),
      },
    },
  });

  return NextResponse.json(invoice, { status: 201 });
}
