-- Manual migration script to sync production schema
-- Based on current schema.prisma structure

-- Add missing enums (if they don't exist)
DO $$ BEGIN
    CREATE TYPE "SupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SupplierCategory" AS ENUM ('SUPPLIERS', 'ADHOC', 'DIRECT_DEBIT', 'AUTHORITIES', 'FX');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SupplierSubcategory" AS ENUM ('MATERIALS', 'SERVICES', 'SOFTWARE_SYSTEMS', 'OFFICE_EQUIPMENT', 'SUBCONTRACTOR', 'MARKETING', 'FOOD_BEVERAGE', 'ENERGY_INFRA', 'PROPERTY_SERVICES', 'MAINTENANCE', 'GENERAL', 'VEHICLE', 'LOGISTICS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "InvoiceType" AS ENUM ('INVOICE', 'TAX_INVOICE', 'TAX_INVOICE_RECEIPT', 'CREDIT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "InvoiceCategory" AS ENUM ('REGULAR', 'FX', 'DIRECT_DEBIT', 'AUTHORITIES');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CHECK', 'CREDIT_CARD', 'BANK_TRANSFER', 'BIT', 'DIRECT_DEBIT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "RecurrenceFrequency" AS ENUM ('MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add missing columns to existing tables (if they don't exist)

-- Supplier table updates
ALTER TABLE "Supplier" 
ADD COLUMN IF NOT EXISTS "status" "SupplierStatus" DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS "category" "SupplierCategory" DEFAULT 'SUPPLIERS',
ADD COLUMN IF NOT EXISTS "subcategory" "SupplierSubcategory";

-- Invoice table updates  
ALTER TABLE "Invoice"
ADD COLUMN IF NOT EXISTS "type" "InvoiceType" DEFAULT 'INVOICE',
ADD COLUMN IF NOT EXISTS "category" "InvoiceCategory" DEFAULT 'REGULAR',
ADD COLUMN IF NOT EXISTS "reference" TEXT,
ADD COLUMN IF NOT EXISTS "description" TEXT;

-- Payment table updates
ALTER TABLE "Payment"
ADD COLUMN IF NOT EXISTS "method" "PaymentMethod" DEFAULT 'BANK_TRANSFER';

-- Add unique constraint on Supplier name (if not exists)
DO $$ BEGIN
    ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_name_key" UNIQUE ("name");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Verify tables exist and create if missing
CREATE TABLE IF NOT EXISTS "RecurringExpense" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "dayOfMonth" INTEGER NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL DEFAULT 'MONTHLY',
    "fixedCategory" "SupplierCategory" NOT NULL DEFAULT 'DIRECT_DEBIT',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringExpense_pkey" PRIMARY KEY ("id")
);

-- Add foreign key if not exists
DO $$ BEGIN
    ALTER TABLE "RecurringExpense" ADD CONSTRAINT "RecurringExpense_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
