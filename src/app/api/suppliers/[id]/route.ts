import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(supplier);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  const data = await req.json();
  const supplier = await prisma.supplier.update({ where: { id }, data });
  return NextResponse.json(supplier);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  try {
    await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // Prisma foreign key constraint error code for SQLite/Postgres is P2003
    if (err?.code === 'P2003') {
      return NextResponse.json(
        {
          error:
            'Cannot delete supplier with related invoices/payments/recurring expenses',
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 },
    );
  }
}
