const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({datasources:{db:{url:"file:/root/projects/timebank-poc/src/prisma/dev.db"}}});

async function main() {
  const rawToken = process.argv[2];
  if (!rawToken) { console.log("Usage: node validate.js <token>"); return; }
  
  const hash = crypto.createHash("sha256").update(rawToken).digest("hex");
  console.log("Hash:", hash.substring(0,20)+"...");

  const booking = await prisma.booking.findFirst({
    where: {completionTokenHash: hash},
    include: {service:true, proofOfCompletion:true}
  });
  if (!booking) { console.log("BOOKING_NOT_FOUND"); return; }
  console.log("Booking:", booking.id, booking.status);
  console.log("Has proof:", !!booking.proofOfCompletion);
  console.log("Expires:", booking.completionTokenExpiresAt);

  if (booking.status !== "pending") { console.log("WRONG_STATUS:" + booking.status); return; }
  if (booking.proofOfCompletion) { console.log("ALREADY_PROVED"); return; }
  if (new Date() > new Date(booking.completionTokenExpiresAt)) { console.log("TOKEN_EXPIRED"); return; }

  console.log("ALL_CHECKS_PASSED");

  await prisma.$transaction(async (tx) => {
    await tx.proofOfCompletion.create({
      data: {
        bookingId: booking.id, method: "qr_code",
        validatorId: booking.clientId, providerId: booking.service.providerId,
        tokenHash: hash, status: "validated"
      }
    });
    await tx.booking.update({
      where: {id: booking.id},
      data: {status:"completed", completedAt: new Date(), completionTokenHash: null, completionTokenExpiresAt: null}
    });
  });

  const existing = await prisma.transaction.findFirst({where:{bookingId:booking.id, type:"release"}});
  if (existing) { console.log("DUPLICATE_RELEASE"); return; }

  await prisma.user.update({
    where: {id: booking.service.providerId},
    data: {timeBalance: {increment: booking.totalTime}}
  });
  await prisma.transaction.create({
    data: {fromId:null, toId:booking.service.providerId, amount:booking.totalTime, type:"release", status:"completed", bookingId:booking.id}
  });
  console.log("RELEASE_DONE: +" + booking.totalTime + " TIME to provider");

  const proof = await prisma.proofOfCompletion.count({where:{bookingId:booking.id}});
  const releases = await prisma.transaction.count({where:{bookingId:booking.id, type:"release"}});
  const alice = await prisma.user.findUnique({where:{email:"alice.qr@test.com"}, select:{timeBalance:true}});
  console.log("Proofs:", proof, "Releases:", releases, "Alice:", alice.timeBalance);
  await prisma.$disconnect();
}

main().catch(e => { console.error("ERROR:", e.message); process.exit(1); });
