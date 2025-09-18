import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'מזהה ספק לא תקין' }, { status: 400 });
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'ספק לא נמצא' }, { status: 404 });
    }

    return NextResponse.json(supplier);
  } catch (err: any) {
    console.error('Failed to fetch supplier:', err);
    return NextResponse.json({ error: 'שגיאה בטעינת הספק' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'מזהה ספק לא תקין' }, { status: 400 });
    }

    const data = await req.json();
    const name = (data.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'שם ספק הוא שדה חובה' }, { status: 400 });
    }

    const supplier = await prisma.supplier.update({
      where: { id },
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
      },
    });

    return NextResponse.json(supplier);
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'שם הספק כבר קיים במערכת' }, { status: 409 });
    }
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'ספק לא נמצא' }, { status: 404 });
    }
    console.error('Failed to update supplier:', err);
    return NextResponse.json({ error: 'שגיאה בעדכון הספק' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'מזהה ספק לא תקין' }, { status: 400 });
    }

    // בדיקה אם יש חשבוניות או תשלומים קשורים לספק
    const [invoicesCount, paymentsCount] = await Promise.all([
      prisma.invoice.count({ where: { supplierId: id } }),
      prisma.payment.count({ where: { supplierId: id } }),
    ]);

    if (invoicesCount > 0 || paymentsCount > 0) {
      return NextResponse.json({ 
        error: 'לא ניתן למחוק ספק שיש לו חשבוניות או תשלומים במערכת' 
      }, { status: 400 });
    }

    await prisma.supplier.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'ספק לא נמצא' }, { status: 404 });
    }
    console.error('Failed to delete supplier:', err);
    return NextResponse.json({ error: 'שגיאה במחיקת הספק' }, { status: 500 });
  }
}
