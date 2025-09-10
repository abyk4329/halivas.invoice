import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const payments = await prisma.payment.findMany({
    include: { supplier: true, allocations: { include: { invoice: true } } },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json(payments);
}

export async function POST(req: Request) {
  const data = await req.json();
  // Expect: { supplierId, date, method, amount, reference?, details?, meta?, allocations?: [{ invoiceId, amount }] }
  const allocations = data.allocations || [];
  const allocSum = allocations.reduce(
    (s: number, a: any) => s + Number(a.amount),
    0,
  );
  if (allocSum > Number(data.amount)) {
    return NextResponse.json(
      { error: 'Allocated amount exceeds payment amount' },
      { status: 400 },
    );
  }

  // Validate not exceeding invoice balances
  if (allocations.length) {
    // group by invoiceId in case of duplicates
    const grouped = allocations.reduce(
      (acc: Record<number, number>, a: any) => {
        const id = Number(a.invoiceId);
        acc[id] = (acc[id] || 0) + Number(a.amount || 0);
        return acc;
      },
      {} as Record<number, number>,
    );
    for (const [invoiceIdStr, allocAmountRaw] of Object.entries(grouped)) {
      const invoiceId = Number(invoiceIdStr);
      const allocAmount = Number(allocAmountRaw);
      const inv = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { allocations: true },
      });
      if (!inv) {
        return NextResponse.json(
          { error: `Invoice ${invoiceId} not found` },
          { status: 400 },
        );
      }
      const paid = (inv.allocations as any[]).reduce(
        (s: number, x: any) => s + Number(x.amount),
        0,
      );
      const balance = Number(inv.total) - paid;
      if (allocAmount > balance + 0.005) {
        return NextResponse.json(
          {
            error: `Allocation to invoice ${inv.number} exceeds remaining balance`,
          },
          { status: 400 },
        );
      }
    }
  }

  const payment = await prisma.payment.create({
    data: {
      supplierId: data.supplierId,
      date: new Date(data.date),
      method: data.method,
      amount: data.amount,
      currency: data.currency || 'ILS',
      reference: data.reference || null,
      details: data.details || null,
      allocations: allocations.length
        ? {
            create: allocations.map((a: any) => ({
              invoiceId: a.invoiceId,
              amount: a.amount,
            })),
          }
        : undefined,
    },
  });

  // Optionally update invoice statuses
  for (const a of allocations as any[]) {
    const inv = await prisma.invoice.findUnique({
      where: { id: Number(a.invoiceId) },
      include: { allocations: true },
    });
    if (inv) {
      const paid = (inv.allocations as any[]).reduce(
        (s: number, x: any) => s + Number(x.amount),
        0,
      );
      const balance = Number(inv.total) - paid;
      await prisma.invoice.update({
        where: { id: inv.id },
        data: {
          status: balance <= 0 ? 'PAID' : paid > 0 ? 'PARTIALLY_PAID' : 'OPEN',
        },
      });
    }
  }

  return NextResponse.json(payment, { status: 201 });
}
