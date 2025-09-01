/*
  Warnings:

  - You are about to drop the column `additionalPartsPhotoUrl` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerSignedPhotoUrl` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `hoursCount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `licensePlatePhotoUrl` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `odometerPhotoUrl` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `orderReceiptPhotoUrl` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `parts` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `partsDescription` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `tasks` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `vinPlatePhotoUrl` on the `Order` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "OrderTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "hoursCount" INTEGER NOT NULL,
    CONSTRAINT "OrderTask_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderTaskPart" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderTaskId" INTEGER NOT NULL,
    "partId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "description" TEXT,
    CONSTRAINT "OrderTaskPart_orderTaskId_fkey" FOREIGN KEY ("orderTaskId") REFERENCES "OrderTask" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderTaskPart_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderPhoto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "OrderPhoto_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNumber" INTEGER,
    "type" TEXT NOT NULL DEFAULT 'SERVICE',
    "creationDate" DATETIME NOT NULL,
    "customerId" INTEGER NOT NULL,
    "vehicleVin" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "internalStatus" TEXT,
    "actualMileage" INTEGER NOT NULL,
    "diagnosis" TEXT,
    "additionalObservations" TEXT,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_vehicleVin_fkey" FOREIGN KEY ("vehicleVin") REFERENCES "Vehicle" ("vin") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("actualMileage", "additionalObservations", "companyId", "creationDate", "customerId", "diagnosis", "id", "internalStatus", "status", "userId", "vehicleVin") SELECT "actualMileage", "additionalObservations", "companyId", "creationDate", "customerId", "diagnosis", "id", "internalStatus", "status", "userId", "vehicleVin" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
