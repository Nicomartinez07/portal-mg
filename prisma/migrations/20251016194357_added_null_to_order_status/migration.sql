-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vehicle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "vin" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "engineNumber" TEXT,
    "type" TEXT,
    "year" INTEGER,
    "certificateNumber" TEXT,
    "saleDate" DATETIME,
    "importDate" DATETIME,
    "blocked" BOOLEAN,
    "licensePlate" TEXT,
    "companyId" INTEGER,
    CONSTRAINT "Vehicle_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Vehicle" ("blocked", "brand", "certificateNumber", "companyId", "date", "engineNumber", "id", "importDate", "licensePlate", "model", "saleDate", "type", "vin", "year") SELECT "blocked", "brand", "certificateNumber", "companyId", "date", "engineNumber", "id", "importDate", "licensePlate", "model", "saleDate", "type", "vin", "year" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");
CREATE UNIQUE INDEX "Vehicle_certificateNumber_key" ON "Vehicle"("certificateNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
