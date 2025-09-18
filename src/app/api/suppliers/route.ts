import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim() || '';
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

  return NextResponse.json(suppliers);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const name = (data.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'שם ספק הוא שדה חובה' }, { status: 400 });
    }
    
    const supplier = await prisma.supplier.create({
      data: {
        name,
        status: (data.status as any) || 'ACTIVE',
        category: (data.category as any) || 'SUPPLIERS',
        subcategory: data.subcategory as any || null,
        contact: data.contact || null,
        phone: data.phone || null,
        email: data.email || null,
        taxId: data.taxId || null,
        notes: data.notes || null,
        // Note: type and paymentMethod are not part of Supplier schema
        // They might be used for invoices/payments created later
      },
    });
    return NextResponse.json(supplier, { status: 201 });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'שם הספק כבר קיים במערכת' }, { status: 409 });
    }
    console.error('Failed to create supplier:', err);
    return NextResponse.json({ error: 'שגיאה ביצירת ספק' }, { status: 500 });
  }
}
