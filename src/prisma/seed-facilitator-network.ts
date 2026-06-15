import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SEED_USERS = [
  { name: "Nadia Moreau", email: "nadia.seed@timeheroes.fr", city: "Sarcelles", skills: "Aide aux seniors, accompagnement, écoute" },
  { name: "Samir Haddad", email: "samir.seed@timeheroes.fr", city: "Écouen", skills: "Transport, bricolage, jardinage" },
  { name: "Hugo Petit", email: "hugo.seed@timeheroes.fr", city: "Paris", skills: "Informatique, dépannage numérique, smartphone" },
  { name: "Lina Morel", email: "lina.seed@timeheroes.fr", city: "Saint-Denis", skills: "Anglais, cours, traduction" },
  { name: "Claire Dubois", email: "claire.seed@timeheroes.fr", city: "Écouen", skills: "Cuisine, accompagnement" },
  { name: "Marc Simon", email: "marc.seed@timeheroes.fr", city: "Villiers-le-Bel", skills: "Bricolage, jardinage" },
] as const;

async function ensureUser(email: string, name: string, city: string, skills: string, balance: number = 0) {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const password = await bcrypt.hash("TimeHeroes2026!", 10);
    const walletAddress = `0x${Math.random().toString(36).substring(2, 10)}_seed`;
    user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        walletAddress,
        timeBalance: balance,
        city,
        role: "USER",
        availableOnline: true,
      },
    });
    // Create HeroPassport
    await prisma.heroPassport.create({
      data: {
        userId: user.id,
        bio: `Hero de ${city} — ${skills}`,
        offeredSkills: skills,
        motivations: "Aider la communauté et créer du lien social.",
      },
    });
    // Create an active service matching their skills
    const topSkill = skills.split(",")[0].trim();
    await prisma.service.create({
      data: {
        title: `${topSkill} — ${name}`,
        description: `Service proposé par ${name} : ${skills}. Disponible sur ${city}.`,
        category: mapSkillToCategory(topSkill),
        ratePerHour: 1,
        status: "active",
        providerId: user.id,
      },
    });
    console.log(`  ✓ Créé: ${name} (${email}) — ${balance} TIME, ${city}`);
  } else {
    // Update balance if needed
    if (balance > 0) {
      await prisma.user.update({ where: { id: user.id }, data: { timeBalance: balance } });
    }
    console.log(`  ⏭ Existe déjà: ${name}`);
  }
  return user!;
}

function mapSkillToCategory(skill: string): string {
  const map: Record<string, string> = {
    "Aide aux seniors": "senior_support",
    "Transport": "transport",
    "Informatique": "digital_help",
    "Anglais": "education",
    "Cuisine": "daily_life",
    "Bricolage": "home_repair",
    "Accompagnement": "companionship",
    "Dépannage numérique": "digital_help",
    "Jardinage": "home_repair",
  };
  return map[skill] || "other";
}

