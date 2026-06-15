import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Config ──────────────────────────────────────────────────────────────────
const DEMO_PASSWORD = "TimeHeroes2026!";

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🧪 TimeHeroes — Facilitator Test Seed");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // ── Step 0: Clean up only facilitator test data (idempotent) ───────────
  console.log("📦 Étape 0 — Nettoyage des données de test facilitateur...");

  // Delete test CommunityPotRequests (by reason markers)
  const testReasons = [
    "Financer une mission solidaire d'aide numérique senior",
    "Demande de financement à refuser pour tester le workflow",
    "Test solde pot insuffisant",
    "Demande déjà traitée — approuvée",
    "Demande déjà traitée — refusée",
  ];
  await prisma.communityPotRequest.deleteMany({
    where: { reason: { in: testReasons } },
  });

  // Delete test CommunityPotTransactions (by reason markers)
  await prisma.communityPotTransaction.deleteMany({
    where: { reason: { in: ["Don de test pour seed facilitateur", "Test financement approuvé", "Test financement refusé"] } },
  });

  // Delete test solidarity services
  const solidarityTitles = [
    "Aide smartphone senior",
    "Accompagnement courses senior",
    "Soutien administratif solidaire",
  ];
  await prisma.booking.deleteMany({
    where: { service: { title: { in: solidarityTitles } } },
  });
  await prisma.service.deleteMany({
    where: { title: { in: solidarityTitles } },
  });

  console.log("  ✓ Nettoyage terminé\n");

  // ── Step 1: Get existing users ─────────────────────────────────────────
  console.log("👤 Étape 1 — Vérification des comptes existants...");

  const adminUser = await prisma.user.findUnique({ where: { email: "demo@timeheroes.fr" } });
  const sarahUser = await prisma.user.findUnique({ where: { email: "sarah.demo@timeheroes.fr" } });
  const karimUser = await prisma.user.findUnique({ where: { email: "karim.demo@timeheroes.fr" } });
  const aliceUser = await prisma.user.findUnique({ where: { email: "alice.seed@timeheroes.fr" } });

  if (!adminUser || !sarahUser || !karimUser || !aliceUser) {
    throw new Error("❌ Certains comptes utilisateur sont manquants. Lance d'abord npm run seed:demo");
  }

  // Ensure correct roles
  if (adminUser.role !== "ADMIN") {
    await prisma.user.update({ where: { id: adminUser.id }, data: { role: "ADMIN" } });
  }
  if (sarahUser.role !== "FACILITATOR") {
    await prisma.user.update({ where: { id: sarahUser.id }, data: { role: "FACILITATOR" } });
  }
  // karim and alice should stay USER (default)

  console.log(`  ✓ Admin : ${adminUser.name} (${adminUser.email}) — ${adminUser.role}`);
  console.log(`  ✓ Facilitator : ${sarahUser.name} (${sarahUser.email}) — ${sarahUser.role}`);
  console.log(`  ✓ User : ${karimUser.name} (${karimUser.email}) — ${karimUser.role}`);
  console.log(`  ✓ User : ${aliceUser.name} (${aliceUser.email}) — ${aliceUser.role}`);
  console.log("");

  // ── Step 2: Reset community pot ────────────────────────────────────────
  console.log("💰 Étape 2 — Configuration du pot commun...");

  const pot = await prisma.communityPot.findFirst({ orderBy: { createdAt: "asc" } });
  if (!pot) {
    throw new Error("❌ Pot commun introuvable. Lance d'abord npm run seed:demo");
  }

  // Reset pot balance to 50
  await prisma.communityPot.update({
    where: { id: pot.id },
    data: { balance: 50 },
  });

  console.log("  ✓ Pot commun reset à 50 TIME\n");

  // ── Step 3: Create pot history (transactions) ──────────────────────────
  console.log("📋 Étape 3 — Création de l'historique du pot...");

  // 3a. A donation from Alice (15 days ago)
  await prisma.communityPotTransaction.create({
    data: {
      potId: pot.id,
      userId: aliceUser.id,
      amount: 5,
      type: "DONATION",
      reason: "Don de test pour seed facilitateur",
      createdAt: daysAgo(15),
    },
  });
  console.log("  ✓ Don de 5 TIME par Alice (J-15)");

  // 3b. A previously approved funding (10 days ago)
  await prisma.communityPotTransaction.create({
    data: {
      potId: pot.id,
      userId: sarahUser.id,
      amount: 3,
      type: "FUNDING",
      reason: "Test financement approuvé",
      createdAt: daysAgo(10),
    },
  });
  console.log("  ✓ Financement approuvé de 3 TIME (J-10)");

  // 3c. A previously rejected funding (7 days ago) — just the transaction for history
  await prisma.communityPotTransaction.create({
    data: {
      potId: pot.id,
      userId: sarahUser.id,
      amount: 2,
      type: "FUNDING",
      reason: "Test financement refusé",
      createdAt: daysAgo(7),
    },
  });
  console.log("  ✓ Transaction funding refusé (J-7)");

  console.log("");

  // ── Step 4: Create solidarity services ─────────────────────────────────
  console.log("🦸 Étape 4 — Création des missions solidaires...");

  // 4a. "Aide smartphone senior" — VERIFIED, provider: Sarah
  const svc1 = await prisma.service.create({
    data: {
      title: "Aide smartphone senior",
      description: "Apprentissage des bases d'un smartphone : appels, contacts, photos, WhatsApp. Mission solidaire pour l'autonomie numérique des seniors.",
      category: "DIGITAL_HELP",
      ratePerHour: 1,
      providerId: sarahUser.id,
      status: "active",
      isSolidarityMission: true,
      solidarityCategory: "DIGITAL_HELP",
      solidarityStatus: "VERIFIED",
      solidarityReason: "Aide à l'autonomie numérique des seniors — mission solidaire vérifiée par le facilitateur",
    },
  });
  console.log(`  ✓ "${svc1.title}" — DIGITAL_HELP / VERIFIED`);

  // 4b. "Accompagnement courses senior" — SELF_DECLARED, provider: Karim
  const svc2 = await prisma.service.create({
    data: {
      title: "Accompagnement courses senior",
      description: "Accompagnement pour les courses alimentaires : aide à la liste, portage des sacs, soutien moral.",
      category: "SENIOR_SUPPORT",
      ratePerHour: 1,
      providerId: karimUser.id,
      status: "active",
      isSolidarityMission: true,
      solidarityCategory: "SENIOR_SUPPORT",
      solidarityStatus: "SELF_DECLARED",
      solidarityReason: "Accompagnement des seniors pour les courses du quotidien",
    },
  });
  console.log(`  ✓ "${svc2.title}" — SENIOR_SUPPORT / SELF_DECLARED`);

  // 4c. "Soutien administratif solidaire" — VERIFIED, provider: Alex
  const svc3 = await prisma.service.create({
    data: {
      title: "Soutien administratif solidaire",
      description: "Aide au remplissage de formulaires administratifs : CAF, CPAM, impôts, retraite. Mission solidaire pour les personnes en difficulté avec le numérique.",
      category: "LOCAL_SUPPORT",
      ratePerHour: 1,
      providerId: adminUser.id,
      status: "active",
      isSolidarityMission: true,
      solidarityCategory: "LOCAL_SUPPORT",
      solidarityStatus: "VERIFIED",
      solidarityReason: "Soutien administratif pour personnes en difficulté — mission solidaire vérifiée",
    },
  });
  console.log(`  ✓ "${svc3.title}" — LOCAL_SUPPORT / VERIFIED`);

  console.log("");

  // ── Step 5: Create a booking linked to request A (for funded mission) ─
  console.log("📅 Étape 5 — Création du booking lié (Alice → Sarah)...");

  // Alice books "Aide smartphone senior" from Sarah — 3 hours at 1 TIME/h
  const bookingA = await prisma.booking.create({
    data: {
      serviceId: svc1.id,
      clientId: aliceUser.id,
      hours: 3,
      totalTime: 3,
      status: "pending",
      startAt: daysAgo(-2),
      endAt: daysAgo(-2),
    },
  });
  console.log(`  ✓ Booking créé: ${svc1.title} — Alice vers Sarah (3h, 3 TIME)`);

  console.log("");

  // ── Step 6: Create funding requests ────────────────────────────────────
  console.log("📝 Étape 6 — Création des demandes de financement...");

  // 6a. Request A — PENDING (to approve), Alice, 3 TIME, linked to booking
  const reqA = await prisma.communityPotRequest.create({
    data: {
      potId: pot.id,
      userId: aliceUser.id,
      bookingId: bookingA.id,
      amount: 3,
      reason: "Financer une mission solidaire d'aide numérique senior",
      message: "Je souhaite que cette mission d'aide numérique pour un senior soit financée par le pot commun.",
      status: "PENDING",
      createdAt: daysAgo(2),
    },
  });
  console.log(`  ✓ Demande A (PENDING): ${reqA.amount} TIME — Alice — à approuver`);

  // 6b. Request B — PENDING (to reject), Karim, 5 TIME
  const reqB = await prisma.communityPotRequest.create({
    data: {
      potId: pot.id,
      userId: karimUser.id,
      amount: 5,
      reason: "Demande de financement à refuser pour tester le workflow",
      message: "Cette demande doit être refusée pour valider le workflow de rejet.",
      status: "PENDING",
      createdAt: daysAgo(1),
    },
  });
  console.log(`  ✓ Demande B (PENDING): ${reqB.amount} TIME — Karim — à refuser`);

  // 6c. Request C — PENDING (999 TIME > pot), Alice
  const reqC = await prisma.communityPotRequest.create({
    data: {
      potId: pot.id,
      userId: aliceUser.id,
      amount: 999,
      reason: "Test solde pot insuffisant",
      status: "PENDING",
      createdAt: daysAgo(0),
    },
  });
  console.log(`  ✓ Demande C (PENDING): ${reqC.amount} TIME — Alice — pot insuffisant`);

  // 6d. Request D — Already APPROVED (historical)
  const reqDApproved = await prisma.communityPotRequest.create({
    data: {
      potId: pot.id,
      userId: aliceUser.id,
      amount: 2,
      reason: "Demande déjà traitée — approuvée",
      status: "APPROVED",
      decidedById: sarahUser.id,
      decidedAt: daysAgo(12),
      decisionNote: "Mission solidaire validée — fonds alloués.",
      createdAt: daysAgo(14),
    },
  });
  console.log(`  ✓ Demande D (APPROVED): ${reqDApproved.amount} TIME — historique`);

  // 6e. Request E — Already REJECTED (historical)
  const reqERejected = await prisma.communityPotRequest.create({
    data: {
      potId: pot.id,
      userId: karimUser.id,
      amount: 4,
      reason: "Demande déjà traitée — refusée",
      status: "REJECTED",
      decidedById: sarahUser.id,
      decidedAt: daysAgo(8),
      decisionNote: "Fonds insuffisants à ce moment. Réévaluer le mois prochain.",
      createdAt: daysAgo(10),
    },
  });
  console.log(`  ✓ Demande E (REJECTED): ${reqERejected.amount} TIME — historique`);

  console.log("");

  // ── Summary ────────────────────────────────────────────────────────────
  console.log("━".repeat(50));
  console.log("✅ Seed facilitateur terminé avec succès !\n");
  console.log("📋 Comptes de test :");
  console.log("  ADMIN       | demo@timeheroes.fr       | TimeHeroes2026! | Accès complet");
  console.log("  FACILITATOR | sarah.demo@timeheroes.fr | TimeHeroes2026! | Gère le pot commun");
  console.log("  USER        | karim.demo@timeheroes.fr  | TimeHeroes2026! | Pas d'accès facilitateur");
  console.log("  USER        | alice.seed@timeheroes.fr  | TimeHeroes2026! | Peut créer des demandes\n");
  console.log("💰 Pot commun : 50 TIME");
  console.log("📝 Demandes :");
  console.log("  A — PENDING  | Alice | 3 TIME  | ✅ Valider (débite le pot)");
  console.log("  B — PENDING  | Karim | 5 TIME  | ❌ Refuser (ne débite pas)");
  console.log("  C — PENDING  | Alice | 999 TIME| ⛔ Erreur : solde insuffisant");
  console.log("  D — APPROVED | Alice | 2 TIME  | Historique (déjà traitée)");
  console.log("  E — REJECTED | Karim | 4 TIME  | Historique (déjà traitée)\n");
  console.log("🦸 Missions solidaires :");
  console.log("  1. Aide smartphone senior     | DIGITAL_HELP    | VERIFIED");
  console.log("  2. Accompagnement courses     | SENIOR_SUPPORT  | SELF_DECLARED");
  console.log("  3. Soutien administratif       | LOCAL_SUPPORT   | VERIFIED\n");
  console.log("📅 Booking lié : Alice → Sarah (Aide smartphone senior) — 3 TIME\n");
  console.log("Pages à vérifier :");
  console.log("  /wallet                    → Pot commun + historique");
  console.log("  /dashboard                 → Widget pot commun");
  console.log("  /facilitator/community-pot → Demandes + KPIs");
  console.log("  /services                  → Filtre missions solidaires");
  console.log("  /services/[id]             → Badge solidaire");
  console.log("  /bookings/[id]             → Booking lié (Demande A)");
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
