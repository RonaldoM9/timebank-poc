-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "completionTokenExpiresAt" DATETIME;
ALTER TABLE "Booking" ADD COLUMN "completionTokenHash" TEXT;

-- CreateTable
CREATE TABLE "ProofOfCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'qr_code',
    "validatorId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'validated',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProofOfCompletion_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProofOfCompletion_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProofOfCompletion_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ProofOfCompletion_bookingId_key" ON "ProofOfCompletion"("bookingId");
