/**
 * Migration Lot 25 — Convertir les anciens soldes TIME en opening_balance
 *
 * Pour chaque utilisateur avec un ancien solde :
 * - Crée une transaction opening_balance dans le TimeLedger
 * - Crée/synchronise le UserWallet
 * - Idempotent : ne crée pas de doublon si déjà migré
 *
 * Usage : npx tsx prisma/seed-migrate-wallet-v3.ts
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("=== MIGRATION WALLET V3 — ANCIENS SOLDES → LEDGER ===\n");

  // 1. Récupérer tous les utilisateurs avec leur ancien solde
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, timeBalance: true },
    orderBy: { name: "asc" },
  });
  console.log(`Utilisateurs trouvés : ${users.length}`);

  // 2. Vérifier qui a déjà une transaction opening_balance
  const existingMigrations = await prisma.timeLedgerTransaction.findMany({
    where: { type: "opening_balance", source: "migration" },
    select: { userId: true },
  });
  const alreadyMigrated = new Set(existingMigrations.map((tx) => tx.userId));
  console.log(`Déjà migrés : ${alreadyMigrated.size}`);

  // 3. Récupérer les anciennes transactions pour chaque user (pour recalcul précis)
  const oldTransactions = await prisma.transaction.findMany({
    where: { status: "completed" },
    select: { fromId: true, toId: true, amount: true },
  });

  // Calcul du vrai solde à partir des transactions
  const realBalances: Record<string, number> = {};
  for (const tx of oldTransactions) {
    if (tx.toId) realBalances[tx.toId] = (realBalances[tx.toId] || 0) + tx.amount;
    if (tx.fromId) realBalances[tx.fromId] = (realBalances[tx.fromId] || 0) - tx.amount;
  }

  // 4. Migrer chaque utilisateur non encore migré
  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of users) {
    if (alreadyMigrated.has(user.id)) {
      skipped++;
      continue;
    }

    const computedBalance = realBalances[user.id] || 0;
    // Use the larger of DB timeBalance or computed from transactions
    const effectiveBalance = Math.max(user.timeBalance, computedBalance);
    const minutes = Math.round(effectiveBalance * 60);

    if (minutes <= 0) {
      // User with no balance — just create an empty wallet
      try {
        await prisma.userWallet.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id },
        });
        skipped++;
      } catch (err) {
        console.error(`  ❌ ${user.name} (${user.email}) — erreur création wallet :`, err);
        errors++;
      }
      continue;
    }

    try {
      // Create opening balance transaction
      await prisma.timeLedgerTransaction.create({
        data: {
          userId: user.id,
          amountMinutes: minutes,
          direction: "credit",
          type: "opening_balance",
          status: "completed",
          source: "migration",
          reason: `Migration ancien solde : ${effectiveBalance} TIME → ${minutes} min`,
          metadata: JSON.stringify({
            originalBalance: effectiveBalance,
            originalUnit: "TIME",
            conversion: `${effectiveBalance} × 60 = ${minutes} min`,
            migratedAt: new Date().toISOString(),
          }),
        },
      });

      // Sync wallet
      const wallet = await prisma.userWallet.upsert({
        where: { userId: user.id },
        update: {
          availableMinutes: minutes,
          totalReceivedMinutes: minutes,
          totalImpactMinutes: minutes,
          earnedMinutes: minutes,
        },
        create: {
          userId: user.id,
          availableMinutes: minutes,
          totalReceivedMinutes: minutes,
          totalImpactMinutes: minutes,
          earnedMinutes: minutes,
        },
      });

      console.log(
        `  ✅ ${user.name.padEnd(25)} | ${String(effectiveBalance).padStart(4)} TIME → ${String(minutes).padStart(5)} min | wallet: ${wallet.availableMinutes} min`
      );
      migrated++;
    } catch (err) {
      console.error(`  ❌ ${user.name} (${user.email}) — erreur :`, err);
      errors++;
    }
  }

  console.log(`\n=== RÉSULTAT MIGRATION ===`);
  console.log(`Migrés     : ${migrated}`);
  console.log(`Déjà faits : ${skipped}`);
  console.log(`Erreurs    : ${errors}`);
  console.log(`Total      : ${users.length}\n`);

  // 5. Vérification finale
  console.log("=== VÉRIFICATION FINALE ===\n");
  const ledgerCount = await prisma.timeLedgerTransaction.count();
  const walletCount = await prisma.userWallet.count();
  const userCount = await prisma.user.count();
  console.log(`TimeLedger transactions : ${ledgerCount}`);
  console.log(`UserWallets             : ${walletCount}`);
  console.log(`Users                   : ${userCount}`);

  if (walletCount < userCount) {
    console.warn(`⚠️  ${userCount - walletCount} utilisateurs sans wallet (sans solde)`);
  }

  console.log(`\n✅ Migration terminée.`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
}).finally(() => prisma.$disconnect());
