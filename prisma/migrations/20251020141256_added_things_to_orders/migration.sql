-- AlterTable
ALTER TABLE "Order" ADD COLUMN "internalStatusObservation" TEXT;
ALTER TABLE "Order" ADD COLUMN "laborRecovery" DECIMAL;
ALTER TABLE "Order" ADD COLUMN "originClaimNumber" TEXT;
ALTER TABLE "Order" ADD COLUMN "partsRecovery" DECIMAL;
