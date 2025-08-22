/*
  Warnings:

  - Added the required column `customerId` to the `Warranty` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Warranty" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activationDate" DATETIME NOT NULL,
    "vehicleVin" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    CONSTRAINT "Warranty_vehicleVin_fkey" FOREIGN KEY ("vehicleVin") REFERENCES "Vehicle" ("vin") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Warranty_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Warranty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Warranty_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Warranty" ("activationDate", "companyId", "id", "userId", "vehicleVin") SELECT "activationDate", "companyId", "id", "userId", "vehicleVin" FROM "Warranty";
DROP TABLE "Warranty";
ALTER TABLE "new_Warranty" RENAME TO "Warranty";
CREATE UNIQUE INDEX "Warranty_vehicleVin_key" ON "Warranty"("vehicleVin");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
