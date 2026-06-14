/**
 * Fix wallet balances: sync timeBalance with actual transactions
 * Creates missing mint transactions for demo users
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("=== RECHERCHE DES ÉCARTS WALLET ===\n");

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, timeBalance: true },
    orderBy: { name: "asc" },
  });

  const txs = await prisma.transaction.findMany({
    where: { status: "completed" },
    select: { fromId: true, toId: true, amount: true, type: true },
  });

  // Calculer le vrai solde à partir des transactions
  const real: Record<string, number> = {};
  for (const tx of txs) {
    if (tx.toId) real[tx.toId] = (real[tx.toId] || 0) + tx.amount;
    if (tx.fromId) real[tx.fromId] = (real[tx.fromId] || 0) - tx.amount;
  }

  // Cas 1: Users avec un solde négatif → leur créer un mint
  console.log("--- Users avec solde réel négatif → création mint ---");
  for (const u of users) {
    const r = real[u.id] || 0;
    if (r < -0.01) {
      const mintAmount = Math.abs(r);
      console.log(`${u.name.padEnd(25)} | solde: ${r} → mint de ${mintAmount} TIME`);
      await prisma.transaction.create({
        data: {
          fromId: null,
          toId: u.id,
          amount: mintAmount,
          type: "mint",
          status: "completed",
        },
      });
      // Recalc
      real[u.id] = (real[u.id] || 0) + mintAmount;
    }
  }

  // Cas 2: Users avec solde DB != solde réel → recalculer
  console.log("\n--- Correction des timeBalance ---");
  let corrected = 0;
  for (const u of users) {
    const r = real[u.id] || 0;
    const diff = u.timeBalance - r;
    if (Math.abs(diff) > 0.01) {
      await prisma.user.update({
        where: { id: u.id },
        data: { timeBalance: r },
      });
      console.log(`${u.name.padEnd(25)} | ${String(u.timeBalance).padStart(5)} → ${String(r).padStart(5)} TIME (écart: ${diff > 0 ? "+" : ""}${diff})`);
      corrected++;
    }
  }

  console.log(`\nTotal corrections: ${corrected}/${users.length}`);

  // Vérification finale
  console.log("\n=== VÉRIFICATION FINALE ===\n");
  const usersFinal = await prisma.user.findMany({
    select: { id: true, name: true, timeBalance: true },
  });
  const txsFinal = await prisma.transaction.findMany({
    where: { status: "completed" },
    select: { fromId: true, toId: true, amount: true },
  });
  const realFinal: Record<string, number> = {};
  for (const tx of txsFinal) {
    if (tx.toId) realFinal[tx.toId] = (realFinal[tx.toId] || 0) + tx.amount;
    if (tx.fromId) realFinal[tx.fromId] = (realFinal[tx.fromId] || 0) - tx.amount;
  }
  let remaining = 0;
  for (const u of usersFinal) {
    const r = realFinal[u.id] || 0;
    if (Math.abs(u.timeBalance - r) > 0.01) {
      console.log(`⚠️ ENCORE UN ÉCART: ${u.name} DB=${u.timeBalance} réel=${r}`);
      remaining++;
    }
  }
  if (remaining === 0) {
    console.log("✅ Tous les soldes sont alignés !");
  } else {
    console.log(`⚠️ ${remaining} écarts restants`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
