// ─── Seed démo — Programme Lien Social Seniors (Lot 24) ────────────
// Usage: npx tsx prisma/seed-senior-program.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function getOrCreateUser(
  email: string,
  name: string,
  city: string = "Saint-Martin-sur-Seine",
  role: string = "USER"
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const hash = await bcrypt.hash("TimeHeroes2026!", 10);
  return prisma.user.create({
    data: {
      name,
      email,
      password: hash,
      walletAddress: `0xsl_${email.replace(/[^a-z0-9]/g, "")}`,
      timeBalance: 30,
      role,
      city,
      department: "Val-d'Oise",
      region: "Île-de-France",
      reputation: 4.0,
    },
  });
}

async function getOrCreateOrg(
  slug: string,
  name: string,
  ownerId: string,
  city: string = "Saint-Martin-sur-Seine"
) {
  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) return existing;

  return prisma.organization.create({
    data: {
      name,
      slug,
      type: "MAIRIE_SERVICE",
      status: "ACTIVE",
      shortDescription:
        "Ville démo pour le programme Lien Social Seniors — TimeHeroes",
      description:
        "Municipalité engagée dans la lutte contre l'isolement des seniors via l'entraide locale.",
      city,
      department: "Val-d'Oise",
      region: "Île-de-France",
      isVerified: true,
      createdById: ownerId,
    },
  });
}

async function getOrCreateMember(
  organizationId: string,
  userId: string,
  role: string = "MEMBER"
) {
  const existing = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
  if (existing) return existing;

  return prisma.organizationMember.create({
    data: { organizationId, userId, role, status: "ACTIVE" },
  });
}

