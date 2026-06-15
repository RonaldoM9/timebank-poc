/**
 * Seed de démonstration — Lot 21 IA Matchmaking assistée.
 *
 * Crée 3 cas de test :
 *   Cas 1 — Demande urgente numérique senior (Écouen)
 *   Cas 2 — Mission collective bricolage (jardinage)
 *   Cas 3 — Mission solidaire administrative
 *
 * Idempotent : ne crée que si les données n'existent pas.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getUserIdByEmail(email: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`Utilisateur introuvable : ${email}`);
  return user.id;
}

async function main() {
  console.log("🌱 Seed matchmaking — Lot 21");

  // ─── Vérifier si déjà seedé ────────────────────────────────────────────

  const existing = await prisma.matchRecommendation.count();
  if (existing > 0) {
    console.log(`⚠️  ${existing} recommandations existantes. Skip.`);
    // On ne skip pas — on ajoute si les cibles n'existent pas encore
  }

  // ─── Récupérer les utilisateurs ─────────────────────────────────────────

  const hugoId = await getUserIdByEmail("hugo.demo@timeheroes.fr");
  const nadiaId = await getUserIdByEmail("nadia.demo@timeheroes.fr");
  const julieId = await getUserIdByEmail("julie.demo@timeheroes.fr");
  const sarahId = await getUserIdByEmail("sarah.demo@timeheroes.fr");
  const karimId = await getUserIdByEmail("karim.demo@timeheroes.fr");
  const marcId = await getUserIdByEmail("marc.demo@timeheroes.fr");
  const samirId = await getUserIdByEmail("samir.demo@timeheroes.fr");
  const inesId = await getUserIdByEmail("ines.demo@timeheroes.fr");
  const aliceId = await getUserIdByEmail("alice.seed@timeheroes.fr");
  const facilitatorId = sarahId; // Sarah Martin est FACILITATOR

  // ─── Cas 1 — Demande urgente numérique senior ─────────────────────────

  const existingUrgent = await prisma.urgentRequest.findFirst({
    where: { title: "Aide smartphone senior — Écouen" },
  });
  const urgentRequestId = existingUrgent?.id ?? (await prisma.urgentRequest.create({
    data: {
      requesterId: aliceId,
      title: "Aide smartphone senior — Écouen",
      description: "Besoin d'aide pour configurer un smartphone et comprendre les applications de base (appels, messages, photos). Senior de 78 ans à Écouen.",
      category: "numérique",
      city: "Écouen",
      department: "95",
      region: "Île-de-France",
      online: false,
      urgency: "today",
      hours: 2,
      ratePerHour: 1,
      totalTime: 2,
      status: "open",
    },
  })).id;
  console.log(`📌 Cas 1 — UrgentRequest créé : ${urgentRequestId}`);

  // ─── Cas 2 — Mission collective bricolage ─────────────────────────────

  const existingCM = await prisma.collectiveMission.findFirst({
    where: { title: "Escouade Renfort — Rangement jardin" },
  });
  const collectiveMissionId = existingCM?.id ?? (await prisma.collectiveMission.create({
    data: {
      title: "Escouade Renfort — Rangement jardin",
      description: "Besoin de 5 bénévoles pour aider au rangement d'un jardin partagé : désherbage, taille, nettoyage. Goûter offert !",
      type: "MANY_TO_ONE",
      category: "jardinage",
      status: "OPEN",
      organizerId: aliceId,
      facilitatorId: facilitatorId,
      city: "Écouen",
      department: "95",
      region: "Île-de-France",
      online: false,
      durationHours: 3,
      minParticipants: 3,
      maxParticipants: 5,
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      isSolidarity: false,
    },
  })).id;
  console.log(`📌 Cas 2 — CollectiveMission créée : ${collectiveMissionId}`);

  // ─── Cas 3 — Mission solidaire administrative ─────────────────────────

  const existingSvc = await prisma.service.findFirst({
    where: { title: "Aide administrative — Démarches en ligne" },
  });
  const solidarityServiceId = existingSvc?.id ?? (await prisma.service.create({
    data: {
      title: "Aide administrative — Démarches en ligne",
      description: "Accompagnement aux démarches administratives en ligne : CAF, impôts, sécurité sociale. Mission solidaire ouverte à tous.",
      category: "administratif",
      ratePerHour: 1,
      providerId: aliceId,
      status: "active",
      isSolidarityMission: true,
      solidarityCategory: "social",
      solidarityStatus: "CLASSIC",
      solidarityReason: "Aide aux démarches pour personnes éloignées du numérique",
    },
  })).id;
  console.log(`📌 Cas 3 — Service solidaire créé : ${solidarityServiceId}`);

  // ─── Pré-générer des recommandations avec scores attendus ───────────────

  // On supprime les anciennes recommandations pour ces cibles (clean re-seed)
  for (const [targetType, targetId] of [
    ["URGENT_REQUEST", urgentRequestId],
    ["COLLECTIVE_MISSION", collectiveMissionId],
    ["SOLIDARITY_MISSION", solidarityServiceId],
  ] as const) {
    await prisma.matchRecommendation.deleteMany({
      where: { targetType, targetId } as any,
    });
  }

  // Cas 1 — Urgent : aide smartphone senior
  await prisma.matchRecommendation.createMany({
    data: [
      {
        targetType: "URGENT_REQUEST", targetId: urgentRequestId,
        candidateId: hugoId, facilitatorId,
        score: 91, skillScore: 100, locationScore: 75, availabilityScore: 90, trustScore: 88, reciprocityScore: 80, communityHealthScore: 85,
        reasonsJson: JSON.stringify(["Compétence forte : aide numérique et smartphone", "Disponible en ligne", "Peu sollicité ce mois-ci", "Profil fiable et complet"]),
        risksJson: JSON.stringify(["Peu d'expérience avec les seniors"]),
        status: "PENDING_REVIEW",
      },
      {
        targetType: "URGENT_REQUEST", targetId: urgentRequestId,
        candidateId: nadiaId, facilitatorId,
        score: 83, skillScore: 70, locationScore: 100, availabilityScore: 80, trustScore: 90, reciprocityScore: 70, communityHealthScore: 75,
        reasonsJson: JSON.stringify(["Bonne compétence : accompagnement seniors", "Même ville que la demande (Écouen)", "Très bonne réputation"]),
        risksJson: JSON.stringify(["Catégorie proche mais pas exacte — aide numérique"]),
        status: "PENDING_REVIEW",
      },
      {
        targetType: "URGENT_REQUEST", targetId: urgentRequestId,
        candidateId: julieId, facilitatorId,
        score: 71, skillScore: 50, locationScore: 75, availabilityScore: 80, trustScore: 85, reciprocityScore: 75, communityHealthScore: 65,
        reasonsJson: JSON.stringify(["Expérience administrative utile", "Proche (même département)", "Fiable : bonne réputation"]),
        risksJson: JSON.stringify(["Compétence partielle sur le numérique"]),
        status: "PENDING_REVIEW",
      },
      {
        targetType: "URGENT_REQUEST", targetId: urgentRequestId,
        candidateId: sarahId, facilitatorId,
        score: 62, skillScore: 70, locationScore: 100, availabilityScore: 30, trustScore: 75, reciprocityScore: 60, communityHealthScore: 30,
        reasonsJson: JSON.stringify(["Expérience avec les seniors", "Même ville"]),
        risksJson: JSON.stringify(["Déjà très sollicitée ce mois-ci", "Risque de surcharge"]),
        status: "PENDING_REVIEW",
      },
      {
        targetType: "URGENT_REQUEST", targetId: urgentRequestId,
        candidateId: karimId, facilitatorId,
        score: 45, skillScore: 30, locationScore: 75, availabilityScore: 60, trustScore: 50, reciprocityScore: 40, communityHealthScore: 45,
        reasonsJson: JSON.stringify(["Proche géographiquement"]),
        risksJson: JSON.stringify(["Compétence faible sur le numérique", "Peu d'avis reçus"]),
        status: "PENDING_REVIEW",
      },
    ],
  });
  console.log(`✅ Cas 1 — 5 recommandations créées`);

  // Cas 2 — Collective : rangement jardin
  await prisma.matchRecommendation.createMany({
    data: [
      {
        targetType: "COLLECTIVE_MISSION", targetId: collectiveMissionId,
        candidateId: karimId, facilitatorId,
        score: 93, skillScore: 100, locationScore: 75, availabilityScore: 95, trustScore: 60, reciprocityScore: 80, communityHealthScore: 95,
        reasonsJson: JSON.stringify(["Compétence forte : bricolage et jardinage", "Disponible — peu de missions en cours", "Hero sous-utilisé — bon à activer"]),
        risksJson: JSON.stringify(["Réputation encore à établir"]),
        status: "PENDING_REVIEW",
      },
      {
        targetType: "COLLECTIVE_MISSION", targetId: collectiveMissionId,
        candidateId: marcId, facilitatorId,
        score: 87, skillScore: 100, locationScore: 50, availabilityScore: 85, trustScore: 85, reciprocityScore: 75, communityHealthScore: 85,
        reasonsJson: JSON.stringify(["Compétence exacte : bricolage et jardinage", "Fiable : bonne réputation", "Activité modérée ce mois-ci"]),
        risksJson: JSON.stringify(["Voisinage mais pas même ville"]),
        status: "PENDING_REVIEW",
      },
      {
        targetType: "COLLECTIVE_MISSION", targetId: collectiveMissionId,
        candidateId: samirId, facilitatorId,
        score: 76, skillScore: 70, locationScore: 100, availabilityScore: 70, trustScore: 70, reciprocityScore: 65, communityHealthScore: 70,
        reasonsJson: JSON.stringify(["Compétence en bricolage et jardinage", "Même ville (Écouen)"]),
        risksJson: JSON.stringify(["Charge modérée — déjà quelques missions"]),
        status: "PENDING_REVIEW",
      },
      {
        targetType: "COLLECTIVE_MISSION", targetId: collectiveMissionId,
        candidateId: hugoId, facilitatorId,
        score: 55, skillScore: 30, locationScore: 75, availabilityScore: 80, trustScore: 88, reciprocityScore: 70, communityHealthScore: 50,
        reasonsJson: JSON.stringify(["Disponible et fiable"]),
        risksJson: JSON.stringify(["Compétence faible en jardinage — spécialisé numérique"]),
        status: "PENDING_REVIEW",
      },
      {
        targetType: "COLLECTIVE_MISSION", targetId: collectiveMissionId,
        candidateId: sarahId, facilitatorId,
        score: 48, skillScore: 30, locationScore: 100, availabilityScore: 20, trustScore: 75, reciprocityScore: 50, communityHealthScore: 30,
        reasonsJson: JSON.stringify(["Même ville"]),
        risksJson: JSON.stringify(["Déjà très sollicitée ce mois-ci", "Compétence éloignée du jardinage"]),
        status: "PENDING_REVIEW",
      },
    ],
  });
  console.log(`✅ Cas 2 — 5 recommandations créées`);

  // Cas 3 — Solidaire : administrative
  await prisma.matchRecommendation.createMany({
    data: [
      {
        targetType: "SOLIDARITY_MISSION", targetId: solidarityServiceId,
        candidateId: julieId, facilitatorId,
        score: 94, skillScore: 100, locationScore: 75, availabilityScore: 90, trustScore: 92, reciprocityScore: 85, communityHealthScore: 90,
        reasonsJson: JSON.stringify(["Compétence exacte : administratif", "Très fiable : réputation élevée", "Disponible — peu de charge", "Bon équilibre donner/recevoir"]),
        risksJson: JSON.stringify([]),
        status: "PENDING_REVIEW",
      },
      {
        targetType: "SOLIDARITY_MISSION", targetId: solidarityServiceId,
        candidateId: inesId, facilitatorId,
        score: 81, skillScore: 70, locationScore: 100, availabilityScore: 80, trustScore: 75, reciprocityScore: 70, communityHealthScore: 75,
        reasonsJson: JSON.stringify(["Même ville (Écouen)", "Bonne réputation"]),
        risksJson: JSON.stringify(["Compétence proche mais pas spécialisée administrative"]),
        status: "PENDING_REVIEW",
      },
      {
        targetType: "SOLIDARITY_MISSION", targetId: solidarityServiceId,
        candidateId: hugoId, facilitatorId,
        score: 62, skillScore: 50, locationScore: 75, availabilityScore: 85, trustScore: 88, reciprocityScore: 70, communityHealthScore: 60,
        reasonsJson: JSON.stringify(["Disponible et fiable"]),
        risksJson: JSON.stringify(["Spécialisé numérique, pas administratif"]),
        status: "PENDING_REVIEW",
      },
      {
        targetType: "SOLIDARITY_MISSION", targetId: solidarityServiceId,
        candidateId: karimId, facilitatorId,
        score: 48, skillScore: 20, locationScore: 75, availabilityScore: 70, trustScore: 50, reciprocityScore: 40, communityHealthScore: 55,
        reasonsJson: JSON.stringify(["Proche géographiquement"]),
        risksJson: JSON.stringify(["Compétence éloignée", "Peu d'expérience administrative"]),
        status: "PENDING_REVIEW",
      },
    ],
  });
  console.log(`✅ Cas 3 — 4 recommandations créées`);

  console.log(`\n🎉 Seed matchmaking terminé !`);
  console.log(`   Cas 1 : UrgentRequest — aide smartphone senior (5 recs)`);
  console.log(`   Cas 2 : CollectiveMission — rangement jardin (5 recs)`);
  console.log(`   Cas 3 : Service solidaire — aide administrative (4 recs)`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
