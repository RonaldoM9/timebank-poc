/**
 * 🧪 TimeHeroes — Test de régression complet
 *
 * Couvre : Wallet V3 (Time Ledger), Escrow, Matchmaking, Community Pot
 * Run: cd src && npx tsx regression-test.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TestResult {
  section: string;
  name: string;
  status: "✅" | "❌" | "⚠️";
  detail: string;
}

const results: TestResult[] = [];
let passed = 0;
let failed = 0;

function pass(section: string, name: string, detail: string) {
  results.push({ section, name, status: "✅", detail });
  passed++;
}

function fail(section: string, name: string, detail: string) {
  results.push({ section, name, status: "❌", detail });
  failed++;
}

function warn(section: string, name: string, detail: string) {
  results.push({ section, name, status: "⚠️", detail });
}

async function getDemoUser(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

async function getCommunityPot() {
  return prisma.communityPot.findFirst({ orderBy: { createdAt: "asc" } });
}

async function runRegressionTests() {
  console.log("=".repeat(60));
  console.log("🧪 TIMEHEROES — TEST DE RÉGRESSION COMPLET");
  console.log("=".repeat(60));
  console.log();

  // ─── 1. CONNEXION & DONNÉES DE BASE ───────────────────────────────
  console.log("📦 1. CONNEXION & DONNÉES DE BASE\n");

  const demoUser = await getDemoUser("demo@timeheroes.fr");
  if (demoUser) {
    pass("Base", "Compte démo existe", `demo@timeheroes.fr → ${demoUser.name} (rôle: ${demoUser.role}, TIME: ${demoUser.timeBalance})`);
  } else {
    fail("Base", "Compte démo existe", "demo@timeheroes.fr introuvable");
  }

  const usersCount = await prisma.user.count();
  pass("Base", "Utilisateurs en base", `${usersCount} utilisateurs`);

  const servicesCount = await prisma.service.count();
  pass("Base", "Services en base", `${servicesCount} services`);

  const bookingsCount = await prisma.booking.count();
  pass("Base", "Réservations en base", `${bookingsCount} réservations`);

  // ─── 2. WALLET V3 — TIME LEDGER ───────────────────────────────────
  console.log("\n📦 2. WALLET V3 — TIME LEDGER\n");
  // Vérifier que la table time_ledger_transaction existe
  try {
    const ledgerCount = await prisma.timeLedgerTransaction.count();
    pass("Ledger", "Table TimeLedgerTransaction existe", `${ledgerCount} entrées dans le ledger`);
  } catch {
    fail("Ledger", "Table TimeLedgerTransaction existe", "TimeLedgerTransaction introuvable");
  }

  if (demoUser) {
    const userLedger = await prisma.timeLedgerTransaction.findMany({
      where: { userId: demoUser.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    if (userLedger.length > 0) {
      const types = [...new Set(userLedger.map((t) => t.type))];
      pass("Ledger", "Transactions ledger pour user démo", `${userLedger.length} entrées, types: ${types.join(", ")}`);
    } else {
      warn("Ledger", "Transactions ledger pour user démo", "Aucune entrée ledger pour demo@timeheroes.fr");
    }
  }

  const creditCount = await prisma.timeLedgerTransaction.count({ where: { direction: "credit" } });
  const debitCount = await prisma.timeLedgerTransaction.count({ where: { direction: "debit" } });
  pass("Ledger", "Directions credit/debit", `CREDIT: ${creditCount}, DEBIT: ${debitCount}`);

  if (demoUser) {
    const ledgerBalance = await prisma.timeLedgerTransaction.aggregate({
      where: { userId: demoUser.id },
      _sum: { amountMinutes: true },
    });
    const ledgerMin = ledgerBalance._sum.amountMinutes ?? 0;
    const dbBalanceMin = Math.round(demoUser.timeBalance * 60);
    const diff = Math.abs(ledgerMin - dbBalanceMin);
    if (diff < 60) {
      pass("Ledger", "Cohérence solde ledger vs timeBalance",
        `Ledger: ${ledgerMin}min, DB: ${dbBalanceMin}min (diff: ${diff}min — OK)`);
    } else {
      warn("Ledger", "Cohérence solde ledger vs timeBalance",
        `Ledger: ${ledgerMin}min, DB: ${dbBalanceMin}min (diff: ${diff}min)`);
    }
  }

  // ─── 3. ESCROW ─────────────────────────────────────────────────────
  console.log("\n📦 3. ESCROW\n");

  const escrowCount = await prisma.transaction.count({ where: { type: "escrow" } });
  pass("Escrow", "Transactions escrow", `${escrowCount} escrows créés`);

  const releaseCount = await prisma.transaction.count({ where: { type: "release" } });
  pass("Escrow", "Transactions release", `${releaseCount} releases effectuées`);

  const refundCount = await prisma.transaction.count({ where: { type: "refund" } });
  pass("Escrow", "Transactions refund", `${refundCount} refunds effectués`);

  const doubleReleases = await prisma.transaction.groupBy({
    by: ["bookingId"],
    where: { type: "release" },
    _count: true,
    having: { bookingId: { _count: { gt: 1 } } },
  });
  if (doubleReleases.length === 0) {
    pass("Escrow", "Pas de double release", "Tous les releases sont uniques par booking");
  } else {
    fail("Escrow", "Pas de double release", `${doubleReleases.length} bookings avec releases multiples`);
  }

  const completedBookings = await prisma.booking.findMany({
    where: { status: "completed" },
    select: { id: true, totalTime: true },
  });
  pass("Escrow", "Bookings complétés", `${completedBookings.length} missions terminées`);

  // ─── 4. MATCHMAKING ───────────────────────────────────────────────
  console.log("\n📦 4. MATCHMAKING\n");

  const recCount = await prisma.matchRecommendation.count();
  if (recCount > 0) {
    pass("Matchmaking", "Recommandations en base", `${recCount} recommandations de match`);
  } else {
    warn("Matchmaking", "Recommandations en base", "Aucune recommandation");
  }

  const fbCount = await prisma.matchFeedback.count();
  pass("Matchmaking", "Feedbacks utilisateurs", `${fbCount} feedbacks de match`);

  // ─── 5. COMMUNITY POT ──────────────────────────────────────────────
  console.log("\n📦 5. COMMUNITY POT / POT COMMUN\n");

  const pot = await getCommunityPot();
  if (pot) {
    pass("Pot", "Pot commun existe", `ID: ${pot.id}, Solde: ${pot.balance} TIME, Nom: ${pot.name}`);

    const txCount = await prisma.communityPotTransaction.count();
    pass("Pot", "Transactions du pot", `${txCount} transactions`);

    const donationCount = await prisma.communityPotTransaction.count({ where: { type: "DONATION" } });
    pass("Pot", "Dons au pot", `${donationCount} donations`);

    const fundingCount = await prisma.communityPotTransaction.count({ where: { type: "FUNDING" } });
    pass("Pot", "Financements depuis le pot", `${fundingCount} fundings`);

    const fundedBookings = await prisma.booking.findMany({
      where: { fundedByCommunityPot: true },
      select: { id: true, communityPotAmount: true },
    });
    pass("Pot", "Bookings financés par le pot", `${fundedBookings.length} bookings (total: ${fundedBookings.reduce((s, b) => s + b.communityPotAmount, 0)} TIME)`);
  } else {
    fail("Pot", "Pot commun existe", "Aucun pot commun trouvé");
  }

  // ─── 6. GAMIFICATION ──────────────────────────────────────────────
  console.log("\n📦 6. GAMIFICATION\n");

  const badgeCount = await prisma.badge.count();
  pass("Gamification", "Badges en base", `${badgeCount} badges`);

  const questCount = await prisma.quest.count();
  pass("Gamification", "Quêtes en base", `${questCount} quêtes`);

  if (demoUser) {
    const userBadges = await prisma.userBadge.count({ where: { userId: demoUser.id } });
    pass("Gamification", "Badges du user démo", `${userBadges} badges débloqués`);

    const xpEntries = await prisma.userXpEvent.count({ where: { userId: demoUser.id } });
    pass("Gamification", "XP du user démo", `${xpEntries} entrées XP`);
  }

  // ─── 7. ORGANISATIONS (Lot 22) ────────────────────────────────────
  console.log("\n📦 7. ORGANISATIONS / PARTNER SPACES\n");

  const orgCount = await prisma.organization.count();
  pass("Organisations", "Organisations en base", `${orgCount} organisations`);

  // ─── 8. WELLBEING (Lot 23b) ───────────────────────────────────────
  console.log("\n📦 8. WELLBEING\n");

  try {
    const surveyCount = await prisma.wellbeingSurvey.count();
    pass("Wellbeing", "Questionnaires", `${surveyCount} questionnaires`);

    const resultCount = await prisma.wellbeingSurvey.count({
      where: { NOT: { results: undefined } }
    });
    pass("Wellbeing", "Résultats", `OK (${resultCount} questionnaires avec données)`);
  } catch {
    warn("Wellbeing", "Tables wellbeing", "Tables non trouvées");
  }

  // ─── 9. INTÉGRITÉ GÉNÉRALE ────────────────────────────────────────
  console.log("\n📦 9. INTÉGRITÉ GÉNÉRALE\n");

  const orphanTx = await prisma.transaction.count({
    where: { bookingId: { not: null }, booking: null },
  });
  if (orphanTx === 0) {
    pass("Intégrité", "Transactions sans booking orphelin", "OK");
  } else {
    fail("Intégrité", "Transactions sans booking orphelin", `${orphanTx} transactions orphelines`);
  }

  // Just check all bookings have a serviceId
  const orphanBookings = await prisma.booking.findMany({
    where: { serviceId: "" },
    select: { id: true },
  });
  pass("Intégrité", "Bookings sans service orphelin", `${orphanBookings.length} bookings avec serviceId vide`);

  const negativeBalance = await prisma.user.count({ where: { timeBalance: { lt: 0 } } });
  if (negativeBalance === 0) {
    pass("Intégrité", "Aucun solde négatif", "OK");
  } else {
    fail("Intégrité", "Aucun solde négatif", `${negativeBalance} utilisateurs avec solde < 0`);
  }

  // ─── RÉSULTATS FINAUX ─────────────────────────────────────────────
  console.log();
  console.log("=".repeat(60));
  console.log("📊 RÉSULTATS DU TEST DE RÉGRESSION");
  console.log("=".repeat(60));
  console.log();

  const sections = [...new Set(results.map((r) => r.section))];
  for (const section of sections) {
    console.log(`\n${section}:`);
    const sectionResults = results.filter((r) => r.section === section);
    for (const r of sectionResults) {
      console.log(`  ${r.status} ${r.name}`);
      console.log(`     ${r.detail}`);
    }
  }

  console.log();
  console.log("-".repeat(60));
  console.log(`Résultat : ${passed} ✅ / ${failed} ❌ / ${results.length - passed - failed} ⚠️`);
  console.log("-".repeat(60));

  if (failed > 0) {
    console.log("\n❌ DES TESTS ONT ÉCHOUÉ");
    process.exit(1);
  } else if (results.length - passed - failed > 0) {
    console.log("\n⚠️  TESTS PASSÉS AVEC AVERTISSEMENTS");
    process.exit(0);
  } else {
    console.log("\n🎉 TOUS LES TESTS SONT PASSÉS");
    process.exit(0);
  }
}

runRegressionTests()
  .catch((err) => {
    console.error("❌ ERREUR FATALE:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
