/*
  Warnings:

  - A unique constraint covering the columns `[transaction_id]` on the table `enrollments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "is_free" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paid_amount" DECIMAL(10,2),
ADD COLUMN     "transaction_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_transaction_id_key" ON "enrollments"("transaction_id");

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
