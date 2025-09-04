import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supplierSchema } from '@/lib/validation';

export async function GET() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: 'asc' },
  });

  // Compute balances per supplier
  const supplierIds = suppliers.map((s: any) => s.id);
  const invoices = await prisma.invoice.findMany({
    where: { supplierId: { in: supplierIds } },
    select: {
      id: true,
      supplierId: true,
      total: true,
      allocations: { select: { amount: true } },
      status: true,
    },
  });

  const balances = new Map<number, number>();
  for (const inv of invoices as any[]) {
    const paid = (inv.allocations as any[]).reduce((s: number, a: any) => s + Number(a.amount), 0);
    const bal = Number(inv.total) - paid;
    balances.set(inv.supplierId, (balances.get(inv.supplierId) || 0) + bal);
  }

  return NextResponse.json(
  suppliers.map((s: any) => ({ ...s, balance: Number(balances.get(s.id) || 0) }))
  );
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = supplierSchema.parse(json);
    const supplier = await prisma.supplier.create({ data: {
      name: data.name,
      phone: data.phone ?? null,
      email: data.email ?? null,
      taxId: data.taxId ?? null,
      notes: data.notes ?? null,
    }});
    return NextResponse.json(supplier, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Invalid input', details: e?.message }, { status: 400 });
  }
}
