import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentSchema } from '@/lib/validation';

export async function GET() {
  const payments = await prisma.payment.findMany({
    include: { supplier: true, allocations: { include: { invoice: true } } },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json(payments);
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = paymentSchema.parse(json);
    const allocations = data.allocations || [];
    const allocSum = allocations.reduce((s, a) => s + Number(a.amount), 0);
    if (allocSum > Number(data.amount)) {
      return NextResponse.json({ error: 'Allocated amount exceeds payment amount' }, { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        supplierId: data.supplierId,
        date: data.date,
        method: data.method,
        amount: data.amount,
        currency: data.currency || 'ILS',
        reference: data.reference || null,
        details: data.details || null,
        allocations: allocations.length
          ? { create: allocations.map((a) => ({ invoiceId: a.invoiceId, amount: a.amount })) }
          : undefined,
      },
    });

    // Update invoice statuses impacted by this payment
    if (allocations.length) {
      const ids = [...new Set(allocations.map(a => a.invoiceId))];
      const affected = await prisma.invoice.findMany({ 
        where: { id: { in: ids } }, 
        include: { allocations: true } 
      });
      await Promise.all(affected.map(async (inv: any) => {
        const paid = inv.allocations.reduce((s: number, x: any) => s + Number(x.amount), 0);
        const balance = Number(inv.total) - paid;
        const status = balance <= 0 ? 'PAID' : paid > 0 ? 'PARTIALLY_PAID' : 'OPEN';
        if (status !== inv.status) {
          await prisma.invoice.update({ where: { id: inv.id }, data: { status } });
        }
      }));
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Invalid input', details: e?.message }, { status: 400 });
  }
}
