import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existingServices = await prisma.service.findFirst();
  if (existingServices) {
    console.log("Des services existent déjà dans la base. Seed ignoré.");
    return;
  }

  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log("Aucun utilisateur trouvé. Seed ignoré — crée d'abord des comptes.");
    return;
  }

  const provider = users[0];

  const demo = [
    {
      title: "Aide Next.js pour débutant",
      description: "Je t'accompagne pas à pas pour créer ta première app Next.js. Installation, routing, composants serveur et client, bonnes pratiques. Idéal si tu débutes en React/Next.js.",
      category: "Tech",
      ratePerHour: 2,
    },
    {
      title: "Coaching CV pour profils tech",
      description: "Tu es développeur·se et tu galères avec ton CV ? Je t'aide à le rendre impactant pour les recruteurs tech : mise en page, mots-clés, projets mis en avant.",
      category: "Career",
      ratePerHour: 2,
    },
    {
      title: "Conversation anglaise",
      description: "Pratique l'anglais conversationnel avec un locuteur natif. Sujets variés : tech, voyage, culture. 30 minutes de discussion bienveillante pour gagner en aisance.",
      category: "Langues",
      ratePerHour: 1,
    },
    {
      title: "Réparation vélo",
      description: "Je t'apprends à réparer ton vélo toi-même : crevaison, freins, dérailleur. Apporte ton vélo et les pièces, je fournis les outils et l'expérience.",
      category: "Bricolage",
      ratePerHour: 2,
    },
    {
      title: "Initiation IA générative",
      description: "Découvre comment utiliser ChatGPT, Claude et les outils d'IA générative pour ton quotidien ou ton travail. Prompt engineering, cas d'usage, limites éthiques.",
      category: "Tech",
      ratePerHour: 3,
    },
    {
      title: "Aide administrative",
      description: "Je t'aide à remplir tes formulaires administratifs : CAF, impôts, sécurité sociale, titres de séjour. Pas de conseil juridique, juste un coup de main pratique.",
      category: "Administratif",
      ratePerHour: 1,
    },
  ];

  for (const svc of demo) {
    await prisma.service.create({
      data: {
        ...svc,
        providerId: provider.id,
        status: "active",
      },
    });
    console.log(`✓ Service créé : ${svc.title}`);
  }

  console.log(`\n${demo.length} services de démonstration créés pour ${provider.name}.`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
