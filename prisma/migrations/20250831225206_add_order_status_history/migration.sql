-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNumber" INTEGER NOT NULL DEFAULT 99999,
    "type" TEXT NOT NULL,
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
INSERT INTO "new_Order" ("actualMileage", "additionalObservations", "companyId", "creationDate", "customerId", "diagnosis", "id", "internalStatus", "orderNumber", "status", "type", "userId", "vehicleVin") SELECT "actualMileage", "additionalObservations", "companyId", "creationDate", "customerId", "diagnosis", "id", "internalStatus", coalesce("orderNumber", 99999) AS "orderNumber", "status", "type", "userId", "vehicleVin" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
