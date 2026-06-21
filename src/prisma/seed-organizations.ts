// ─── Seed données de démonstration — Organisations / Partner Spaces ───
// Usage: npx tsx prisma/seed-organizations.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function getOrCreateUser(email: string, name: string, role: string = "USER") {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const hash = await bcrypt.hash("TimeHeroes2026!", 10);
  return prisma.user.create({
    data: {
      name,
      email,
      password: hash,
      walletAddress: `0xorg_${email.replace(/[^a-z0-9]/g, "")}`,
      timeBalance: 50,
      role,
      city: "Saint-Martin-sur-Seine",
      department: "Val-d'Oise",
      region: "Île-de-France",
      reputation: 4.5,
    },
  });
}

async function createOrg(
  name: string,
  type: string,
  city: string,
  department: string,
  region: string,
  status: string,
  shortDescription: string,
  description: string,
  owner: Awaited<ReturnType<typeof getOrCreateUser>>,
  members: { user: Awaited<ReturnType<typeof getOrCreateUser>>; role: string }[],
  potBalance: number
) {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) {
    console.log(`  ⏭️  ${name} existe déjà, skip`);
    return existing;
  }

  const org = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name,
        slug,
        type,
        status,
        shortDescription,
        description,
        city,
        department,
        region,
        country: "France",
        isVerified: status !== "PENDING_REVIEW",
        verifiedAt: status !== "PENDING_REVIEW" ? new Date() : null,
        verifiedById: owner.id,
        createdById: owner.id,
        members: {
          create: [
            { userId: owner.id, role: "OWNER", status: "ACTIVE" },
            ...members.map((m) => ({
              userId: m.user.id,
              role: m.role,
              status: "ACTIVE" as const,
            })),
          ],
        },
        pot: {
          create: { balance: potBalance },
        },
      },
    });
    return org;
  });

  console.log(`  ✅ ${name} — ${type} — ${potBalance} TIME`);
  return org;
}

