import { z } from 'zod';

export const supplierSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  taxId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const invoiceLineSchema = z.object({
  description: z.string().min(1),
  qty: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
});

export const invoiceSchema = z.object({
  supplierId: z.coerce.number().int().positive(),
  number: z.string().min(1),
  type: z.enum(['INVOICE','TAX_INVOICE','RECEIPT','CREDIT']).optional(),
  date: z.coerce.date(),
  dueDate: z.coerce.date().optional().nullable(),
  currency: z.string().default('ILS'),
  vatRate: z.coerce.number().min(0).max(1).default(0.17),
  lines: z.array(invoiceLineSchema).min(1),
});

export const paymentAllocationSchema = z.object({
  invoiceId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive(),
});

export const paymentSchema = z.object({
  supplierId: z.coerce.number().int().positive(),
  date: z.coerce.date(),
  method: z.enum(['CASH','CHECK','CREDIT_CARD','BANK_TRANSFER']),
  amount: z.coerce.number().positive(),
  currency: z.string().default('ILS').optional(),
  reference: z.string().optional(),
  details: z.string().optional(),
  allocations: z.array(paymentAllocationSchema).optional().default([]),
});

export const recurringSchema = z.object({
  supplierId: z.coerce.number().int().positive(),
  title: z.string().min(1),
  amount: z.coerce.number().positive(),
  dayOfMonth: z.coerce.number().int().min(1).max(31).default(1),
  active: z.coerce.boolean().default(true),
  notes: z.string().optional(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type RecurringInput = z.infer<typeof recurringSchema>;
