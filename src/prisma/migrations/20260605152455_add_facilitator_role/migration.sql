-- CreateTable
CREATE TABLE "CommunityPotRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "potId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingId" TEXT,
    "amount" INTEGER NOT NULL,
    "reason" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decidedById" TEXT,
    "decidedAt" DATETIME,
    "decisionNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunityPotRequest_potId_fkey" FOREIGN KEY ("potId") REFERENCES "CommunityPot" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityPotRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityPotRequest_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

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
    "reputation" REAL NOT NULL DEFAULT 0,
    "role" TEXT NOT NULL DEFAULT 'USER'
);
INSERT INTO "new_User" ("availableOnline", "avatar", "bio", "city", "country", "createdAt", "department", "email", "id", "locationVisibility", "name", "password", "postalCode", "region", "reputation", "role", "serviceRadiusKm", "timeBalance", "walletAddress") SELECT "availableOnline", "avatar", "bio", "city", "country", "createdAt", "department", "email", "id", "locationVisibility", "name", "password", "postalCode", "region", "reputation", "role", "serviceRadiusKm", "timeBalance", "walletAddress" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CommunityPotRequest_potId_idx" ON "CommunityPotRequest"("potId");

-- CreateIndex
CREATE INDEX "CommunityPotRequest_userId_idx" ON "CommunityPotRequest"("userId");

-- CreateIndex
CREATE INDEX "CommunityPotRequest_status_idx" ON "CommunityPotRequest"("status");