async function main() {
  console.log("🌱 Seeding Senior Social Link Program...");

  // 1. Create users
  const owner = await getOrCreateUser(
    "mairie.demo@timeheroes.fr",
    "Marie Dubois",
    "Saint-Martin-sur-Seine",
    "ADMIN"
  );

  const facilitator1 = await getOrCreateUser(
    "facilitateur1@timeheroes.fr",
    "Claude Martin"
  );
  const facilitator2 = await getOrCreateUser(
    "facilitateur2@timeheroes.fr",
    "Sophie Leroy"
  );

  // Seniors (8)
  const seniors = await Promise.all([
    getOrCreateUser("senior1@timeheroes.fr", "Jeanne Moreau"),
    getOrCreateUser("senior2@timeheroes.fr", "Marcel Dupont"),
    getOrCreateUser("senior3@timeheroes.fr", "Yvonne Petit"),
    getOrCreateUser("senior4@timeheroes.fr", "André Richard"),
    getOrCreateUser("senior5@timeheroes.fr", "Geneviève Bernard"),
    getOrCreateUser("senior6@timeheroes.fr", "Pierre Lambert"),
    getOrCreateUser("senior7@timeheroes.fr", "Simone Girard"),
    getOrCreateUser("senior8@timeheroes.fr", "Henri Fontaine"),
  ]);

  // Heroes (10)
  const heroes = await Promise.all([
    getOrCreateUser("hero1@timeheroes.fr", "Lucas Morel"),
    getOrCreateUser("hero2@timeheroes.fr", "Camille Dubois"),
    getOrCreateUser("hero3@timeheroes.fr", "Antoine Roux"),
    getOrCreateUser("hero4@timeheroes.fr", "Élise Martin"),
    getOrCreateUser("hero5@timeheroes.fr", "Thomas Lefèvre"),
    getOrCreateUser("hero6@timeheroes.fr", "Julie Petit"),
    getOrCreateUser("hero7@timeheroes.fr", "Nicolas Bernard"),
    getOrCreateUser("hero8@timeheroes.fr", "Sarah Cohen"),
    getOrCreateUser("hero9@timeheroes.fr", "Maxime Durand"),
    getOrCreateUser("hero10@timeheroes.fr", "Léa Robert"),
  ]);

  // Caregivers (2)
  const caregivers = await Promise.all([
    getOrCreateUser("aidant1@timeheroes.fr", "Christine Moreau"),
    getOrCreateUser("aidant2@timeheroes.fr", "Philippe Girard"),
  ]);

  // 2. Create organization
  const org = await getOrCreateOrg(
    "ville-demo-seniors",
    "Ville Démo — Lien Social Seniors",
    owner.id
  );
  console.log(`  ✓ Organisation: ${org.name}`);

  // 3. Add members
  const allUsers = [
    { user: owner, role: "OWNER" },
    { user: facilitator1, role: "FACILITATOR" },
    { user: facilitator2, role: "FACILITATOR" },
    ...seniors.map((s) => ({ user: s, role: "MEMBER" as const })),
    ...heroes.map((h) => ({ user: h, role: "MEMBER" as const })),
    ...caregivers.map((c) => ({ user: c, role: "MEMBER" as const })),
  ];

  for (const { user, role } of allUsers) {
    await getOrCreateMember(org.id, user.id, role);
  }
  console.log(`  ✓ ${allUsers.length} membres ajoutés`);

  // 4. Create or get program
  const slug = "programme-lien-social-seniors";
  let program = await prisma.organizationProgram.findUnique({
    where: { organizationId_slug: { organizationId: org.id, slug } },
  });

  if (!program) {
    program = await prisma.organizationProgram.create({
      data: {
        organizationId: org.id,
        name: "Programme Lien Social Seniors",
        slug,
        type: "SENIOR_SOCIAL_LINK",
        status: "ACTIVE",
        shortDescription:
          "Un programme de 12 semaines pour réduire l'isolement des seniors grâce à l'entraide locale.",
        description:
          "Le programme Lien Social Seniors permet à une organisation locale de mobiliser des habitants, Heroes, aidants et partenaires autour de seniors isolés. Il structure des missions simples : visites conviviales, aide numérique, accompagnement aux courses, appels réguliers, cafés conversation et cercles de soutien.",
        targetAudience:
          "Seniors isolés, aidants, habitants volontaires, associations locales",
        goalsJson: JSON.stringify([
          "Réduire l'isolement social",
          "Créer des liens de confiance dans le quartier",
          "Aider les seniors dans les usages numériques simples",
          "Mobiliser des habitants volontaires",
          "Mesurer l'impact humain avant et après le programme",
          "Produire un rapport d'impact exploitable par l'organisation",
        ]),
        settingsJson: JSON.stringify({
          recommendedDurationWeeks: 12,
          defaultSocialValueHourlyRate: 15,
          allowWellbeingSurveys: true,
          allowImpactReports: true,
          allowMissionTemplates: true,
        }),
        createdById: owner.id,
      },
    });
  }
  console.log(`  ✓ Programme: ${program.name} (${program.status})`);

  // 5. Add participants
  const seniorParticipants: { user: typeof seniors[0]; role: string }[] = seniors.map((s) => ({
    user: s,
    role: "SENIOR",
  }));
  const heroParticipants: { user: typeof heroes[0]; role: string }[] = heroes.map((h) => ({
    user: h,
    role: "HERO",
  }));
  const caregiverParticipants: { user: typeof caregivers[0]; role: string }[] = caregivers.map((c) => ({
    user: c,
    role: "CAREGIVER",
  }));
  const facilitatorParticipants = [
    { user: facilitator1, role: "FACILITATOR" },
    { user: facilitator2, role: "FACILITATOR" },
  ];

  const allParticipants = [
    ...seniorParticipants,
    ...heroParticipants,
    ...caregiverParticipants,
    ...facilitatorParticipants,
  ];

  let participantCount = 0;
  for (const { user, role } of allParticipants) {
    const existing = await prisma.programParticipant.findUnique({
      where: { programId_userId: { programId: program.id, userId: user.id } },
    });
    if (!existing) {
      await prisma.programParticipant.create({
        data: { programId: program.id, userId: user.id, role, status: "ACTIVE" },
      });
      participantCount++;
    }
  }
  console.log(`  ✓ ${participantCount} participants ajoutés au programme`);

  // 6. Create solidarity missions (8 real missions, 3-5 completed)
  const missionTemplates = [
    { title: "Visite conviviale — Jeanne", category: "visite", desc: "Passer du temps avec Jeanne, discussion et lecture" },
    { title: "Digital Buddy — Marcel", category: "numérique", desc: "Aider Marcel à utiliser WhatsApp pour appeler sa famille" },
    { title: "Accompagnement courses — Yvonne", category: "courses", desc: "Accompagner Yvonne au marché du samedi" },
    { title: "Café conversation — Groupe seniors", category: "collectif", desc: "Moment collectif de discussion autour d'un café" },
    { title: "Balade accompagnée — André", category: "activité", desc: "Marche douce au parc avec André" },
    { title: "Appel hebdomadaire — Geneviève", category: "appel", desc: "Appel de convivialité hebdomadaire" },
    { title: "Aide administrative — Pierre", category: "administratif", desc: "Aide pour formulaire en ligne" },
    { title: "Atelier WhatsApp famille", category: "numérique", desc: "Atelier collectif pour apprendre WhatsApp" },
  ];

  let missionCountCreated = 0;
  for (let i = 0; i < missionTemplates.length; i++) {
    const tmpl = missionTemplates[i];
    const heroIndex = i % heroes.length;
    const existingMissions = await prisma.service.findMany({
      where: { title: tmpl.title, organizationId: org.id },
    });
    if (existingMissions.length > 0) continue;

    await prisma.service.create({
      data: {
        title: tmpl.title,
        description: tmpl.desc,
        category: tmpl.category,
        ratePerHour: 2,
        providerId: heroes[heroIndex].id,
        organizationId: org.id,
        status: i < 5 ? "completed" : "active",
        isSolidarityMission: true,
        solidarityCategory: "SENIOR_PROGRAM",
        solidarityStatus: "CLASSIC",
      },
    });
    missionCountCreated++;
  }
  console.log(`  ✓ ${missionCountCreated} missions créées`);

  // 7. Create wellbeing surveys (5 BEFORE, 5 AFTER)
  let wellbeingCount = 0;
  for (let i = 0; i < 5; i++) {
    const senior = seniors[i];
    const existingBefore = await prisma.wellbeingSurvey.findFirst({
      where: { userId: senior.id, programId: program.id, phase: "BEFORE" },
    });
    if (!existingBefore) {
      await prisma.wellbeingSurvey.create({
        data: {
          programId: program.id,
          userId: senior.id,
          contextType: "PROGRAM",
          contextId: program.id,
          phase: "BEFORE",
          status: "COMPLETED",
          isolationScore: Math.floor(Math.random() * 2) + 2, // 2-3
          supportScore: Math.floor(Math.random() * 2) + 2,
          usefulnessScore: Math.floor(Math.random() * 2) + 2,
          trustScore: Math.floor(Math.random() * 2) + 2,
          contributionScore: Math.floor(Math.random() * 2) + 2,
          scoreAverage: 45 + Math.floor(Math.random() * 15),
          comment: `Avant le programme, je me sens parfois seul${i % 2 === 0 ? "e" : ""}.`,
        },
      });
      wellbeingCount++;
    }

    const existingAfter = await prisma.wellbeingSurvey.findFirst({
      where: { userId: senior.id, programId: program.id, phase: "AFTER" },
    });
    if (!existingAfter) {
      await prisma.wellbeingSurvey.create({
        data: {
          programId: program.id,
          userId: senior.id,
          contextType: "PROGRAM",
          contextId: program.id,
          phase: "AFTER",
          status: "COMPLETED",
          isolationScore: Math.floor(Math.random() * 2) + 3, // 3-4
          supportScore: Math.floor(Math.random() * 2) + 3,
          usefulnessScore: Math.floor(Math.random() * 2) + 3,
          trustScore: Math.floor(Math.random() * 2) + 3,
          contributionScore: Math.floor(Math.random() * 2) + 3,
          scoreAverage: 65 + Math.floor(Math.random() * 15),
          comment: `Grâce au programme, j'ai rencontré des personnes formidables.`,
        },
      });
      wellbeingCount++;
    }
  }
  console.log(`  ✓ ${wellbeingCount} questionnaires wellbeing créés`);

  console.log("\n✅ Seed programme Lien Social Seniors terminé !");
  console.log(`   Organisation: ${org.name}`);
  console.log(`   Programme: ${program.name}`);
  console.log(`   Participants: ${allParticipants.length}`);
  console.log(`   Missions: ${missionTemplates.length}`);
  console.log(`   Wellbeing: ${wellbeingCount} réponses`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
