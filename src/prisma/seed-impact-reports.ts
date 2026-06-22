// ─── Seed Impact Reports — démonstration ───────────────────────────
//
// Crée 3 rapports d'impact démo pour les organisations existantes.
//
// Usage: npx tsx prisma/seed-impact-reports.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding impact reports...\n");

  // Find demo organizations
  const villeDemo = await prisma.organization.findUnique({
    where: { slug: "ville-demo-saint-martin-sur-seine" },
  });

  const ccasEcouen = await prisma.organization.findUnique({
    where: { slug: "ccas-ecouen" },
  });

  const fondation = await prisma.organization.findUnique({
    where: { slug: "fondation-horizon-social" },
  });

  if (!villeDemo) console.warn("⚠️  ville-demo-saint-martin-sur-seine not found");
  if (!ccasEcouen) console.warn("⚠️  ccas-ecouen not found");
  if (!fondation) console.warn("⚠️  fondation-horizon-social not found");

  // Find an admin user to use as generatedBy
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  const generatedById = adminUser?.id || null;

  // ─── Report 1: Ville Démo — Lien Social Seniors ──────────────

  if (villeDemo) {
    const metrics1 = {
      totalMembers: 28,
      activeMembers30d: 15,
      newMembers: 6,
      facilitatorsCount: 3,
      membersWithCompletedMission: 18,
      totalMissions: 12,
      activeMissions: 4,
      completedMissions: 8,
      collectiveMissions: 4,
      solidarityMissions: 6,
      urgentRequestsLinked: 3,
      averageParticipantsPerMission: 5,
      completionRate: 67,
      totalTimeMobilized: 84,
      timeFromCollectiveMissions: 48,
      timeFromSolidarityMissions: 36,
      organizationPotBalance: 120,
      organizationPotDonations: 45,
      organizationPotFunded: 30,
      dormantTimeDetected: 4,
      estimatedBeneficiaries: 42,
      uniqueReceivers: 18,
      receiversBecameContributors: 7,
      reciprocityRate: 25,
      averageRating: 4.5,
      ratingsCount: 16,
      blockedRequestsResolved: 2,
      averageResponseDelay: 0,
      noShowCount: 1,
      safetyReportsCount: 0,
      socialValueEstimated: 1260,
      socialValueHourlyRate: 15,
    };

    const highlights1 = [
      "28 membres engagés",
      "12 missions organisées",
      "84 TIME mobilisés",
      "6 missions solidaires",
      "4 missions collectives",
      "25 % de réciprocité",
      "42 bénéficiaires estimés",
      "1 260 € de valeur sociale estimée",
    ];

    const risks1 = [
      "La réciprocité reste faible. Peu de membres donnent et reçoivent du TIME.",
      "Le pot d'impact est bien approvisionné mais peu utilisé pour financer des missions.",
    ];

    const recommendations1 = [
      "Encourager les receveurs à devenir contributeurs pour renforcer la réciprocité.",
      "Utiliser une partie du pot d'impact pour financer des missions solidaires.",
      "Lancer des missions solidaires pour renforcer l'impact social de l'organisation.",
      "Organiser un temps d'échange local pour renforcer les liens de la communauté.",
      "Partager ce rapport d'impact avec les partenaires et financeurs.",
    ];

    const summary1 =
      "Sur la période, la Ville Démo Saint-Martin-sur-Seine a mobilisé 28 membres autour de 12 missions, dont 6 missions solidaires et 4 missions collectives. Au total, 84 TIME ont été mobilisés, représentant une valeur sociale estimée à 1 260 €. Le taux de réciprocité observé est de 25 %, ce qui montre une dynamique de contribution progressive au sein de la communauté.";

    await prisma.impactReport.upsert({
      where: { id: `seed-${villeDemo.id}-1` },
      update: {},
      create: {
        id: `seed-${villeDemo.id}-1`,
        organizationId: villeDemo.id,
        title: "Rapport Lien Social Seniors T1",
        type: "ORGANIZATION_SUMMARY",
        status: "GENERATED",
        periodStart: new Date("2027-01-01"),
        periodEnd: new Date("2027-03-31"),
        summary: summary1,
        metricsJson: JSON.stringify(metrics1),
        highlightsJson: JSON.stringify(highlights1),
        risksJson: JSON.stringify(risks1),
        recommendationsJson: JSON.stringify(recommendations1),
        socialValueHourlyRate: 15,
        socialValueEstimated: 1260,
        visibility: "ORGANIZATION",
        generatedById,
        generatedAt: new Date("2027-04-05"),
      },
    });

    console.log(`  ✅ Rapport Lien Social Seniors T1 (${villeDemo.name})`);
  }

  // ─── Report 2: CCAS Écouen — Inclusion numérique seniors ─────

  if (ccasEcouen) {
    const metrics2 = {
      totalMembers: 18,
      activeMembers30d: 12,
      newMembers: 5,
      facilitatorsCount: 2,
      membersWithCompletedMission: 10,
      totalMissions: 8,
      activeMissions: 3,
      completedMissions: 5,
      collectiveMissions: 3,
      solidarityMissions: 5,
      urgentRequestsLinked: 2,
      averageParticipantsPerMission: 4,
      completionRate: 63,
      totalTimeMobilized: 56,
      timeFromCollectiveMissions: 32,
      timeFromSolidarityMissions: 24,
      organizationPotBalance: 65,
      organizationPotDonations: 28,
      organizationPotFunded: 20,
      dormantTimeDetected: 3,
      estimatedBeneficiaries: 35,
      uniqueReceivers: 12,
      receiversBecameContributors: 4,
      reciprocityRate: 22,
      averageRating: 4.2,
      ratingsCount: 10,
      blockedRequestsResolved: 1,
      averageResponseDelay: 0,
      noShowCount: 2,
      safetyReportsCount: 0,
      socialValueEstimated: 840,
      socialValueHourlyRate: 15,
    };

    const highlights2 = [
      "18 membres engagés",
      "8 missions organisées",
      "56 TIME mobilisés",
      "5 missions solidaires",
      "3 missions collectives",
      "22 % de réciprocité",
      "35 bénéficiaires estimés",
      "840 € de valeur sociale estimée",
    ];

    const risks2 = [
      "La réciprocité reste faible. Peu de membres donnent et reçoivent du TIME.",
      "La communauté est encore peu active (12 actifs sur 18).",
    ];

    const recommendations2 = [
      "Mobiliser les membres sous-utilisés via une campagne d'engagement.",
      "Lancer une Mission Mentor autour de l'aide numérique.",
      "Organiser un événement local pour renforcer la confiance.",
      "Partager ce rapport d'impact avec les partenaires et financeurs.",
    ];

    const summary2 =
      "Sur la période, le CCAS d'Écouen a mobilisé 18 membres autour de 8 missions, dont 5 missions solidaires et 3 missions collectives. Au total, 56 TIME ont été mobilisés, représentant une valeur sociale estimée à 840 €. Le taux de réciprocité observé est de 22 %, ce qui montre une dynamique de contribution progressive au sein de la communauté.";

    await prisma.impactReport.upsert({
      where: { id: `seed-${ccasEcouen.id}-1` },
      update: {},
      create: {
        id: `seed-${ccasEcouen.id}-1`,
        organizationId: ccasEcouen.id,
        title: "Rapport Inclusion numérique seniors",
        type: "FUNDER_REPORT",
        status: "GENERATED",
        periodStart: new Date("2027-01-01"),
        periodEnd: new Date("2027-06-30"),
        summary: summary2,
        metricsJson: JSON.stringify(metrics2),
        highlightsJson: JSON.stringify(highlights2),
        risksJson: JSON.stringify(risks2),
        recommendationsJson: JSON.stringify(recommendations2),
        socialValueHourlyRate: 15,
        socialValueEstimated: 840,
        visibility: "ORGANIZATION",
        generatedById,
        generatedAt: new Date("2027-07-10"),
      },
    });

    console.log(`  ✅ Rapport Inclusion numérique seniors (${ccasEcouen.name})`);
  }

  // ─── Report 3: Fondation Horizon Social — Programme solidaires ─

  if (fondation) {
    const metrics3 = {
      totalMembers: 42,
      activeMembers30d: 30,
      newMembers: 12,
      facilitatorsCount: 5,
      membersWithCompletedMission: 28,
      totalMissions: 22,
      activeMissions: 6,
      completedMissions: 16,
      collectiveMissions: 8,
      solidarityMissions: 10,
      urgentRequestsLinked: 5,
      averageParticipantsPerMission: 7,
      completionRate: 73,
      totalTimeMobilized: 210,
      timeFromCollectiveMissions: 120,
      timeFromSolidarityMissions: 90,
      organizationPotBalance: 350,
      organizationPotDonations: 120,
      organizationPotFunded: 80,
      dormantTimeDetected: 6,
      estimatedBeneficiaries: 120,
      uniqueReceivers: 35,
      receiversBecameContributors: 15,
      reciprocityRate: 36,
      averageRating: 4.7,
      ratingsCount: 30,
      blockedRequestsResolved: 3,
      averageResponseDelay: 0,
      noShowCount: 1,
      safetyReportsCount: 0,
      socialValueEstimated: 3150,
      socialValueHourlyRate: 15,
    };

    const highlights3 = [
      "42 membres engagés",
      "22 missions organisées",
      "210 TIME mobilisés",
      "10 missions solidaires",
      "8 missions collectives",
      "36 % de réciprocité",
      "120 bénéficiaires estimés",
      "3 150 € de valeur sociale estimée",
    ];

    const risks3 = [
      "Le pot d'impact est bien approvisionné mais peu utilisé pour financer des missions.",
    ];

    const recommendations3 = [
      "Utiliser une partie du pot d'impact pour financer des missions solidaires.",
      "Suivre les receveurs devenus contributeurs pour renforcer la réciprocité.",
      "Organiser un temps d'échange local pour renforcer les liens de la communauté.",
      "Partager ce rapport d'impact avec les partenaires et financeurs.",
    ];

    const summary3 =
      "Sur la période, la Fondation Horizon Social a mobilisé 42 membres autour de 22 missions, dont 10 missions solidaires et 8 missions collectives. Au total, 210 TIME ont été mobilisés, représentant une valeur sociale estimée à 3 150 €. Le taux de réciprocité observé est de 36 %, ce qui montre une dynamique de contribution progressive au sein de la communauté.";

    await prisma.impactReport.upsert({
      where: { id: `seed-${fondation.id}-1` },
      update: {},
      create: {
        id: `seed-${fondation.id}-1`,
        organizationId: fondation.id,
        title: "Rapport financement programmes solidaires",
        type: "RSE_REPORT",
        status: "GENERATED",
        periodStart: new Date("2027-01-01"),
        periodEnd: new Date("2027-09-30"),
        summary: summary3,
        metricsJson: JSON.stringify(metrics3),
        highlightsJson: JSON.stringify(highlights3),
        risksJson: JSON.stringify(risks3),
        recommendationsJson: JSON.stringify(recommendations3),
        socialValueHourlyRate: 15,
        socialValueEstimated: 3150,
        visibility: "PUBLIC",
        generatedById,
        generatedAt: new Date("2027-10-15"),
      },
    });

    console.log(`  ✅ Rapport financement programmes solidaires (${fondation.name})`);
  }

  console.log("\n✅ Seed impact reports completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
