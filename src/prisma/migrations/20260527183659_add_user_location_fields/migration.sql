-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "timeBalance" REAL NOT NULL DEFAULT 0,
    "bio" TEXT,
    "avatar" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "department" TEXT,
    "region" TEXT,
    "country" TEXT NOT NULL DEFAULT 'France',
    "serviceRadiusKm" INTEGER DEFAULT 10,
    "locationVisibility" TEXT NOT NULL DEFAULT 'city',
    "availableOnline" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reputation" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("avatar", "bio", "createdAt", "email", "id", "name", "password", "reputation", "timeBalance", "walletAddress") SELECT "avatar", "bio", "createdAt", "email", "id", "name", "password", "reputation", "timeBalance", "walletAddress" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
