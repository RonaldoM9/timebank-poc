const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
  const bookingId = "cmpnxq3qt000h28t8dv5dtweb";
  const clientId = "cmplm0mt9000028znq4uk9ida"; // Test Hero 1
  const providerId = "cmplir9lo000328mqb6x7xzx4"; // Alice Test

  console.log("=== TEST 8-9: Create rating 5/5 with comment ===");

  // Test unique constraint first
  const existing = await prisma.rating.findUnique({ where: { bookingId } });
  console.log("Existing rating for booking:", existing ? existing.id : "none");

  // Create rating
  const rating = await prisma.rating.create({
    data: {
      bookingId,
      fromId: clientId,
      toId: providerId,
      score: 5,
      comment: "Excellent service de jardinage ! Très professionnel.",
    },
  });
  console.log("Rating created:", rating.id, "score:", rating.score);

  // Recalculate reputation
  const ratings = await prisma.rating.findMany({
    where: { toId: providerId },
    select: { score: true },
  });
  const sum = ratings.reduce((acc, r) => acc + r.score, 0);
  const avg = Math.round((sum / ratings.length) * 10) / 10;
  console.log("New avg:", avg, "from", ratings.length, "ratings");

  // Update user reputation
  await prisma.user.update({
    where: { id: providerId },
    data: { reputation: avg },
  });

  const provider = await prisma.user.findUnique({
    where: { id: providerId },
    select: { name: true, reputation: true },
  });
  console.log("=== TEST 24: Provider reputation ===");
  console.log("Alice reputation:", provider.reputation);

  // Test 32-33: Verify no transactions created
  const txCount = await prisma.transaction.count({ where: { bookingId } });
  console.log("=== TEST 32-33: Wallet not impacted ===");
  console.log("TX count for booking:", txCount, "(should be 2 - escrow+release)");

  // Test 17: Double rating attempt
  console.log("=== TEST 17: Double rating (unique constraint) ===");
  try {
    await prisma.rating.create({
      data: {
        bookingId,
        fromId: clientId,
        toId: providerId,
        score: 4,
        comment: "second attempt",
      },
    });
    console.log("FAIL: Second rating was created (should have failed)");
  } catch (e) {
    console.log("PASS: Second rating rejected with unique constraint:", e.message.slice(0, 100));
  }

  // Test 27: Count ratings
  const ratingCount = await prisma.rating.count({ where: { toId: providerId } });
  console.log("=== TEST 27: Rating count ===");
  console.log("Ratings for Alice:", ratingCount);

  await prisma.$disconnect();
}

test().catch(e => { console.error("ERROR:", e); process.exit(1); });