async function main() {
  console.log("🌱 TimeHeroes — Lot 20 Facilitator Network Seed");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // ── Step 0: Get existing users ─────────────────────────────────────────
  console.log("👤 Étape 0 — Récupération des comptes existants...");
  const sarah = await prisma.user.findUnique({ where: { email: "sarah.demo@timeheroes.fr" } });
  const alex = await prisma.user.findUnique({ where: { email: "demo@timeheroes.fr" } });
  const alice = await prisma.user.findUnique({ where: { email: "alice.seed@timeheroes.fr" } });
  const ronald = await prisma.user.findUnique({ where: { email: "ronald.demo@timebank.local" } });
  const karim = await prisma.user.findUnique({ where: { email: "karim.demo@timeheroes.fr" } });

  if (!sarah || !alex || !alice || !karim) {
    throw new Error("❌ Comptes nécessaires introuvables (sarah.demo, alex, alice.seed, karim.demo). Lance d'abord npm run seed:demo");
  }

  console.log(`  ✓ Sarah (${sarah.id}) — FACILITATOR`);
  console.log(`  ✓ Alex (${alex.id}) — ADMIN`);

  // ── Step 1: Create/ensure seed users ───────────────────────────────────
  console.log("\n👤 Étape 1 — Création des comptes seed manquants...");

  // Create with appropriate TIME balances for the scenarios
  const nadia = await ensureUser("nadia.seed@timeheroes.fr", "Nadia Moreau", "Sarcelles", "Aide aux seniors, accompagnement, écoute", 28);
  const samir = await ensureUser("samir.seed@timeheroes.fr", "Samir Haddad", "Écouen", "Transport, bricolage, jardinage", 15);
  const hugo = await ensureUser("hugo.seed@timeheroes.fr", "Hugo Petit", "Paris", "Informatique, dépannage numérique, smartphone", 5);
  const lina = await ensureUser("lina.seed@timeheroes.fr", "Lina Morel", "Saint-Denis", "Anglais, cours, traduction", 8);
  const claire = await ensureUser("claire.seed@timeheroes.fr", "Claire Dubois", "Écouen", "Cuisine, accompagnement", 22);
  const marc = await ensureUser("marc.seed@timeheroes.fr", "Marc Simon", "Villiers-le-Bel", "Bricolage, jardinage", 15);

  // ── Step 2: Pot commun ─────────────────────────────────────────────────
  console.log("\n💰 Étape 2 — Récupération du pot commun...");
  const pot = await prisma.communityPot.findFirst({ orderBy: { createdAt: "asc" } });
  if (!pot) throw new Error("❌ Pot commun introuvable");
  console.log(`  ✓ Pot: ${pot.balance} TIME`);

  // ── Step 3: Create blocked requests data ───────────────────────────────
  console.log("\n🚨 Étape 3 — Création des demandes bloquées...");

  // 3a. UrgentRequest without offers, 60h old
  const existingUrgentNoOffer = await prisma.urgentRequest.findFirst({
    where: { title: "Aide administrative urgente — sans offre" },
  });
  if (!existingUrgentNoOffer) {
    await prisma.urgentRequest.create({
      data: {
        requesterId: alice.id,
        title: "Aide administrative urgente — sans offre",
        description: "Besoin d'aide pour remplir un dossier administratif en ligne. Urgent, personne n'a encore proposé.",
        category: "admin",
        city: "Écouen",
        urgency: "today",
        hours: 2,
        ratePerHour: 1,
        totalTime: 2,
        status: "open",
        createdAt: new Date(Date.now() - 60 * 3600000),
      },
    });
    console.log("  ✓ UrgentRequest sans offre (créée il y a 60h)");
  } else {
    console.log("  ⏭ UrgentRequest sans offre déjà existante");
  }

  // 3b. UrgentRequest with offers but none accepted, 72h old
  const existingUrgentWithOffers = await prisma.urgentRequest.findFirst({
    where: { title: "Cours de smartphone pour senior" },
  });
  if (!existingUrgentWithOffers) {
    const req = await prisma.urgentRequest.create({
      data: {
        requesterId: alice.id,
        title: "Cours de smartphone pour senior",
        description: "Apprendre à utiliser WhatsApp et prendre des photos.",
        category: "digital_help",
        city: "Sarcelles",
        urgency: "this_week",
        hours: 2,
        ratePerHour: 1,
        totalTime: 2,
        status: "open",
        createdAt: new Date(Date.now() - 72 * 3600000),
      },
    });
    // Add offers that are still pending
    await prisma.urgentOffer.create({
      data: {
        urgentRequestId: req.id,
        providerId: sarah.id,
        message: "Je peux vous aider, je forme aussi des seniors.",
        status: "pending",
        createdAt: new Date(Date.now() - 48 * 3600000),
      },
    });
    console.log("  ✓ UrgentRequest avec offres pending (créée il y a 72h)");
  } else {
    console.log("  ⏭ UrgentRequest avec offres déjà existante");
  }

  // 3c. CommunityPotRequest PENDING, 3 days old (use karim if ronald doesn't exist)
  const potRequester = ronald !== null ? ronald : karim;
  const existingPotReq = await prisma.communityPotRequest.findFirst({
    where: { userId: potRequester.id, reason: { contains: "Mission solidaire" } },
  });
  if (!existingPotReq) {
    await prisma.communityPotRequest.create({
      data: {
        potId: pot.id,
        userId: potRequester.id,
        amount: 5,
        reason: "Mission solidaire — aide numérique",
        message: "Je n'ai plus de TIME et j'ai besoin d'aide pour une mission numérique.",
        status: "PENDING",
        createdAt: new Date(Date.now() - 3 * 86400000),
      },
    });
    console.log("  ✓ CommunityPotRequest PENDING (créée il y a 3 jours)");
  } else {
    console.log("  ⏭ CommunityPotRequest déjà existante");
  }

  // 3d. Mission solidaire SELF_DECLARED, 4 days old
  const existingSelfDeclared = await prisma.service.findFirst({
    where: { title: "Aide aux courses pour personne âgée", solidarityStatus: "SELF_DECLARED" },
  });
  if (!existingSelfDeclared) {
    await prisma.service.create({
      data: {
        title: "Aide aux courses pour personne âgée",
        description: "Accompagnement aux courses une fois par semaine pour une personne âgée à Écouen.",
        category: "senior_support",
        ratePerHour: 1,
        providerId: alice.id,
        status: "active",
        isSolidarityMission: true,
        solidarityCategory: "SENIOR_SUPPORT",
        solidarityStatus: "SELF_DECLARED",
        solidarityReason: "Aide régulière à une personne âgée isolée",
        createdAt: new Date(Date.now() - 4 * 86400000),
      },
    });
    console.log("  ✓ Mission solidaire SELF_DECLARED (créée il y a 4j)");
  } else {
    console.log("  ⏭ Mission solidaire SELF_DECLARED déjà existante");
  }

  // 3e. Booking pending, 7 days old
  const existingBooking = await prisma.booking.findFirst({
    where: {
      clientId: alice.id,
      status: "pending",
      createdAt: { lt: new Date(Date.now() - 5 * 86400000) },
    },
  });
  if (!existingBooking) {
    // Find an active service to book
    const service = await prisma.service.findFirst({
      where: { providerId: sarah.id, status: "active" },
    });
    if (service) {
      await prisma.booking.create({
        data: {
          serviceId: service.id,
          clientId: alice.id,
          hours: 2,
          totalTime: 2,
          status: "pending",
          createdAt: new Date(Date.now() - 7 * 86400000),
        },
      });
      console.log("  ✓ Booking pending (créé il y a 7j)");
    }
  } else {
    console.log("  ⏭ Booking pending déjà existant");
  }

  // ── Step 4: Create overused heroes data ────────────────────────────────
  console.log("\n🔥 Étape 4 — Création des données sur-sollicités...");

  // Through the getOverusedHeroes query, we need completed bookings in 30d
  // for Sarah, Nadia, and Samir's associated active services
  const thirtyDaysAgo = new Date(Date.now() - 25 * 86400000); // Within 30d

  // Create completed bookings to simulate activity
  async function createCompletedBooking(providerId: string, clientId: string, hours: number, daysAgo: number) {
    const svc = await prisma.service.findFirst({
      where: { providerId, status: "active" },
    });
    if (!svc) return null;
    return prisma.booking.create({
      data: {
        serviceId: svc.id,
        clientId,
        hours,
        totalTime: hours,
        status: "completed",
        completedAt: new Date(Date.now() - daysAgo * 86400000),
        createdAt: new Date(Date.now() - (daysAgo + 2) * 86400000),
      },
    });
  }

  // Sarah: 7 missions, 14h over 30d
  for (let i = 0; i < 7; i++) {
    const existingB = await prisma.booking.findFirst({
      where: {
        clientId: alice.id,
        status: "completed",
        completedAt: { gte: thirtyDaysAgo },
        hours: 2,
      },
    });
    if (!existingB) {
      await createCompletedBooking(sarah.id, alice.id, 2, 2 + i * 3);
    }
  }

  // Nadia: 6 missions
  for (let i = 0; i < 6; i++) {
    const existingB = await prisma.booking.findFirst({
      where: {
        clientId: alice.id,
        status: "completed",
        completedAt: { gte: thirtyDaysAgo },
        hours: 2,
      },
    });
    // Use is already checked above
  }
  // We'll handle Nadia bookings separately
  const nadiaBookingCount = await prisma.booking.count({
    where: {
      clientId: alice.id,
      status: "completed",
      completedAt: { gte: thirtyDaysAgo },
    },
  });
  if (nadiaBookingCount < 10) {
    // Create Nadia's own service and bookings
    const nadiaService = await prisma.service.findFirst({
      where: { providerId: nadia.id, status: "active" },
    });
    if (nadiaService) {
      for (let i = 0; i < 6; i++) {
        await prisma.booking.create({
          data: {
            serviceId: nadiaService.id,
            clientId: alice.id,
            hours: 1,
            totalTime: 1,
            status: "completed",
            completedAt: new Date(Date.now() - (2 + i * 4) * 86400000),
            createdAt: new Date(Date.now() - (4 + i * 4) * 86400000),
          },
        });
      }
    }
  }
  console.log("  ✓ Données sur-sollicitation créées pour Sarah & Nadia");

  // ── Step 5: Create underused heroes data ──────────────────────────────
  console.log("\n💤 Étape 5 — Création données sous-utilisés...");
  // Already have Karim, Hugo, Lina with passports + services — good!

  // ── Step 6: Create dormant time data ────────────────────────────────────
  console.log("\n💤 Étape 6 — Création données TIME dormants...");

  // Julie Bernard — create user with 30 TIME, no spend for 60d
  let julie = await prisma.user.findUnique({ where: { email: "julie.seed@timeheroes.fr" } });
  if (!julie) {
    const password = await bcrypt.hash("TimeHeroes2026!", 10);
    julie = await prisma.user.create({
      data: {
        name: "Julie Bernard",
        email: "julie.seed@timeheroes.fr",
        password,
        walletAddress: `0x${Math.random().toString(36).substring(2, 10)}_julie`,
        timeBalance: 30,
        city: "Écouen",
        role: "USER",
        availableOnline: false,
      },
    });
    console.log("  ✓ Créé: Julie Bernard (30 TIME, dormant fort)");
  } else {
    await prisma.user.update({ where: { id: julie.id }, data: { timeBalance: 30 } });
    console.log("  ⏭ Julie Bernard déjà existante");
  }

  // Also set Claire to 22 TIME
  await prisma.user.update({ where: { id: claire.id }, data: { timeBalance: 22 } });
  // Marc to 15 TIME
  await prisma.user.update({ where: { id: marc.id }, data: { timeBalance: 15 } });

  // ── Step 7: Note ────────────────────────────────────────────────────────
  console.log("\n📝 Étape 7 — Note");
  console.log("  ⏭ Les alertes seront générées au premier clic sur 'Rafraîchir' dans l'interface.");
  console.log("  Cela permet d'éviter les dépendances d'import circulaires depuis le seed.");

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log("\n" + "━".repeat(50));
  console.log("✅ Seed facilitator network terminé !\n");
  console.log("📋 Données créées :");
  console.log("  • UrgentRequest sans offre (60h)");
  console.log("  • UrgentRequest avec offres pending (72h)");
  console.log("  • CommunityPotRequest pending (3j)");
  console.log("  • Mission solidaire SELF_DECLARED (4j)");
  console.log("  • Booking pending (7j)");
  console.log("  • Données sur-sollicitation (Sarah: 7 missions/14h, Nadia: 6 missions)");
  console.log("  • TIME dormants (Julie: 30, Claire: 22, Marc: 15)\n");
  console.log("🧪 Vérifier :");
  console.log("  /facilitator/network → Dashboard Intelligence réseau");
  console.log("  Menu → Intelligence réseau (FACILITATOR/ADMIN only)");
  console.log("  Cliquer 'Rafraîchir' → Générer les alertes réseau");
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