async function main() {
  console.log("🌱 Seed organisations de démonstration...\n");

  // ─── Users ────────────────────────────────────────────────────────
  const alex = await getOrCreateUser("demo@timeheroes.fr", "Alex Demo", "ADMIN");
  const sarah = await getOrCreateUser("sarah.demo@timeheroes.fr", "Sarah Martin", "FACILITATOR");
  const hugo = await getOrCreateUser("hugo.demo@timeheroes.fr", "Hugo Petit");
  const julie = await getOrCreateUser("julie.demo@timeheroes.fr", "Julie Bernard");
  const karim = await getOrCreateUser("karim.demo@timeheroes.fr", "Karim Benali");
  const nadia = await getOrCreateUser("nadia.demo@timeheroes.fr", "Nadia Moreau");
  const claire = await getOrCreateUser("claire.demo@timeheroes.fr", "Claire Dubois");
  const marc = await getOrCreateUser("marc.demo@timeheroes.fr", "Marc Simon");
  const samir = await getOrCreateUser("samir.demo@timeheroes.fr", "Samir Haddad");
  const lina = await getOrCreateUser("lina.demo@timeheroes.fr", "Lina Morel");

  console.log("  ✅ Utilisateurs prêts\n");

  // ─── 1. Ville Démo — Saint-Martin-sur-Seine ───────────────────────
  await createOrg(
    "Ville Démo — Saint-Martin-sur-Seine",
    "CITY",
    "Saint-Martin-sur-Seine",
    "Val-d'Oise",
    "Île-de-France",
    "ACTIVE",
    "Programme Lien Social Seniors — lutter contre l'isolement des aînés par l'entraide de quartier.",
    "La Ville Démo de Saint-Martin-sur-Seine a lancé le programme Lien Social Seniors en partenariat avec TimeHeroes. L'objectif est de mobiliser les habitants pour créer du lien avec nos aînés : ateliers numérique, accompagnement courses, visites de convivialité, petits travaux du quotidien.\n\nCe programme a déjà mobilisé plus de 30 bénévoles et permis 120 heures d'échange depuis son lancement.",
    alex,
    [
      { user: sarah, role: "FACILITATOR" },
      { user: hugo, role: "MEMBER" },
      { user: julie, role: "MEMBER" },
      { user: karim, role: "MEMBER" },
    ],
    120
  );

  // ─── 2. CCAS Écouen ───────────────────────────────────────────────
  await createOrg(
    "CCAS Écouen",
    "CCAS",
    "Écouen",
    "Val-d'Oise",
    "Île-de-France",
    "VERIFIED",
    "Centre communal d'action sociale — aide aux seniors et aux personnes isolées.",
    "Le CCAS d'Écouen propose un accompagnement personnalisé aux seniors et personnes isolées de la commune. Grâce à TimeHeroes, nous organisons des visites de convivialité, de l'aide aux courses et des ateliers collectifs.\n\nNotre mission : permettre à chacun de vieillir dans de bonnes conditions, entouré et soutenu.",
    sarah,
    [
      { user: nadia, role: "FACILITATOR" },
      { user: hugo, role: "MEMBER" },
      { user: claire, role: "MEMBER" },
    ],
    80
  );

  // ─── 3. Association Les Voisins Solidaires ────────────────────────
  await createOrg(
    "Association Les Voisins Solidaires",
    "ASSOCIATION",
    "Écouen",
    "Val-d'Oise",
    "Île-de-France",
    "VERIFIED",
    "Entraide locale et citoyenne — repair café, courses solidaires, coup de main entre voisins.",
    "Les Voisins Solidaires est une association loi 1901 qui promeut l'entraide de proximité à Écouen et ses alentours. Nous organisons des repair cafés mensuels, des maraudes de courses pour les personnes âgées, et des ateliers d'initiation au numérique.\n\nNotre credo : un voisin n'est pas un étranger, c'est un ami qu'on n'a pas encore rencontré.",
    julie,
    [
      { user: karim, role: "FACILITATOR" },
      { user: marc, role: "MEMBER" },
      { user: samir, role: "MEMBER" },
    ],
    45
  );

  // ─── 4. Résidence Horizon ─────────────────────────────────────────
  await createOrg(
    "Résidence Horizon",
    "SOCIAL_LANDLORD",
    "Saint-Martin-sur-Seine",
    "Val-d'Oise",
    "Île-de-France",
    "ACTIVE",
    "Bailleur social engagé pour le bien-vivre ensemble en résidence.",
    "Résidence Horizon gère 120 logements sociaux à Saint-Martin-sur-Seine. Nous croyons que le lien social est aussi important que le logement lui-même. Notre partenariat avec TimeHeroes permet aux résidents de s'entraider : jardin partagé, cours de cuisine, aide aux démarches.\n\nNotre objectif : créer une véritable communauté de résidents solidaires.",
    nadia,
    [
      { user: sarah, role: "FACILITATOR" },
      { user: claire, role: "MEMBER" },
      { user: hugo, role: "MEMBER" },
    ],
    30
  );

  // ─── 5. Fondation Horizon Social ──────────────────────────────────
  await createOrg(
    "Fondation Horizon Social",
    "FOUNDATION",
    "Paris",
    "Paris",
    "Île-de-France",
    "VERIFIED",
    "Financement de programmes solidaires et d'innovation sociale en Île-de-France.",
    "La Fondation Horizon Social soutient financièrement et techniquement les initiatives d'innovation sociale en Île-de-France. Nous accompagnons des structures comme TimeHeroes dans leur développement et mesurons l'impact des programmes que nous finançons.\n\nNotre engagement : 200 TIME déjà mobilisés dans nos programmes partenaires.",
    alex,
    [
      { user: sarah, role: "FACILITATOR" },
      { user: julie, role: "MEMBER" },
    ],
    200
  );

  console.log(`\n🎉 Seed organisations terminé !`);
  console.log(`   5 organisations de démonstration créées`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
