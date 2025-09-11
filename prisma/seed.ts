import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const s1 = await prisma.supplier.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'בזק', phone: '199', email: 'support@bezeq.co.il' },
  });
  await prisma.invoice.create({
    data: {
      supplierId: s1.id,
      number: 'INV-1001',
      type: 'INVOICE',
      date: new Date(),
      currency: 'ILS',
      subtotal: 100,
      vat: 17,
      total: 117,
      lines: { create: [{ description: 'שרות חודשי', qty: 1, unitPrice: 100, total: 100 }] },
    },
  });
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
