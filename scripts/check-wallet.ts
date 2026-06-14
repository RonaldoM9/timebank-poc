import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, timeBalance: true },
    orderBy: { name: "asc" },
  });

  const transactions = await prisma.transaction.findMany({
    where: { status: "completed" },
    select: { fromId: true, toId: true, amount: true, type: true, bookingId: true },
  });

  const realBalances: Record<string, number> = {};

  for (const tx of transactions) {
    if (tx.toId) realBalances[tx.toId] = (realBalances[tx.toId] || 0) + tx.amount;
    if (tx.fromId) realBalances[tx.fromId] = (realBalances[tx.fromId] || 0) - tx.amount;
  }

  console.log("=== USERS WITH DISCREPANCIES ===\n");
  let anomalies = 0;
  for (const u of users) {
    const real = realBalances[u.id] || 0;
    const diff = u.timeBalance - real;
    if (Math.abs(diff) > 0.01) {
      console.log(`${u.name.padEnd(25)} | DB: ${String(u.timeBalance).padStart(6)} | Réel: ${String(real).padStart(6)} | Écart: ${diff > 0 ? "+" : ""}${diff}`);
      anomalies++;
    }
  }
  console.log(`\nTotal anomalies: ${anomalies}/${users.length}`);

  // Focus on Ronald Demo (ronald.demo@timebank.local)
  const ronald = users.find(u => u.email === "ronald.demo@timebank.local");
  if (ronald) {
    console.log(`\n=== RONALD DEMO (${ronald.email}) ===`);
    console.log(`DB balance: ${ronald.timeBalance}, Real balance: ${realBalances[ronald.id] || 0}`);
    
    const allTxs = await prisma.transaction.findMany({
      where: {
        OR: [{ fromId: ronald.id }, { toId: ronald.id }],
        status: "completed"
      },
      orderBy: { createdAt: "asc" },
      select: { id: true, type: true, amount: true, fromId: true, toId: true, bookingId: true, createdAt: true }
    });
    let running = 0;
    console.log("\nTransactions chronologiques:");
    for (const tx of allTxs) {
      const direction = tx.toId === ronald.id ? "IN " : "OUT";
      const amt = tx.toId === ronald.id ? tx.amount : -tx.amount;
      running += amt;
      const amtStr = tx.toId === ronald.id ? `+${tx.amount}` : `-${tx.amount}`;
      console.log(`  ${tx.createdAt.toISOString().split("T")[0]} | ${direction} | ${tx.type.padEnd(10)} | ${amtStr.padStart(5)} TIME | running: ${String(running).padStart(4)} | ${tx.bookingId || "-"}`);
    }
    console.log(`\nFinal running balance: ${running}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
