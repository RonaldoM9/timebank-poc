import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Standardized titles (idempotent check) ─────────────────────────────────
const MISSION_TITLES = [
  "Atelier smartphone senior — Écouen",
  "Rangement jardin solidaire",
  "Repair Café quartier",
  "Mission collective terminée — Test",
] as const;

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 TimeHeroes — Lot 19 Collective Missions Seed");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // ── Step 0: Get existing users ─────────────────────────────────────────
  console.log("👤 Étape 0 — Vérification des comptes existants...");

  const sarahUser = await prisma.user.findUnique({ where: { email: "sarah.demo@timeheroes.fr" } });
  const alexUser = await prisma.user.findUnique({ where: { email: "demo@timeheroes.fr" } });
  const aliceUser = await prisma.user.findUnique({ where: { email: "alice.seed@timeheroes.fr" } });
  const karimUser = await prisma.user.findUnique({ where: { email: "karim.demo@timeheroes.fr" } });

  if (!sarahUser || !alexUser || !aliceUser || !karimUser) {
    throw new Error("❌ Certains comptes utilisateur sont manquants. Lance d'abord npm run seed:demo");
  }

  console.log(`  ✓ Sarah Martin  (${sarahUser.email})`);
  console.log(`  ✓ Alex Demo     (${alexUser.email})`);
  console.log(`  ✓ Alice Dupont  (${aliceUser.email})`);
  console.log(`  ✓ Karim Benali  (${karimUser.email})`);
  console.log("");

  // ── Step 1: Get community pot ──────────────────────────────────────────
  console.log("💰 Étape 1 — Récupération du pot commun...");

  const pot = await prisma.communityPot.findFirst({ orderBy: { createdAt: "asc" } });
  if (!pot) {
    throw new Error("❌ Pot commun introuvable. Lance d'abord npm run seed:demo");
  }
  console.log(`  ✓ Pot commun trouvé (balance: ${pot.balance})`);
  console.log("");

  // ── Step 2: Check which titles already exist ──────────────────────────
  console.log("🔍 Étape 2 — Vérification des missions existantes...");

  const existingMissions = await prisma.collectiveMission.findMany({
    where: { title: { in: MISSION_TITLES as unknown as string[] } },
    select: { title: true },
  });
  const existingTitles = new Set(existingMissions.map((m) => m.title));

  for (const title of MISSION_TITLES) {
    if (existingTitles.has(title)) {
      console.log(`  ⏭  "${title}" existe déjà — skip`);
    } else {
      console.log(`  ✓ "${title}" à créer`);
    }
  }
  console.log("");

  // ── Step 3: Create missions that don't exist ──────────────────────────
  console.log("🚀 Étape 3 — Création des missions collectives...");

  const fiveDaysAgo = new Date(Date.now() - 5 * 86400000);

  // ── Mission 1: "Atelier smartphone senior — Écouen" ────────────────
  if (!existingTitles.has("Atelier smartphone senior — Écouen")) {
    const m1 = await prisma.collectiveMission.create({
      data: {
        title: "Atelier smartphone senior — Écouen",
        description:
          "Atelier collectif d'apprentissage des smartphones pour les seniors : appels, contacts, photos, WhatsApp. Mission solidaire pour l'autonomie numérique des seniors.",
        type: "ONE_TO_MANY",
        category: "DIGITAL_HELP",
        durationHours: 2,
        maxParticipants: 8,
        minParticipants: 1,
        status: "OPEN",
        fundingSource: "COMMUNITY_POT",
        isSolidarity: true,
        solidarityCategory: "DIGITAL_HELP",
        solidarityReason: "Aide à l'autonomie numérique des seniors",
        city: "Écouen",
        organizerId: sarahUser.id,
      },
    });

    // Organizer participant
    await prisma.collectiveMissionParticipant.create({
      data: {
        missionId: m1.id,
        userId: sarahUser.id,
        role: "ORGANIZER",
        status: "JOINED",
      },
    });

    // Alice as BENEFICIARY
    await prisma.collectiveMissionParticipant.create({
      data: {
        missionId: m1.id,
        userId: aliceUser.id,
        role: "BENEFICIARY",
        status: "JOINED",
      },
    });

    console.log(`  ✅ Mission 1 créée : "${m1.title}"`);
  }

  // ── Mission 2: "Rangement jardin solidaire" ────────────────────────────
  if (!existingTitles.has("Rangement jardin solidaire")) {
    const m2 = await prisma.collectiveMission.create({
      data: {
        title: "Rangement jardin solidaire",
        description:
          "Aide collective au jardinage pour une personne âgée : désherbage, taille, rangement des outils et nettoyage de la terrasse.",
        type: "MANY_TO_ONE",
        category: "SENIOR_SUPPORT",
        durationHours: 3,
        maxParticipants: 5,
        minParticipants: 1,
        status: "OPEN",
        fundingSource: "COMMUNITY_POT",
        isSolidarity: true,
        solidarityCategory: "SENIOR_SUPPORT",
        solidarityReason: "Aide au jardinage pour personne âgée",
        organizerId: alexUser.id,
      },
    });

    // Organizer participant
    await prisma.collectiveMissionParticipant.create({
      data: {
        missionId: m2.id,
        userId: alexUser.id,
        role: "ORGANIZER",
        status: "JOINED",
      },
    });

    console.log(`  ✅ Mission 2 créée : "${m2.title}"`);
  }

  // ── Mission 3: "Repair Café quartier" ──────────────────────────────────
  if (!existingTitles.has("Repair Café quartier")) {
    const m3 = await prisma.collectiveMission.create({
      data: {
        title: "Repair Café quartier",
        description:
          "Atelier collectif de réparation participative : petits électroménagers, vêtements, meubles. Apportez vos objets à réparer !",
        type: "MANY_TO_MANY",
        category: "LOCAL_SUPPORT",
        durationHours: 3,
        maxParticipants: 12,
        minParticipants: 1,
        status: "OPEN",
        fundingSource: "NONE",
        isSolidarity: true,
        solidarityCategory: "LOCAL_SUPPORT",
        solidarityReason: "Repair Café de quartier",
        organizerId: sarahUser.id,
      },
    });

    // Organizer participant
    await prisma.collectiveMissionParticipant.create({
      data: {
        missionId: m3.id,
        userId: sarahUser.id,
        role: "ORGANIZER",
        status: "JOINED",
      },
    });

    console.log(`  ✅ Mission 3 créée : "${m3.title}"`);
  }

  // ── Mission 4: "Mission collective terminée — Test" ────────────────────
  if (!existingTitles.has("Mission collective terminée — Test")) {
    const m4 = await prisma.collectiveMission.create({
      data: {
        title: "Mission collective terminée — Test",
        description:
          "Mission collective déjà terminée servant aux tests d'affichage de l'historique et du bilan comptable.",
        type: "MANY_TO_MANY",
        category: "LOCAL_SUPPORT",
        durationHours: 2,
        maxParticipants: 6,
        minParticipants: 1,
        status: "COMPLETED",
        fundingSource: "COMMUNITY_POT",
        communityPotAmount: 4,
        isSolidarity: false,
        completedAt: fiveDaysAgo,
        organizerId: alexUser.id,
      },
    });

    console.log(`  ✅ Mission 4 créée : "${m4.title}"`);

    // Create participants
    // Alex — ORGANIZER, VALIDATED
    const pAlex = await prisma.collectiveMissionParticipant.create({
      data: {
        missionId: m4.id,
        userId: alexUser.id,
        role: "ORGANIZER",
        status: "VALIDATED",
        validatedAt: fiveDaysAgo,
        hoursValidated: 2,
        timeReward: 2,
      },
    });

    // Sarah — CONTRIBUTOR, VALIDATED
    const pSarah = await prisma.collectiveMissionParticipant.create({
      data: {
        missionId: m4.id,
        userId: sarahUser.id,
        role: "CONTRIBUTOR",
        status: "VALIDATED",
        validatedAt: fiveDaysAgo,
        hoursValidated: 2,
        timeReward: 2,
      },
    });

    // Karim — CONTRIBUTOR, VALIDATED
    const pKarim = await prisma.collectiveMissionParticipant.create({
      data: {
        missionId: m4.id,
        userId: karimUser.id,
        role: "CONTRIBUTOR",
        status: "VALIDATED",
        validatedAt: fiveDaysAgo,
        hoursValidated: 2,
        timeReward: 2,
      },
    });

    console.log("  ✓ Participants créés avec validation");

    // Create Transactions for Sarah and Karim
    const txnSarah = await prisma.transaction.create({
      data: {
        toId: sarahUser.id,
        amount: 2,
        type: "collective_mission_reward",
        status: "completed",
      },
    });
    // Update participant with transactionId
    await prisma.collectiveMissionParticipant.update({
      where: { id: pSarah.id },
      data: { transactionId: txnSarah.id },
    });

    // Credit Sarah's timeBalance
    await prisma.user.update({
      where: { id: sarahUser.id },
      data: { timeBalance: { increment: 2 } },
    });

    const txnKarim = await prisma.transaction.create({
      data: {
        toId: karimUser.id,
        amount: 2,
        type: "collective_mission_reward",
        status: "completed",
      },
    });
    // Update participant with transactionId
    await prisma.collectiveMissionParticipant.update({
      where: { id: pKarim.id },
      data: { transactionId: txnKarim.id },
    });

    // Credit Karim's timeBalance
    await prisma.user.update({
      where: { id: karimUser.id },
      data: { timeBalance: { increment: 2 } },
    });

    console.log("  ✓ Transactions TIME créées pour Sarah et Karim (+2 chacun)");

    // Create CommunityPotTransaction
    await prisma.communityPotTransaction.create({
      data: {
        potId: pot.id,
        userId: alexUser.id,
        amount: 4,
        type: "COLLECTIVE_MISSION_FUNDING",
        reason: "Mission collective terminée",
      },
    });

    // Debit the pot by 4
    await prisma.communityPot.update({
      where: { id: pot.id },
      data: { balance: { decrement: 4 } },
    });

    console.log("  ✓ Pot commun débité de 4 TIME (COLLECTIVE_MISSION_FUNDING)");
  } else {
    console.log("  ⏭  Mission 4 existe déjà — skip (ne peut pas être recréée car TIME déjà distribué)");
  }

  console.log("");
  console.log("━".repeat(50));
  console.log("✅ Seed missions collectives terminé avec succès !\n");
  console.log("📋 Missions créées :");
  if (!existingTitles.has("Atelier smartphone senior — Écouen")) {
    console.log("  1. Atelier smartphone senior — Écouen  | ONE_TO_MANY  | DIGITAL_HELP  | OUVERTE");
  }
  if (!existingTitles.has("Rangement jardin solidaire")) {
    console.log("  2. Rangement jardin solidaire           | MANY_TO_ONE  | SENIOR_SUPPORT | OUVERTE");
  }
  if (!existingTitles.has("Repair Café quartier")) {
    console.log("  3. Repair Café quartier                  | MANY_TO_MANY | LOCAL_SUPPORT  | OUVERTE");
  }
  if (!existingTitles.has("Mission collective terminée — Test")) {
    console.log("  4. Mission collective terminée — Test    | MANY_TO_MANY | LOCAL_SUPPORT  | TERMINÉE");
  }
  console.log("");
  console.log("🧪 Vérifier :");
  console.log("  /collective-missions     → Liste des missions");
  console.log("  /facilitator/community-pot → KPIs (Collectives)");
  console.log("  /wallet                  → Comptes Sarah & Karim (+2 TIME)");
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
