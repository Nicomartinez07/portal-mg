/*
  Warnings:

  - You are about to alter the column `laborRecovery` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Int`.
  - You are about to alter the column `partsRecovery` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNumber" INTEGER NOT NULL DEFAULT 99999,
    "type" TEXT NOT NULL,
    "creationDate" DATETIME NOT NULL,
    "draft" BOOLEAN,
    "customerId" INTEGER,
    "vehicleVin" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "userId" INTEGER,
    "status" TEXT,
    "service" TEXT,
    "internalStatus" TEXT,
    "internalStatusObservation" TEXT,
    "originClaimNumber" TEXT,
    "laborRecovery" INTEGER,
    "partsRecovery" INTEGER,
    "actualMileage" INTEGER NOT NULL,
    "diagnosis" TEXT,
    "additionalObservations" TEXT,
    "preAuthorizationNumber" TEXT,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_vehicleVin_fkey" FOREIGN KEY ("vehicleVin") REFERENCES "Vehicle" ("vin") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("actualMileage", "additionalObservations", "companyId", "creationDate", "customerId", "diagnosis", "draft", "id", "internalStatus", "internalStatusObservation", "laborRecovery", "orderNumber", "originClaimNumber", "partsRecovery", "preAuthorizationNumber", "service", "status", "type", "userId", "vehicleVin") SELECT "actualMileage", "additionalObservations", "companyId", "creationDate", "customerId", "diagnosis", "draft", "id", "internalStatus", "internalStatusObservation", "laborRecovery", "orderNumber", "originClaimNumber", "partsRecovery", "preAuthorizationNumber", "service", "status", "type", "userId", "vehicleVin" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
