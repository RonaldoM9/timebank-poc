const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
  const providerId = "cmplir9lo000328mqb6x7xzx4"; // Alice Test
  const clientId = "cmplm0mt9000028znq4uk9ida"; // Test Hero 1
  const hero2Id = "cmplm0n34000328zn3vg1d4fu"; // Test Hero 2

  // Clean up previous test data
  await prisma.user.update({ where: { id: providerId }, data: { reputation: 0 } });
  await prisma.rating.deleteMany({ where: { toId: providerId } });

  console.log("=== Reset done ===");

  // Test 25: Average reputation
  console.log("=== TEST 25: Average reputation ===");
  const r1 = await prisma.rating.create({
    data: { bookingId: "cmpnxq3qt000h28t8dv5dtweb", fromId: clientId, toId: providerId, score: 5, comment: "Excellent!" }
  });
  let ratings = await prisma.rating.findMany({ where: { toId: providerId }, select: { score: true } });
  let sum = ratings.reduce((acc, r) => acc + r.score, 0);
  let avg = Math.round((sum / ratings.length) * 10) / 10;
  await prisma.user.update({ where: { id: providerId }, data: { reputation: avg } });
  console.log("After 1 rating (5):", avg);

  const r2 = await prisma.rating.create({
    data: { bookingId: "cmpnxv52y000p28t8lrldwq5t", fromId: clientId, toId: providerId, score: 4, comment: "Très bien!" }
  });
  ratings = await prisma.rating.findMany({ where: { toId: providerId }, select: { score: true } });
  sum = ratings.reduce((acc, r) => acc + r.score, 0);
  avg = Math.round((sum / ratings.length) * 10) / 10;
  await prisma.user.update({ where: { id: providerId }, data: { reputation: avg } });
  console.log("After 2 ratings (5+4):", avg, "(expected 4.5)");

  // Test 26: Rounding
  console.log("\n=== TEST 26: Rounding (5,4,5 = 4.7) ===");
  // Need a different booking - let me create one
  const services = await prisma.service.findMany({ where: { providerId } });
  const newBooking = await prisma.booking.create({
    data: {
      serviceId: services[0].id,
      clientId: hero2Id,
      hours: 1,
      totalTime: 1,
      status: "completed",
      completedAt: new Date(),
    }
  });
  
  await prisma.rating.create({
    data: { bookingId: newBooking.id, fromId: hero2Id, toId: providerId, score: 5, comment: "Parfait!" }
  });
  
  ratings = await prisma.rating.findMany({ where: { toId: providerId }, select: { score: true } });
  sum = ratings.reduce((acc, r) => acc + r.score, 0);
  avg = Math.round((sum / ratings.length) * 10) / 10;
  await prisma.user.update({ where: { id: providerId }, data: { reputation: avg } });
  console.log("After 3 ratings (5+4+5):", avg, "(expected 4.7)");
  console.log("Count:", ratings.length, "(expected 3)");

  // Test 10: Minimum score
  console.log("\n=== TEST 10-14: Score validation ===");
  try {
    await prisma.rating.create({
      data: { bookingId: "TEST_INVALID", fromId: clientId, toId: providerId, score: 0, comment: "zero" }
    });
  } catch (e) {
    console.log("Score 0: Rejected ✓");
  }
  try {
    await prisma.rating.create({
      data: { bookingId: "TEST_INVALID2", fromId: clientId, toId: providerId, score: 6, comment: "six" }
    });
  } catch {
    console.log("Score 6: Rejected ✓");
  }

  // Test 23: Self-rating
  console.log("\n=== TEST 23: Provider self-rating ===");
  const bookingSelf = await prisma.booking.create({
    data: {
      serviceId: services[0].id,
      clientId: providerId,
      hours: 1,
      totalTime: 1,
      status: "completed",
      completedAt: new Date(),
    }
  });
  try {
    await prisma.rating.create({
      data: { bookingId: bookingSelf.id, fromId: providerId, toId: providerId, score: 5 }
    });
    console.log("FAIL: Self-rating was allowed");
  } catch (e) {
    console.log("PASS: Self-rating rejected ✓");
  }

  // Test 39: User isolation
  console.log("\n=== TEST 39: User isolation ===");
  const ronaldId = "cmplmkfsf000a28zntsv1ntvd"; // Ronald
  const nolanId = "cmplmkg1a000d28zn58r9ggo7"; // Nolan
  const ronaldRating = await prisma.rating.findMany({ where: { toId: ronaldId } });
  const nolanRating = await prisma.rating.findMany({ where: { toId: nolanId } });
  console.log("Ronald ratings:", ronaldRating.length);
  console.log("Nolan ratings:", nolanRating.length);

  // Final state
  const alice = await prisma.user.findUnique({ where: { id: providerId }, select: { name: true, reputation: true } });
  console.log("\n=== Final state ===");
  console.log("Alice:", alice.name, "- Reputation:", alice.reputation, "/ 5");

  await prisma.$disconnect();
}

test().catch(e => { console.error("ERROR:", e); process.exit(1); });
