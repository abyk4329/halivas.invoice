-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SupplierCategory" AS ENUM ('SUPPLIERS', 'ADHOC', 'DIRECT_DEBIT', 'AUTHORITIES', 'FX');

-- CreateEnum
CREATE TYPE "SupplierSubcategory" AS ENUM ('MATERIALS', 'SERVICES', 'SOFTWARE_SYSTEMS', 'OFFICE_EQUIPMENT', 'SUBCONTRACTOR', 'MARKETING', 'FOOD_BEVERAGE', 'ENERGY_INFRA', 'PROPERTY_SERVICES', 'MAINTENANCE', 'GENERAL', 'VEHICLE', 'LOGISTICS');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('INVOICE', 'TAX_INVOICE', 'TAX_INVOICE_RECEIPT', 'CREDIT');

-- CreateEnum
CREATE TYPE "InvoiceCategory" AS ENUM ('REGULAR', 'FX', 'DIRECT_DEBIT', 'AUTHORITIES');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CHECK', 'CREDIT_CARD', 'BANK_TRANSFER', 'BIT', 'DIRECT_DEBIT');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL');

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "category" "InvoiceCategory" NOT NULL DEFAULT 'REGULAR',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "reference" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "InvoiceType" NOT NULL DEFAULT 'INVOICE';

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "method",
ADD COLUMN     "method" "PaymentMethod" NOT NULL;

-- AlterTable
ALTER TABLE "RecurringExpense" ADD COLUMN     "fixedCategory" "SupplierCategory" NOT NULL DEFAULT 'DIRECT_DEBIT',
ADD COLUMN     "frequency" "RecurrenceFrequency" NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "category" "SupplierCategory" NOT NULL DEFAULT 'SUPPLIERS',
ADD COLUMN     "contact" TEXT,
ADD COLUMN     "status" "SupplierStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "subcategory" "SupplierSubcategory";

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_name_key" ON "Supplier"("name");

