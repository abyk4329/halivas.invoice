import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const rows = await prisma.recurringExpense.findMany({ include: { supplier: true }, orderBy: { title: 'asc' } });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const data = await req.json();
  const row = await prisma.recurringExpense.create({
    data: {
      supplierId: Number(data.supplierId),
      title: data.title,
      amount: Number(data.amount),
      dayOfMonth: Number(data.dayOfMonth ?? 1),
      active: data.active ?? true,
      notes: data.notes ?? null,
    },
  });
  return NextResponse.json(row, { status: 201 });
}
