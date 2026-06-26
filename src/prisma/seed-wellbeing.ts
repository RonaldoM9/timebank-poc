import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_ORGS = [
  { slug: "ville-demo-saint-martin-sur-seine", name: "Ville Démo — Saint-Martin-sur-Seine" },
  { slug: "ccas-ecouen", name: "CCAS Écouen" },
  { slug: "fondation-horizon-social", name: "Fondation Horizon Social" },
];

async function main() {
  console.log("🌱 Seeding wellbeing surveys...");

  for (const orgInfo of SEED_ORGS) {
    const org = await prisma.organization.findUnique({ where: { slug: orgInfo.slug } });
    if (!org) {
      console.log(`  ⏭️  Organisation non trouvée: ${orgInfo.slug}`);
      continue;
    }

    // Get a member of this org
    const member = await prisma.organizationMember.findFirst({
      where: { organizationId: org.id },
      include: { user: { select: { id: true } } },
    });
    if (!member) {
      console.log(`  ⏭️  Aucun membre pour: ${orgInfo.slug}`);
      continue;
    }

    const userId = member.user.id;

    // BEFORE surveys
    const beforeData = [
      { isolation: 2, support: 2, usefulness: 3, trust: 2, contribution: 4 },
      { isolation: 1, support: 3, usefulness: 2, trust: 3, contribution: 3 },
      { isolation: 3, support: 1, usefulness: 2, trust: 2, contribution: 4 },
      { isolation: 2, support: 2, usefulness: 3, trust: 3, contribution: 3 },
      { isolation: 1, support: 2, usefulness: 2, trust: 2, contribution: 2 },
    ];

    for (const data of beforeData) {
      const scores = [data.isolation, data.support, data.usefulness, data.trust, data.contribution];
      const total = scores.reduce((a, b) => a + b, 0);
      const avg = Math.round((total / 25) * 100);

      await prisma.wellbeingSurvey.create({
        data: {
          organizationId: org.id,
          userId,
          contextType: "ORGANIZATION",
          phase: "BEFORE",
          status: "COMPLETED",
          isolationScore: data.isolation,
          supportScore: data.support,
          usefulnessScore: data.usefulness,
          trustScore: data.trust,
          contributionScore: data.contribution,
          scoreTotal: total,
          scoreAverage: avg,
        },
      });
    }

    // AFTER surveys
    const afterData = [
      { isolation: 4, support: 4, usefulness: 4, trust: 4, contribution: 4 },
      { isolation: 3, support: 4, usefulness: 4, trust: 4, contribution: 4 },
      { isolation: 4, support: 3, usefulness: 3, trust: 4, contribution: 5 },
      { isolation: 4, support: 4, usefulness: 4, trust: 4, contribution: 4 },
      { isolation: 3, support: 3, usefulness: 4, trust: 3, contribution: 4 },
    ];

    for (const data of afterData) {
      const scores = [data.isolation, data.support, data.usefulness, data.trust, data.contribution];
      const total = scores.reduce((a, b) => a + b, 0);
      const avg = Math.round((total / 25) * 100);

      await prisma.wellbeingSurvey.create({
        data: {
          organizationId: org.id,
          userId,
          contextType: "ORGANIZATION",
          phase: "AFTER",
          status: "COMPLETED",
          isolationScore: data.isolation,
          supportScore: data.support,
          usefulnessScore: data.usefulness,
          trustScore: data.trust,
          contributionScore: data.contribution,
          comment: "Je me sens beaucoup moins isolé depuis que je participe aux activités.",
          scoreTotal: total,
          scoreAverage: avg,
        },
      });
    }

    console.log(`  ✅ ${orgInfo.name}: 10 surveys (5 BEFORE + 5 AFTER)`);
  }

  console.log("✅ Seed wellbeing terminé !");

  // Print summary
  const count = await prisma.wellbeingSurvey.count();
  console.log(`📊 Total wellbeing surveys: ${count}`);

  const beforeAvg = await prisma.wellbeingSurvey.aggregate({
    where: { phase: "BEFORE" },
    _avg: { scoreAverage: true },
  });
  const afterAvg = await prisma.wellbeingSurvey.aggregate({
    where: { phase: "AFTER" },
    _avg: { scoreAverage: true },
  });

  console.log(`📊 Score moyen BEFORE: ${Math.round(beforeAvg._avg.scoreAverage ?? 0)}/100`);
  console.log(`📊 Score moyen AFTER: ${Math.round(afterAvg._avg.scoreAverage ?? 0)}/100`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
