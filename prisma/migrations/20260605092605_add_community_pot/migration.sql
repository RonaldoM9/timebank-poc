-- CreateTable
CREATE TABLE "CommunityPot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Pot commun TimeHeroes',
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CommunityPotTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "potId" TEXT NOT NULL,
    "userId" TEXT,
    "bookingId" TEXT,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityPotTransaction_potId_fkey" FOREIGN KEY ("potId") REFERENCES "CommunityPot" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityPotTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "totalTime" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startAt" DATETIME,
    "endAt" DATETIME,
    "completedAt" DATETIME,
    "cancelledAt" DATETIME,
    "cancellationReason" TEXT,
    "completionTokenHash" TEXT,
    "completionTokenExpiresAt" DATETIME,
    "completionTokenMethod" TEXT DEFAULT 'qr_code',
    "lastMessageAt" DATETIME,
    "fundedByCommunityPot" BOOLEAN NOT NULL DEFAULT false,
    "communityPotAmount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("cancellationReason", "cancelledAt", "clientId", "completedAt", "completionTokenExpiresAt", "completionTokenHash", "completionTokenMethod", "createdAt", "endAt", "hours", "id", "lastMessageAt", "serviceId", "startAt", "status", "totalTime") SELECT "cancellationReason", "cancelledAt", "clientId", "completedAt", "completionTokenExpiresAt", "completionTokenHash", "completionTokenMethod", "createdAt", "endAt", "hours", "id", "lastMessageAt", "serviceId", "startAt", "status", "totalTime" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
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
    "reputation" REAL NOT NULL DEFAULT 0,
    "role" TEXT NOT NULL DEFAULT 'user'
);
INSERT INTO "new_User" ("availableOnline", "avatar", "bio", "city", "country", "createdAt", "department", "email", "id", "locationVisibility", "name", "password", "postalCode", "region", "reputation", "serviceRadiusKm", "timeBalance", "walletAddress") SELECT "availableOnline", "avatar", "bio", "city", "country", "createdAt", "department", "email", "id", "locationVisibility", "name", "password", "postalCode", "region", "reputation", "serviceRadiusKm", "timeBalance", "walletAddress" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CommunityPotTransaction_potId_idx" ON "CommunityPotTransaction"("potId");

-- CreateIndex
CREATE INDEX "CommunityPotTransaction_userId_idx" ON "CommunityPotTransaction"("userId");

-- CreateIndex
CREATE INDEX "CommunityPotTransaction_type_idx" ON "CommunityPotTransaction"("type");
