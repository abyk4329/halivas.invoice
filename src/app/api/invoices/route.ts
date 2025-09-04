import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { invoiceSchema } from '@/lib/validation';

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
  try {
    const json = await req.json();
    const parsed = invoiceSchema.parse(json);
    const lines = parsed.lines;
    const subtotal = lines.reduce((s, l) => s + Number(l.qty) * Number(l.unitPrice), 0);
    const vat = subtotal * Number(parsed.vatRate);
    const total = subtotal + vat;

    const invoice = await prisma.invoice.create({
      data: {
        supplierId: parsed.supplierId,
        number: parsed.number,
        type: parsed.type || 'INVOICE',
        date: parsed.date,
        dueDate: parsed.dueDate ?? null,
        currency: parsed.currency || 'ILS',
        subtotal,
        vat,
        total,
        lines: {
          create: lines.map((l) => ({
            description: l.description,
            qty: l.qty,
            unitPrice: l.unitPrice,
            total: Number(l.qty) * Number(l.unitPrice),
          })),
        },
      },
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Invalid input', details: e?.message }, { status: 400 });
  }
}
