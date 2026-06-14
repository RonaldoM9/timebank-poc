import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Badge definitions matching gamification.ts logic ───────────────────────
interface BadgeDef {
  code: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}

const BADGES: BadgeDef[] = [
  // Engagement
  { code: "first-mission", name: "First Mission", description: "Termine ta première mission", category: "engagement", icon: "sparkles" },
  { code: "helping-hand", name: "Helping Hand", description: "Termine 3 missions", category: "engagement", icon: "heart" },
  { code: "local-hero", name: "Local Hero", description: "Termine 10 missions", category: "engagement", icon: "shield" },

  // Solidarity
  { code: "time-giver", name: "Time Giver", description: "Donne au moins 1 TIME", category: "solidarity", icon: "gift" },
  { code: "generous-hero", name: "Generous Hero", description: "Donne au moins 5 TIME", category: "solidarity", icon: "hand" },

  // Trust
  { code: "trusted-hero", name: "Trusted Hero", description: "Reçois 5 avis positifs", category: "trust", icon: "star" },
  { code: "reliable-hero", name: "Reliable Hero", description: "5 missions sans annulation", category: "trust", icon: "check" },
  { code: "great-feedback", name: "Great Feedback", description: "5 avis avec une moyenne ≥ 4.5", category: "trust", icon: "thumbs-up" },

  // Skills
  { code: "tech-helper", name: "Tech Helper", description: "3 missions tech/numérique", category: "skill", icon: "monitor" },
  { code: "diy-helper", name: "DIY Helper", description: "3 missions bricolage", category: "skill", icon: "hammer" },
  { code: "learning-buddy", name: "Learning Buddy", description: "3 missions soutien scolaire", category: "skill", icon: "book" },
  { code: "kitchen-hero", name: "Kitchen Hero", description: "3 missions cuisine", category: "skill", icon: "utensils" },
  { code: "strong-arms", name: "Strong Arms", description: "3 missions déménagement", category: "skill", icon: "dumbbell" },
  { code: "admin-ally", name: "Admin Ally", description: "3 missions administratives", category: "skill", icon: "file-text" },
  { code: "senior-ally", name: "Senior Ally", description: "3 missions seniors", category: "skill", icon: "heart" },

  // Community
  { code: "community-builder", name: "Community Builder", description: "Implique-toi dans 3 missions", category: "community", icon: "users" },

  // Impact
  { code: "impact-maker", name: "Impact Maker", description: "20 TIME d'impact cumulés", category: "impact", icon: "zap" },
];

// ─── Quest definitions ──────────────────────────────────────────────────────
interface QuestDef {
  code: string;
  title: string;
  description: string;
  targetType: string;
  targetValue: number;
  rewardXp: number;
  badgeCode: string | null;
}

const QUESTS: QuestDef[] = [
  { code: "first-mission-quest", title: "Première mission", description: "Termine ta première mission sur TimeHeroes", targetType: "missions_completed", targetValue: 1, rewardXp: 50, badgeCode: "first-mission" },
  { code: "three-missions", title: "En pleine forme", description: "Termine 3 missions", targetType: "missions_completed", targetValue: 3, rewardXp: 100, badgeCode: "helping-hand" },
  { code: "first-donation", title: "Premier don", description: "Donne 1 TIME au pot commun", targetType: "time_donated", targetValue: 1, rewardXp: 50, badgeCode: "time-giver" },
  { code: "profile-complete", title: "Profil au complet", description: "Remplis ta bio et ta ville", targetType: "profile_complete", targetValue: 2, rewardXp: 30, badgeCode: null },
  { code: "category-explorer", title: "Explorateur", description: "Essaie 3 catégories différentes", targetType: "categories_explored", targetValue: 3, rewardXp: 75, badgeCode: null },
];

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("🏅 TimeHeroes Gamification Seed — Démarrage...\n");

  // Step 1: Upsert badges
  console.log(`📌 Création de ${BADGES.length} badges...`);
  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: {
        name: badge.name,
        description: badge.description,
        category: badge.category,
        icon: badge.icon,
        isActive: true,
      },
      create: {
        code: badge.code,
        name: badge.name,
        description: badge.description,
        category: badge.category,
        icon: badge.icon,
        isActive: true,
      },
    });
  }
  console.log(`  ✓ ${BADGES.length} badges créés/mis à jour`);

  // Step 2: Upsert quests
  console.log(`\n📌 Création de ${QUESTS.length} quêtes...`);
  for (const quest of QUESTS) {
    await prisma.quest.upsert({
      where: { code: quest.code },
      update: {
        title: quest.title,
        description: quest.description,
        targetType: quest.targetType,
        targetValue: quest.targetValue,
        rewardXp: quest.rewardXp,
        badgeCode: quest.badgeCode,
        isActive: true,
      },
      create: {
        code: quest.code,
        title: quest.title,
        description: quest.description,
        targetType: quest.targetType,
        targetValue: quest.targetValue,
        rewardXp: quest.rewardXp,
        badgeCode: quest.badgeCode,
        isActive: true,
      },
    });
  }
  console.log(`  ✓ ${QUESTS.length} quêtes créées/mises à jour`);

  // Step 3: Evaluate existing demo users for badges they already qualify for
  console.log(`\n📌 Évaluation des badges pour les utilisateurs existants...`);
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: "@timeheroes.fr" } },
    select: { id: true, email: true, name: true },
  });

  if (demoUsers.length === 0) {
    console.log("  • Aucun utilisateur démo trouvé, skip évaluation");
  } else {
    // We can't call evaluateUserRewards directly from here due to circular deps
    // Instead, just award badges based on simple counts from the existing seed data
    console.log(`  • ${demoUsers.length} utilisateurs démo — lance la connexion pour évaluer les badges automatiquement`);
    console.log(`  • Ou exécute 'npx tsx prisma/seed-demo.ts' à nouveau après ce seed`);
  }

  console.log(`\n${"═".repeat(55)}`);
  console.log("✅ Seed gamification terminé !");
  console.log(`${"═".repeat(55)}`);
  console.log(`  🏅 Badges : ${BADGES.length}`);
  console.log(`  🎯 Quêtes : ${QUESTS.length}`);
  console.log(`\nLes badges seront attribués automatiquement quand les utilisateurs`);
  console.log(`se connecteront et effectueront des actions (checkAndAwardBadges).`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed gamification:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
