import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ─── BADGES ────────────────────────────────────────────────────────────────

  const badges = [
    {
      code: "first-mission",
      name: "First Mission",
      description: "Terminer sa première mission",
      category: "engagement",
      icon: "target",
    },
    {
      code: "helping-hand",
      name: "Helping Hand",
      description: "Terminer 3 missions",
      category: "engagement",
      icon: "hand",
    },
    {
      code: "local-hero",
      name: "Local Hero",
      description: "Terminer 10 missions",
      category: "engagement",
      icon: "star",
    },
    {
      code: "time-giver",
      name: "Time Giver",
      description: "Réaliser 1 don de TIME",
      category: "solidarity",
      icon: "gift",
    },
    {
      code: "generous-hero",
      name: "Generous Hero",
      description: "Donner 5 TIME au total",
      category: "solidarity",
      icon: "heart",
    },
    {
      code: "trusted-hero",
      name: "Trusted Hero",
      description: "Recevoir 5 avis positifs",
      category: "trust",
      icon: "shield-check",
    },
    {
      code: "reliable-hero",
      name: "Reliable Hero",
      description: "5 missions sans annulation",
      category: "trust",
      icon: "badge-check",
    },
    {
      code: "tech-helper",
      name: "Tech Helper",
      description: "3 missions dans la catégorie numérique",
      category: "skill",
      icon: "cpu",
    },
    {
      code: "community-builder",
      name: "Community Builder",
      description: "3 missions dans une communauté ou aide urgente",
      category: "community",
      icon: "users",
    },
    {
      code: "impact-maker",
      name: "Impact Maker",
      description: "20 TIME générés ou échangés au total",
      category: "impact",
      icon: "zap",
    },
    {
      code: "diy-helper",
      name: "DIY Helper",
      description: "3 missions dans la catégorie bricolage",
      category: "skill",
      icon: "wrench",
    },
    {
      code: "learning-buddy",
      name: "Learning Buddy",
      description: "3 missions dans la catégorie soutien scolaire",
      category: "skill",
      icon: "book-open",
    },
    {
      code: "kitchen-hero",
      name: "Kitchen Hero",
      description: "3 missions dans la catégorie cuisine",
      category: "skill",
      icon: "utensils-crossed",
    },
    {
      code: "strong-arms",
      name: "Strong Arms",
      description: "3 missions dans la catégorie déménagement/force",
      category: "skill",
      icon: "dumbbell",
    },
    {
      code: "great-feedback",
      name: "Great Feedback",
      description: "Moyenne d'avis ≥ 4,5 sur au moins 5 missions",
      category: "trust",
      icon: "thumbs-up",
    },
    {
      code: "admin-ally",
      name: "Admin Ally",
      description: "3 missions dans la catégorie aide administrative",
      category: "skill",
      icon: "file-text",
    },
    {
      code: "senior-ally",
      name: "Senior Ally",
      description: "3 missions dans la catégorie seniors",
      category: "skill",
      icon: "heart-handshake",
    },
  ];

  for (const badge of badges) {
    const existing = await prisma.badge.findUnique({ where: { code: badge.code } });
    if (!existing) {
      await prisma.badge.create({ data: badge });
      console.log(`✓ Badge créé : ${badge.code} — ${badge.name}`);
    } else {
      console.log(`· Badge déjà existant : ${badge.code}`);
    }
  }

  // ─── QUESTS ────────────────────────────────────────────────────────────────

  const quests = [
    {
      code: "welcome-hero",
      title: "Bienvenue Hero",
      description: "Compléter son profil (bio, localisation)",
      targetType: "profile_complete",
      targetValue: 1,
      rewardXp: 20,
    },
    {
      code: "first-mission-quest",
      title: "Première mission",
      description: "Terminer ta première mission en tant qu'aidant",
      targetType: "missions_completed",
      targetValue: 1,
      rewardXp: 50,
      badgeCode: "first-mission",
    },
    {
      code: "give-time-quest",
      title: "Donner du temps",
      description: "Faire un don de TIME à un autre héros",
      targetType: "time_donated",
      targetValue: 1,
      rewardXp: 30,
      badgeCode: "time-giver",
    },
    {
      code: "become-reliable",
      title: "Devenir fiable",
      description: "Terminer 3 missions sans annulation",
      targetType: "missions_completed",
      targetValue: 3,
      rewardXp: 75,
      badgeCode: "helping-hand",
    },
    {
      code: "explore-skills",
      title: "Explorer ses talents",
      description: "Réaliser des missions dans 2 catégories différentes",
      targetType: "categories_explored",
      targetValue: 2,
      rewardXp: 50,
    },
  ];

  for (const quest of quests) {
    const existing = await prisma.quest.findUnique({ where: { code: quest.code } });
    if (!existing) {
      await prisma.quest.create({ data: quest });
      console.log(`✓ Quête créée : ${quest.code} — ${quest.title}`);
    } else {
      console.log(`· Quête déjà existante : ${quest.code}`);
    }
  }

  console.log("\n✅ Seed gamification terminé !");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
