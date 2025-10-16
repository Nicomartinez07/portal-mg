-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrderStatusHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "status" TEXT,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observation" TEXT,
    CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OrderStatusHistory" ("changedAt", "id", "observation", "orderId", "status") SELECT "changedAt", "id", "observation", "orderId", "status" FROM "OrderStatusHistory";
DROP TABLE "OrderStatusHistory";
ALTER TABLE "new_OrderStatusHistory" RENAME TO "OrderStatusHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
