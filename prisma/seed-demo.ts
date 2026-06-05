import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Security: prevent running in production ─────────────────────────────────
const DEMO_SEED_ALLOWED = process.env.DEMO_SEED_ALLOWED === "true";
const NODE_ENV = process.env.NODE_ENV || "development";

if (NODE_ENV === "production" && !DEMO_SEED_ALLOWED) {
  console.error("❌ BLOCKED: seed-demo cannot run in production without DEMO_SEED_ALLOWED=true");
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const DEMO_EMAIL_DOMAIN = "@timeheroes.fr";
const DEMO_PASSWORD = "TimeHeroes2026!";

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ─── Hero profiles ───────────────────────────────────────────────────────────
interface HeroProfile {
  name: string;
  email: string;
  city: string;
  bio: string;
  specialty: string;
  timeBalance: number;
  xp: number;
  reputation: number;
  missionsCompleted: number;
  role?: string;
}

const HEROES: HeroProfile[] = [
  {
    name: "Alex Demo",
    email: "demo@timeheroes.fr",
    city: "Paris",
    bio: "Compte de démonstration TimeHeroes pour tester les missions, le wallet TIME et les badges.",
    specialty: "Aide numérique",
    timeBalance: 8,
    xp: 250,
    reputation: 4.8,
    missionsCompleted: 5,
    role: "ADMIN",
  },
  {
    name: "Sarah Martin",
    email: "sarah.demo@timeheroes.fr",
    city: "Écouen",
    bio: "Maman de deux enfants, passionnée par l'éducation. Je donne des cours de soutien scolaire aux enfants du quartier.",
    specialty: "Soutien scolaire",
    timeBalance: 12,
    xp: 320,
    reputation: 4.9,
    missionsCompleted: 8,
    role: "FACILITATOR",
  },
  {
    name: "Karim Benali",
    email: "karim.demo@timeheroes.fr",
    city: "Sarcelles",
    bio: "Bricoleur du dimanche devenu expert ! Jepeux monter vos meubles, fixer des cadres et réparer de petites choses.",
    specialty: "Bricolage simple",
    timeBalance: 6,
    xp: 180,
    reputation: 4.7,
    missionsCompleted: 4,
  },
  {
    name: "Julie Bernard",
    email: "julie.demo@timeheroes.fr",
    city: "Paris",
    bio: "Assistante administrative de métier, j'aide ceuxqui galèrent avec les papiers. Déclarations, formulaires, je connais toutes les astuces.",
    specialty: "Aide administrative",
    timeBalance: 15,
    xp: 400,
    reputation: 4.8,
    missionsCompleted: 10,
  },
  {
    name: "Thomas Leroy",
    email: "thomas.demo@timeheroes.fr",
    city: "Saint-Denis",
    bio: "Étudiant en sport, costaud et motivé ! Je donne un coup de main pour les déménagements légers et le port de courses.",
    specialty: "Déménagement léger",
    timeBalance: 4,
    xp: 120,
    reputation: 4.6,
    missionsCompleted: 3,
  },
  {
    name: "Nadia Moreau",
    email: "nadia.demo@timeheroes.fr",
    city: "Écouen",
    bio: "Ancienne aide-soignante, je propose mon temps pour accompagner les seniors dans leurs petites tâches quotidiennes.",
    specialty: "Aide aux seniors",
    timeBalance: 9,
    xp: 280,
    reputation: 5.0,
    missionsCompleted: 7,
  },
  {
    name: "Hugo Petit",
    email: "hugo.demo@timeheroes.fr",
    city: "Montmorency",
    bio: "Développeur web le jour, formateur numérique le soir. Je vous aide avec tous vos soucis informatiques.",
    specialty: "Informatique",
    timeBalance: 7,
    xp: 220,
    reputation: 4.7,
    missionsCompleted: 5,
  },
  {
    name: "Amélie Robert",
    email: "amelie.demo@timeheroes.fr",
    city: "Paris",
    bio: "Cheffe à domicile ! Je prépare des batch cooking savoureux et équilibrés pour les familles Pressées.",
    specialty: "Cuisine / batch cooking",
    timeBalance: 11,
    xp: 350,
    reputation: 4.9,
    missionsCompleted: 9,
  },
  {
    name: "Samir Haddad",
    email: "samir.demo@timeheroes.fr",
    city: "Garges-lès-Gonesse",
    bio: "J'ai un utilitaire et je me déplace pour vous aider à transporter vos achats ou petits meubles.",
    specialty: "Transport léger",
    timeBalance: 5,
    xp: 150,
    reputation: 4.5,
    missionsCompleted: 4,
  },
  {
    name: "Claire Dubois",
    email: "claire.demo@timeheroes.fr",
    city: "Domont",
    bio: "Professeure des écoles à la retraite, je donne des cours particuliers aux élèves du primaire et du collège.",
    specialty: "Aide aux devoirs",
    timeBalance: 14,
    xp: 380,
    reputation: 4.9,
    missionsCompleted: 10,
  },
  {
    name: "Romain Garcia",
    email: "romain.demo@timeheroes.fr",
    city: "Paris",
    bio: "RH de profession, je vous aide à rédiger un CV percutant et à préparer vos entretiens.",
    specialty: "Coaching CV",
    timeBalance: 3,
    xp: 90,
    reputation: 4.6,
    missionsCompleted: 2,
  },
  {
    name: "Inès Laurent",
    email: "ines.demo@timeheroes.fr",
    city: "Écouen",
    bio: "Organisée et méthodique, j'aide les personnes âgées ou débordées à faire leurs démarches administratives.",
    specialty: "Organisation / démarches",
    timeBalance: 10,
    xp: 300,
    reputation: 4.8,
    missionsCompleted: 7,
  },
  {
    name: "David Nguyen",
    email: "david.demo@timeheroes.fr",
    city: "Saint-Brice",
    bio: "Passionné de cyclisme, je répare les vélos de tout le quartier. Je peux aussi vous apprendre à le faire vous-même.",
    specialty: "Réparation vélo",
    timeBalance: 8,
    xp: 200,
    reputation: 4.7,
    missionsCompleted: 5,
  },
  {
    name: "Lina Morel",
    email: "lina.demo@timeheroes.fr",
    city: "Paris",
    bio: "Bilingue anglais-français, je propose des conversations en anglais pour tous niveaux. Pratiquez sans pression !",
    specialty: "Anglais conversation",
    timeBalance: 6,
    xp: 160,
    reputation: 4.8,
    missionsCompleted: 4,
  },
  {
    name: "Marc Simon",
    email: "marc.demo@timeheroes.fr",
    city: "Montreuil",
    bio: "Jardinier urbain passionné, je vous aide à créer un potager sur votre balcon ou à entretenir vos plantes.",
    specialty: "Jardinage urbain",
    timeBalance: 7,
    xp: 190,
    reputation: 4.6,
    missionsCompleted: 5,
  },
];

// ─── Services / Missions ────────────────────────────────────────────────────
interface ServiceData {
  title: string;
  description: string;
  category: string;
  ratePerHour: number;
  providerEmail: string;
  status: string;
}

const SERVICES: ServiceData[] = [
  // ── Alex Demo (demo@timeheroes.fr) — 3 services ──
  { title: "Configurer WhatsApp sur Android", description: "Je vous aide à installer et configurer WhatsApp sur votre téléphone Android : compte, contacts, paramètres de confidentialité.", category: "Aide numérique", ratePerHour: 1, providerEmail: "demo@timeheroes.fr", status: "active" },
  { title: "Trier et organiser ses photos", description: "Je vous aide à trier vos photos numériques, les classer par dossiers et faire des sauvegardes.", category: "Aide numérique", ratePerHour: 1, providerEmail: "demo@timeheroes.fr", status: "active" },
  { title: "Installer une imprimante WiFi", description: "Installation et configuration de votre imprimante sans fil. Je vérifie que tout fonctionne avant de partir.", category: "Aide numérique", ratePerHour: 1.5, providerEmail: "demo@timeheroes.fr", status: "active" },

  // ── Sarah Martin (sarah.demo) — 3 services ──
  { title: "Aide lecture CP — 30 min", description: "Je vous accompagne pour aider votre enfant à lire. Méthode douce et progressive, parfaite pour les débutants.", category: "Soutien scolaire", ratePerHour: 0.5, providerEmail: "sarah.demo@timeheroes.fr", status: "active" },
  { title: "Maths collège — niveau 6e/5e", description: "Soutien en mathématiques pour les élèves de 6e et 5e. Nombres, géométrie, problèmes.", category: "Soutien scolaire", ratePerHour: 1, providerEmail: "sarah.demo@timeheroes.fr", status: "active" },
  { title: "Aide aux devoirs niveau primaire", description: "Aide complète pour les devoirs du CP au CM2, toutes matières confondues.", category: "Soutien scolaire", ratePerHour: 0.5, providerEmail: "sarah.demo@timeheroes.fr", status: "active" },

  // ── Karim Benali (karim.demo) — 3 services ──
  { title: "Monter une étagère murale", description: "Je monte votre étagère IKEA ou autre, avec niveau et cheilles adaptées à votre mur.", category: "Bricolage simple", ratePerHour: 1.5, providerEmail: "karim.demo@timeheroes.fr", status: "active" },
  { title: "Fixer un cadre ou un miroir", description: "Je fixe vos cadres, tableaux et miroirs solidement au mur. Je fournis les cheilles.", category: "Bricolage simple", ratePerHour: 1, providerEmail: "karim.demo@timeheroes.fr", status: "active" },
  { title: "Réparer une poignée de porte", description: "Je répare ou remplace les poignées de portes, verrous et serrures simples.", category: "Bricolage simple", ratePerHour: 1, providerEmail: "karim.demo@timeheroes.fr", status: "active" },

  // ── Julie Bernard (julie.demo) — 3 services ──
  { title: "Remplir un formulaire administratif", description: "Je vous aide à remplir vos formulaires CAF, impôts, sécurité sociale. Pas de conseil juridique.", category: "Aide administrative", ratePerHour: 1, providerEmail: "julie.demo@timeheroes.fr", status: "active" },
  { title: "Scanner et envoyer des documents", description: "Je scanne vos documents et les envoie par email aux bons services.", category: "Aide administrative", ratePerHour: 0.5, providerEmail: "julie.demo@timeheroes.fr", status: "active" },
  { title: "Aide déclaration impôts en ligne", description: "Je vous accompagne pas à pas pour déclarer vos impôts en ligne.", category: "Aide administrative", ratePerHour: 1.5, providerEmail: "julie.demo@timeheroes.fr", status: "active" },

  // ── Thomas Leroy (thomas.demo) — 2 services ──
  { title: "Aider à porter 5 cartons", description: "Je vous aide à descendre ou monter vos cartons. Idéal pour un petit déménagement.", category: "Déménagement léger", ratePerHour: 1, providerEmail: "thomas.demo@timeheroes.fr", status: "active" },
  { title: "Déplacer un meuble lourd", description: "Je vous aide à déplacer canapé, lit ou buffet. À deux c'est plus facile et plus sûr.", category: "Déménagement léger", ratePerHour: 1, providerEmail: "thomas.demo@timeheroes.fr", status: "active" },

  // ── Nadia Moreau (nadia.demo) — 3 services ──
  { title: "Accompagner pour Doctolib", description: "Je vous aide à utiliser Doctolib pour prendre rendez-vous chez le médecin ou le spécialiste.", category: "Seniors", ratePerHour: 1, providerEmail: "nadia.demo@timeheroes.fr", status: "active" },
  { title: "Promenade accompagnée", description: "Je propose une promenade accompagnée d'une heure pour les personnes âgées qui ne sortent pas seules.", category: "Seniors", ratePerHour: 1, providerEmail: "nadia.demo@timeheroes.fr", status: "active" },
  { title: "Courses simples de proximité", description: "Je fais vos courses alimentaires et vous les livre à domicile. Liste par texto ou téléphone.", category: "Seniors", ratePerHour: 1, providerEmail: "nadia.demo@timeheroes.fr", status: "active" },

  // ── Hugo Petit (hugo.demo) — 2 services ──
  { title: "Nettoyage et optimisation PC", description: "Je nettoie votre PC, désinstalle les logiciels inutiles et optimise les performances.", category: "Informatique", ratePerHour: 2, providerEmail: "hugo.demo@timeheroes.fr", status: "active" },
  { title: "Initiation à l'informatique", description: "Premiers pas sur ordinateur : email, navigation internet, rangement des fichiers.", category: "Informatique", ratePerHour: 1, providerEmail: "hugo.demo@timeheroes.fr", status: "active" },

  // ── Amélie Robert (amelie.demo) — 2 services ──
  { title: "Batch cooking pour la semaine", description: "Je prépare 3 repas complets pour votre famille. Apportez les ingrédients, je cuisine et je range.", category: "Cuisine", ratePerHour: 2, providerEmail: "amelie.demo@timeheroes.fr", status: "active" },
  { title: "Atelier cuisine parent-enfant", description: "Un moment de partage autour de la cuisine. Nous préparons un plat simple ensemble.", category: "Cuisine", ratePerHour: 1.5, providerEmail: "amelie.demo@timeheroes.fr", status: "active" },

  // ── Samir Haddad (samir.demo) — 2 services ──
  { title: "Transport de colis ou courses", description: "Je transporte vos colis ou courses avec mon utilitaire. Rayon 20 km autour de Garges.", category: "Transport", ratePerHour: 1.5, providerEmail: "samir.demo@timeheroes.fr", status: "active" },
  { title: "Aide transport meubles IKEA", description: "Je vous accompagne chez IKEA et vous aide à transporter vos achats.", category: "Transport", ratePerHour: 1.5, providerEmail: "samir.demo@timeheroes.fr", status: "active" },

  // ── Claire Dubois (claire.demo) — 3 services ──
  { title: "Aide aux devoirs CE2/CM1", description: "Soutien scolaire pour les enfants en CE2 et CM1 : français, maths, découverte du monde.", category: "Soutien scolaire", ratePerHour: 0.5, providerEmail: "claire.demo@timeheroes.fr", status: "active" },
  { title: "Méthodologie et organisation", description: "J'apprends à votre enfant à s'organiser, tenir un cahier de textes et réviser efficacement.", category: "Soutien scolaire", ratePerHour: 1, providerEmail: "claire.demo@timeheroes.fr", status: "active" },
  { title: "Lecture à voix haute", description: "Séance de lecture à voix haute pour améliorer la diction et la compréhension.", category: "Soutien scolaire", ratePerHour: 0.5, providerEmail: "claire.demo@timeheroes.fr", status: "active" },

  // ── Romain Garcia (romain.demo) — 2 services ──
  { title: "Coaching CV personnalisé", description: "Je vous aide à structurer votre CV pour qu'il attire l'attention des recruteurs.", category: "Career", ratePerHour: 2, providerEmail: "romain.demo@timeheroes.fr", status: "active" },
  { title: "Préparation entretien d'embauche", description: "Simulation d'entretien avec conseils personnalisés sur votre présentation et vos réponses.", category: "Career", ratePerHour: 2, providerEmail: "romain.demo@timeheroes.fr", status: "active" },

  // ── Inès Laurent (ines.demo) — 2 services ──
  { title: "Aide démarches retraite", description: "Je vous guide dans vos démarches de retraite : relevé de carrière, simulation, constitution du dossier.", category: "Aide administrative", ratePerHour: 1.5, providerEmail: "ines.demo@timeheroes.fr", status: "active" },
  { title: "Organisation de dossiers médicaux", description: "Je classe et organise vos dossiers médicaux, ordonnances et résultats d'analyses.", category: "Aide administrative", ratePerHour: 1, providerEmail: "ines.demo@timeheroes.fr", status: "active" },

  // ── David Nguyen (david.demo) — 2 services ──
  { title: "Réparation crevaison vélo", description: "Je répare votre crevaison et vous montre comment faire la prochaine fois.", category: "Vélo", ratePerHour: 1, providerEmail: "david.demo@timeheroes.fr", status: "active" },
  { title: "Réglage freins et dérailleur vélo", description: "Je règle vos freins et votre dérailleur pour un vélo qui roule parfaitement.", category: "Vélo", ratePerHour: 1, providerEmail: "david.demo@timeheroes.fr", status: "active" },

  // ── Lina Morel (lina.demo) — 2 services ──
  { title: "Conversation anglaise débutant", description: "30 minutes de conversation en anglais pour débutants. Sujets simples et bienveillance.", category: "Langues", ratePerHour: 1, providerEmail: "lina.demo@timeheroes.fr", status: "active" },
  { title: "Anglais professionnel — préparation réunion", description: "Préparez votre prochaine réunion en anglais : vocabulaire, prononciation, expressions clés.", category: "Langues", ratePerHour: 2, providerEmail: "lina.demo@timeheroes.fr", status: "active" },

  // ── Marc Simon (marc.demo) — 2 services ──
  { title: "Créer un potager sur balcon", description: "Je vous aide à installer des bacs, choisir les plantes et démarrer votre potager urbain.", category: "Jardinage", ratePerHour: 1.5, providerEmail: "marc.demo@timeheroes.fr", status: "active" },
  { title: "Entretien plantes d'intérieur", description: "Conseils et soins pour vos plantes d'intérieur : rempotage, arrosage, traiter les maladies.", category: "Jardinage", ratePerHour: 1, providerEmail: "marc.demo@timeheroes.fr", status: "active" },
];

// ─── Bookings scenarios ─────────────────────────────────────────────────────
interface BookingScenario {
  serviceTitle: string;
  clientEmail: string;
  providerEmail: string;
  hours: number;
  status: string;
  completedAt?: Date;
  rating?: { score: number; comment: string };
}

const COMPLETED_BOOKINGS: BookingScenario[] = [
  { serviceTitle: "Aide lecture CP — 30 min", clientEmail: "demo@timeheroes.fr", providerEmail: "sarah.demo@timeheroes.fr", hours: 1, status: "completed", completedAt: daysAgo(14), rating: { score: 5, comment: "Très pédagogue, m'a bien aidé à comprendre." } },
  { serviceTitle: "Configurer WhatsApp sur Android", clientEmail: "nadia.demo@timeheroes.fr", providerEmail: "demo@timeheroes.fr", hours: 1, status: "completed", completedAt: daysAgo(12), rating: { score: 5, comment: "Patient et efficace, tout fonctionne parfaitement." } },
  { serviceTitle: "Scanner et envoyer des documents", clientEmail: "ines.demo@timeheroes.fr", providerEmail: "julie.demo@timeheroes.fr", hours: 1, status: "completed", completedAt: daysAgo(10), rating: { score: 5, comment: "Mission réalisée rapidement et avec le sourire." } },
  { serviceTitle: "Monter une étagère murale", clientEmail: "claire.demo@timeheroes.fr", providerEmail: "karim.demo@timeheroes.fr", hours: 1, status: "completed", completedAt: daysAgo(8), rating: { score: 4, comment: "Ponctuel et efficace. L'étagère est bien solide." } },
  { serviceTitle: "Aide déclaration impôts en ligne", clientEmail: "nadia.demo@timeheroes.fr", providerEmail: "julie.demo@timeheroes.fr", hours: 2, status: "completed", completedAt: daysAgo(7), rating: { score: 5, comment: "Super échange, je recommande. Très claire dans ses explications." } },
  { serviceTitle: "Conversation anglaise débutant", clientEmail: "thomas.demo@timeheroes.fr", providerEmail: "lina.demo@timeheroes.fr", hours: 1, status: "completed", completedAt: daysAgo(6), rating: { score: 4, comment: "Très patiente, j'ai appris beaucoup en une séance." } },
  { serviceTitle: "Accompagner pour Doctolib", clientEmail: "hugo.demo@timeheroes.fr", providerEmail: "nadia.demo@timeheroes.fr", hours: 1, status: "completed", completedAt: daysAgo(5), rating: { score: 5, comment: "Très patient avec mon père pour configurer son téléphone." } },
  { serviceTitle: "Batch cooking pour la semaine", clientEmail: "alice.seed@timeheroes.fr", providerEmail: "amelie.demo@timeheroes.fr", hours: 3, status: "completed", completedAt: daysAgo(4), rating: { score: 5, comment: "Des plats délicieux et variés. Toute la famille a adoré !" } },
  { serviceTitle: "Réparation crevaison vélo", clientEmail: "samir.demo@timeheroes.fr", providerEmail: "david.demo@timeheroes.fr", hours: 1, status: "completed", completedAt: daysAgo(3), rating: { score: 5, comment: "Réparation rapide et en plus il m'a montré comment faire." } },
  { serviceTitle: "Aide aux devoirs CE2/CM1", clientEmail: "karim.demo@timeheroes.fr", providerEmail: "claire.demo@timeheroes.fr", hours: 1, status: "completed", completedAt: daysAgo(2), rating: { score: 4, comment: "Bonne aide pour les devoirs, explications claires." } },
  { serviceTitle: "Trier et organiser ses photos", clientEmail: "alice.seed@timeheroes.fr", providerEmail: "demo@timeheroes.fr", hours: 2, status: "completed", completedAt: daysAgo(1), rating: { score: 5, comment: "Photos bien classées, j'ai retrouvé des souvenirs perdus !" } },
  { serviceTitle: "Aider à porter 5 cartons", clientEmail: "romain.demo@timeheroes.fr", providerEmail: "thomas.demo@timeheroes.fr", hours: 1, status: "completed", completedAt: daysAgo(1), rating: { score: 4, comment: "Costaud et sympa, merci pour le coup de main." } },
  { serviceTitle: "Coaching CV personnalisé", clientEmail: "thomas.demo@timeheroes.fr", providerEmail: "romain.demo@timeheroes.fr", hours: 2, status: "completed", completedAt: daysAgo(1), rating: { score: 5, comment: "CV complètement transformé, des conseils très utiles." } },
];

const IN_PROGRESS_BOOKINGS: BookingScenario[] = [
  { serviceTitle: "Créer un potager sur balcon", clientEmail: "alice.seed@timeheroes.fr", providerEmail: "marc.demo@timeheroes.fr", hours: 2, status: "accepted" },
  { serviceTitle: "Aide démarches retraite", clientEmail: "nadia.demo@timeheroes.fr", providerEmail: "ines.demo@timeheroes.fr", hours: 2, status: "accepted" },
  { serviceTitle: "Réglage freins et dérailleur vélo", clientEmail: "lina.demo@timeheroes.fr", providerEmail: "david.demo@timeheroes.fr", hours: 1, status: "accepted" },
  { serviceTitle: "Initiation à l'informatique", clientEmail: "alice.seed@timeheroes.fr", providerEmail: "hugo.demo@timeheroes.fr", hours: 1, status: "accepted" },
  { serviceTitle: "Maths collège — niveau 6e/5e", clientEmail: "demo@timeheroes.fr", providerEmail: "sarah.demo@timeheroes.fr", hours: 1, status: "accepted" },
];

const PENDING_BOOKINGS: BookingScenario[] = [
  { serviceTitle: "Anglais professionnel — préparation réunion", clientEmail: "samir.demo@timeheroes.fr", providerEmail: "lina.demo@timeheroes.fr", hours: 2, status: "pending" },
  { serviceTitle: "Nettoyage et optimisation PC", clientEmail: "claire.demo@timeheroes.fr", providerEmail: "hugo.demo@timeheroes.fr", hours: 1, status: "pending" },
  { serviceTitle: "Préparation entretien d'embauche", clientEmail: "lina.demo@timeheroes.fr", providerEmail: "romain.demo@timeheroes.fr", hours: 2, status: "pending" },
];

const CANCELLED_BOOKINGS: BookingScenario[] = [
  { serviceTitle: "Transport de colis ou courses", clientEmail: "claire.demo@timeheroes.fr", providerEmail: "samir.demo@timeheroes.fr", hours: 1, status: "cancelled" },
];

// ─── Reviews for additional ratings ─────────────────────────────────────────
const EXTRA_RATINGS: { providerEmail: string; fromEmail: string; score: number; comment: string }[] = [
  { providerEmail: "sarah.demo@timeheroes.fr", fromEmail: "demo@timeheroes.fr", score: 5, comment: "Très professionnelle, ma fille a progressé en lecture." },
  { providerEmail: "karim.demo@timeheroes.fr", fromEmail: "claire.demo@timeheroes.fr", score: 4, comment: "Bricoleur soigneux, travail propre." },
  { providerEmail: "julie.demo@timeheroes.fr", fromEmail: "nadia.demo@timeheroes.fr", score: 5, comment: "Démarches administratives réglées en un rien de temps." },
  { providerEmail: "nadia.demo@timeheroes.fr", fromEmail: "demo@timeheroes.fr", score: 5, comment: "Douce et attentionnée, une perle pour les seniors." },
  { providerEmail: "amelie.demo@timeheroes.fr", fromEmail: "alice.seed@timeheroes.fr", score: 4, comment: "Plats savoureux, dommage que ce soit un peu court." },
  { providerEmail: "claire.demo@timeheroes.fr", fromEmail: "karim.demo@timeheroes.fr", score: 4, comment: "Explications très claires, mon fils a compris ses leçons." },
  { providerEmail: "ines.demo@timeheroes.fr", fromEmail: "nadia.demo@timeheroes.fr", score: 5, comment: "Organisation impeccable, merci pour l'aide précieuse." },
];

// ─── Urgent requests ────────────────────────────────────────────────────────
interface UrgentRequestData {
  title: string;
  description: string;
  category: string;
  city: string;
  urgency: string;
  hours: number;
  ratePerHour: number;
  status: string;
  requesterEmail: string;
  createdAt: Date;
  expiresAt?: Date;
}

const URGENT_REQUESTS: UrgentRequestData[] = [
  { title: "Besoin d'aide pour porter un meuble aujourd'hui", description: "Je dois déplacer un canapé au 3e étage sans ascenceur. Urgent, disponible tout l'après-midi.", category: "Déménagement léger", city: "Écouen", urgency: "today", hours: 2, ratePerHour: 1, status: "open", requesterEmail: "alice.seed@timeheroes.fr", createdAt: daysAgo(0) },
  { title: "Aide urgente pour imprimer un document administratif", description: "J'ai un document à imprimer et déposer en mairie avant 17h. Ma panne d'encre m'a bloqué.", category: "Aide administrative", city: "Paris", urgency: "today", hours: 1, ratePerHour: 1, status: "open", requesterEmail: "thomas.demo@timeheroes.fr", createdAt: daysAgo(0) },
  { title: "Besoin d'aide pour configurer un téléphone avant un rendez-vous", description: "J'ai un rendez-vous médical demain et mon nouveau téléphone n'est pas configuré pour les appels.", category: "Aide numérique", city: "Sarcelles", urgency: "today", hours: 1, ratePerHour: 1, status: "open", requesterEmail: "karim.demo@timeheroes.fr", createdAt: daysAgo(0) },
  { title: "Recherche quelqu'un pour aider à déplacer des cartons ce soir", description: "Déménagement de dernière minute, 10 cartons à descendre au rez-de-chaussée.", category: "Déménagement léger", city: "Saint-Denis", urgency: "today", hours: 1, ratePerHour: 1.5, status: "resolved", requesterEmail: "hugo.demo@timeheroes.fr", createdAt: daysAgo(2) },
  { title: "Accompagnement courses pour personne âgée", description: "Mme Dupont a besoin de quelqu'un pour l'accompagner faire ses courses cet après-midi.", category: "Seniors", city: "Montmorency", urgency: "today", hours: 2, ratePerHour: 1, status: "resolved", requesterEmail: "nadia.demo@timeheroes.fr", createdAt: daysAgo(5) },
  { title: "Aide pour déclarer un sinistre en ligne", description: "Besoin d'aide rapidement pour déclarer un dégât des eaux sur mon assurance.", category: "Aide administrative", city: "Domont", urgency: "tomorrow", hours: 1, ratePerHour: 1, status: "expired", requesterEmail: "claire.demo@timeheroes.fr", createdAt: daysAgo(10), expiresAt: daysAgo(8) },
];

// ─── Transaction types ──────────────────────────────────────────────────────
const TX_TYPES = ["mint", "escrow_hold", "escrow_release", "escrow_refund", "transfer", "bonus"] as const;

// ─── Badge assignments ──────────────────────────────────────────────────────
interface BadgeAssignment {
  userEmail: string;
  badgeCodes: string[];
}

const BADGE_ASSIGNMENTS: BadgeAssignment[] = [
  { userEmail: "demo@timeheroes.fr", badgeCodes: ["first-mission", "time-giver", "helping-hand"] },
  { userEmail: "sarah.demo@timeheroes.fr", badgeCodes: ["first-mission", "helping-hand", "learning-buddy", "trusted-hero"] },
  { userEmail: "karim.demo@timeheroes.fr", badgeCodes: ["first-mission", "diy-helper"] },
  { userEmail: "julie.demo@timeheroes.fr", badgeCodes: ["first-mission", "helping-hand", "admin-ally", "trusted-hero"] },
  { userEmail: "thomas.demo@timeheroes.fr", badgeCodes: ["first-mission", "strong-arms"] },
  { userEmail: "nadia.demo@timeheroes.fr", badgeCodes: ["first-mission", "helping-hand", "senior-ally", "trusted-hero"] },
  { userEmail: "hugo.demo@timeheroes.fr", badgeCodes: ["first-mission", "tech-helper"] },
  { userEmail: "amelie.demo@timeheroes.fr", badgeCodes: ["first-mission", "helping-hand", "kitchen-hero"] },
  { userEmail: "samir.demo@timeheroes.fr", badgeCodes: ["first-mission", "strong-arms"] },
  { userEmail: "claire.demo@timeheroes.fr", badgeCodes: ["first-mission", "helping-hand", "learning-buddy", "trusted-hero"] },
  { userEmail: "romain.demo@timeheroes.fr", badgeCodes: ["first-mission"] },
  { userEmail: "ines.demo@timeheroes.fr", badgeCodes: ["first-mission", "helping-hand", "admin-ally"] },
  { userEmail: "david.demo@timeheroes.fr", badgeCodes: ["first-mission", "diy-helper"] },
  { userEmail: "lina.demo@timeheroes.fr", badgeCodes: ["first-mission", "learning-buddy"] },
  { userEmail: "marc.demo@timeheroes.fr", badgeCodes: ["first-mission", "helping-hand"] },
];

// ─── XP events ──────────────────────────────────────────────────────────────
interface XpEventInput {
  userEmail: string;
  type: string;
  points: number;
  sourceType: string;
  sourceId?: string;
  description: string;
  createdAt: Date;
}

// ─── Main seed function ─────────────────────────────────────────────────────
async function main() {
  console.log("🌱 TimeHeroes Demo Seed — Démarrage...\n");

  // Step 1: Delete all existing demo data
  console.log("🧹 Nettoyage des anciennes données démo...");

  // Find all demo users (emails ending with @timeheroes.fr)
  const existingDemoUsers = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_EMAIL_DOMAIN } },
    select: { id: true, email: true },
  });
  const demoUserIds = existingDemoUsers.map((u) => u.id);
  const demoUserEmails = existingDemoUsers.map((u) => u.email);

  if (demoUserIds.length > 0) {
    // Delete in FK order
    await prisma.userQuest.deleteMany({ where: { userId: { in: demoUserIds } } });
    await prisma.userBadge.deleteMany({ where: { userId: { in: demoUserIds } } });
    await prisma.achievementEvent.deleteMany({ where: { userId: { in: demoUserIds } } });
    await prisma.userXpEvent.deleteMany({ where: { userId: { in: demoUserIds } } });

    // Ratings where demo user is from or to
    await prisma.rating.deleteMany({
      where: { OR: [{ fromId: { in: demoUserIds } }, { toId: { in: demoUserIds } }] },
    });

    // Transactions involving demo users
    await prisma.transaction.deleteMany({
      where: { OR: [{ fromId: { in: demoUserIds } }, { toId: { in: demoUserIds } }] },
    });

    // ProofOfCompletion involving demo users
    await prisma.proofOfCompletion.deleteMany({
      where: { OR: [{ validatorId: { in: demoUserIds } }, { providerId: { in: demoUserIds } }] },
    });

    // Urgent offers
    await prisma.urgentOffer.deleteMany({
      where: { OR: [{ providerId: { in: demoUserIds } }, { urgentRequest: { requesterId: { in: demoUserIds } } }] },
    });

    // Urgent requests
    await prisma.urgentRequest.deleteMany({ where: { requesterId: { in: demoUserIds } } });

    // Availability
    await prisma.availabilitySlot.deleteMany({ where: { userId: { in: demoUserIds } } });

    // Bookings (client or service provider)
    const demoServiceIds = (await prisma.service.findMany({ where: { providerId: { in: demoUserIds } }, select: { id: true } })).map((s) => s.id);
    // Delete messages referencing these bookings first
    await prisma.bookingMessage.deleteMany({
      where: { booking: { OR: [{ clientId: { in: demoUserIds } }, { serviceId: { in: demoServiceIds } }] } },
    });
    await prisma.booking.deleteMany({
      where: { OR: [{ clientId: { in: demoUserIds } }, { serviceId: { in: demoServiceIds } }] },
    });

    // Services
    await prisma.service.deleteMany({ where: { providerId: { in: demoUserIds } } });

    // Users
    await prisma.user.deleteMany({ where: { id: { in: demoUserIds } } });

    console.log(`  ✓ ${demoUserIds.length} utilisateurs démo supprimés`);
  } else {
    console.log("  • Aucune donnée démo existante à nettoyer");
  }

  // Also create "Alice Seed" helper user for some scenarios
  const existingSeedHelper = await prisma.user.findUnique({ where: { email: "alice.seed@timeheroes.fr" } });
  if (existingSeedHelper) {
    // Clean data for this user too
    await prisma.userQuest.deleteMany({ where: { userId: existingSeedHelper.id } });
    await prisma.userBadge.deleteMany({ where: { userId: existingSeedHelper.id } });
    await prisma.achievementEvent.deleteMany({ where: { userId: existingSeedHelper.id } });
    await prisma.userXpEvent.deleteMany({ where: { userId: existingSeedHelper.id } });
    await prisma.rating.deleteMany({ where: { OR: [{ fromId: existingSeedHelper.id }, { toId: existingSeedHelper.id }] } });
    await prisma.transaction.deleteMany({ where: { OR: [{ fromId: existingSeedHelper.id }, { toId: existingSeedHelper.id }] } });
    await prisma.proofOfCompletion.deleteMany({ where: { OR: [{ validatorId: existingSeedHelper.id }, { providerId: existingSeedHelper.id }] } });
    await prisma.urgentOffer.deleteMany({ where: { providerId: existingSeedHelper.id } });
    await prisma.urgentRequest.deleteMany({ where: { requesterId: existingSeedHelper.id } });
    await prisma.availabilitySlot.deleteMany({ where: { userId: existingSeedHelper.id } });
    const helperServiceIds = (await prisma.service.findMany({ where: { providerId: existingSeedHelper.id }, select: { id: true } })).map((s) => s.id);
    await prisma.booking.deleteMany({ where: { OR: [{ clientId: existingSeedHelper.id }, { serviceId: { in: helperServiceIds } }] } });
    await prisma.service.deleteMany({ where: { providerId: existingSeedHelper.id } });
    await prisma.user.delete({ where: { id: existingSeedHelper.id } });
    console.log("  ✓ Ancien helper seed supprimé");
  }

  console.log("");

  // Step 2: Ensure badges exist
  console.log("🏅 Vérification des badges...");
  const existingBadgeCount = await prisma.badge.count();
  if (existingBadgeCount === 0) {
    console.log("  ⚠️ Aucun badge trouvé — lance d'abord seed-gamification.ts");
    console.log("  → Exécute: npx tsx prisma/seed-gamification.ts");
  } else {
    console.log(`  ✓ ${existingBadgeCount} badges disponibles`);
  }

  const existingQuestCount = await prisma.quest.count();
  if (existingQuestCount > 0) {
    console.log(`  ✓ ${existingQuestCount} quêtes disponibles`);
  }
  console.log("");

  // Step 3: Create demo users
  console.log("👤 Création des Heroes...");
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const createdUsers = new Map<string, string>(); // email -> id

  for (const hero of HEROES) {
    const walletAddress = `0x${Buffer.from(hero.email).toString("hex").slice(0, 40)}`;
    const user = await prisma.user.create({
      data: {
        name: hero.name,
        email: hero.email,
        password: passwordHash,
        walletAddress,
        timeBalance: hero.timeBalance,
        bio: hero.bio,
        city: hero.city,
        reputation: hero.reputation,
        ...(hero.role ? { role: hero.role } : {}),
      },
    });
    createdUsers.set(hero.email, user.id);
    console.log(`  ✓ ${hero.name} (${hero.email}) — ${hero.city}`);
  }

  // Create Alice Seed (helper user for bookings)
  const aliceUser = await prisma.user.create({
    data: {
      name: "Alice Dupont",
      email: "alice.seed@timeheroes.fr",
      password: passwordHash,
      walletAddress: "0xalice.seed@timeheroes.fr.demo.wallet",
      timeBalance: 15,
      bio: "Maman active, j'utilise TimeHeroes pour donner un coup de main et en recevoir.",
      city: "Écouen",
      reputation: 4.5,
    },
  });
  createdUsers.set("alice.seed@timeheroes.fr", aliceUser.id);
  console.log(`  ✓ Alice Dupont (alice.seed@timeheroes.fr) — helper user`);
  console.log("");

  // Step 4: Create services
  console.log("📋 Création des services / missions...");

  // Reserve some services for specific statuses
  const serviceMap = new Map<string, string>(); // title -> id

  for (const svc of SERVICES) {
    const providerId = createdUsers.get(svc.providerEmail);
    if (!providerId) {
      console.log(`  ⚠️ Provider not found for ${svc.title} (${svc.providerEmail}), skipping`);
      continue;
    }
    const service = await prisma.service.create({
      data: {
        title: svc.title,
        description: svc.description,
        category: svc.category,
        ratePerHour: svc.ratePerHour,
        providerId,
        status: svc.status,
      },
    });
    serviceMap.set(svc.title, service.id);
  }
  console.log(`  ✓ ${SERVICES.length} services créés`);
  console.log("");

  // Step 5: Create bookings
  console.log("📅 Création des bookings...");

  async function createBooking(scenario: BookingScenario): Promise<string> {
    const serviceId = serviceMap.get(scenario.serviceTitle);
    if (!serviceId) {
      console.log(`  ⚠️ Service not found: ${scenario.serviceTitle}`);
      return "";
    }
    const clientId = createdUsers.get(scenario.clientEmail);
    if (!clientId) {
      console.log(`  ⚠️ Client not found: ${scenario.clientEmail}`);
      return "";
    }

    // Look up service rate to compute correct totalTime
    const svc = SERVICES.find(s => s.title === scenario.serviceTitle);
    const rate = svc?.ratePerHour ?? 1;
    const totalTime = Math.round(scenario.hours * rate);
    const booking = await prisma.booking.create({
      data: {
        serviceId,
        clientId,
        hours: scenario.hours,
        totalTime,
        status: scenario.status,
        completedAt: scenario.completedAt ?? null,
      },
    });
    return booking.id;
  }

  let bookingCount = 0;
  for (const b of COMPLETED_BOOKINGS) {
    const id = await createBooking(b);
    if (id) bookingCount++;
  }
  for (const b of IN_PROGRESS_BOOKINGS) {
    const id = await createBooking(b);
    if (id) bookingCount++;
  }
  for (const b of PENDING_BOOKINGS) {
    const id = await createBooking(b);
    if (id) bookingCount++;
  }
  for (const b of CANCELLED_BOOKINGS) {
    const id = await createBooking(b);
    if (id) bookingCount++;
  }
  console.log(`  ✓ ${bookingCount} bookings créés`);
  console.log("");

  // Step 6: Create transactions
  console.log("💰 Création des transactions TIME...");

  // We need to map bookings to transactions
  // For completed bookings: escrow_hold -> escrow_release
  // For in-progress: escrow_hold
  // For cancelled: escrow_hold -> escrow_refund

  let txCount = 0;

  // Mint transactions for all heroes (initial balance)
  for (const hero of HEROES) {
    const userId = createdUsers.get(hero.email)!;
    await prisma.transaction.create({
      data: {
        toId: userId,
        amount: hero.timeBalance,
        type: "mint",
        status: "completed",
        createdAt: daysAgo(30),
      },
    });
    txCount++;
  }

  // Mint for Alice
  await prisma.transaction.create({
    data: {
      toId: aliceUser.id,
      amount: 15,
      type: "mint",
      status: "completed",
      createdAt: daysAgo(30),
    },
  });
  txCount++;

  // Bonus transactions for some users
  const bonusUsers = ["demo@timeheroes.fr", "sarah.demo@timeheroes.fr", "julie.demo@timeheroes.fr", "nadia.demo@timeheroes.fr", "amelie.demo@timeheroes.fr"];
  for (const email of bonusUsers) {
    const userId = createdUsers.get(email)!;
    await prisma.transaction.create({
      data: {
        toId: userId,
        amount: 2,
        type: "bonus",
        status: "completed",
        createdAt: daysAgo(28),
      },
    });
    txCount++;
  }

  // Transactions for completed bookings
  for (const b of COMPLETED_BOOKINGS) {
    const serviceId = serviceMap.get(b.serviceTitle);
    if (!serviceId) continue;
    const booking = await prisma.booking.findFirst({
      where: { serviceId, clientId: createdUsers.get(b.clientEmail)!, status: "completed" },
    });
    if (!booking) continue;

    // Escrow hold (client -> escrow) — use booking.totalTime (hours * ratePerHour)
    const txAmount = booking.totalTime;
    await prisma.transaction.create({
      data: {
        fromId: createdUsers.get(b.clientEmail),
        amount: txAmount,
        type: "escrow_hold",
        status: "completed",
        bookingId: booking.id,
        createdAt: b.completedAt ? new Date(b.completedAt.getTime() - 86400000) : daysAgo(7),
      },
    });
    txCount++;

    // Escrow release (escrow -> provider)
    await prisma.transaction.create({
      data: {
        toId: createdUsers.get(b.providerEmail),
        amount: txAmount,
        type: "escrow_release",
        status: "completed",
        bookingId: booking.id,
        createdAt: b.completedAt ?? daysAgo(5),
      },
    });
    txCount++;
  }

  // Escrow holds for in-progress bookings
  for (const b of IN_PROGRESS_BOOKINGS) {
    const serviceId = serviceMap.get(b.serviceTitle);
    if (!serviceId) continue;
    const booking = await prisma.booking.findFirst({
      where: { serviceId, clientId: createdUsers.get(b.clientEmail)!, status: "accepted" },
    });
    if (!booking) continue;

    await prisma.transaction.create({
      data: {
        fromId: createdUsers.get(b.clientEmail),
        amount: b.hours,
        type: "escrow_hold",
        status: "completed",
        bookingId: booking.id,
        createdAt: daysAgo(1),
      },
    });
    txCount++;
  }

  // Escrow refund for cancelled booking
  for (const b of CANCELLED_BOOKINGS) {
    const serviceId = serviceMap.get(b.serviceTitle);
    if (!serviceId) continue;
    const booking = await prisma.booking.findFirst({
      where: { serviceId, clientId: createdUsers.get(b.clientEmail)!, status: "cancelled" },
    });
    if (!booking) continue;

    await prisma.transaction.create({
      data: {
        fromId: createdUsers.get(b.clientEmail),
        amount: b.hours,
        type: "escrow_hold",
        status: "completed",
        bookingId: booking.id,
        createdAt: daysAgo(3),
      },
    });
    txCount++;

    await prisma.transaction.create({
      data: {
        toId: createdUsers.get(b.clientEmail),
        amount: b.hours,
        type: "escrow_refund",
        status: "completed",
        bookingId: booking.id,
        createdAt: daysAgo(3),
      },
    });
    txCount++;
  }

  // Transfer transactions between heroes
  const transfers: { from: string; to: string; amount: number }[] = [
    { from: "demo@timeheroes.fr", to: "sarah.demo@timeheroes.fr", amount: 2 },
    { from: "julie.demo@timeheroes.fr", to: "nadia.demo@timeheroes.fr", amount: 3 },
    { from: "hugo.demo@timeheroes.fr", to: "karim.demo@timeheroes.fr", amount: 1 },
    { from: "amelie.demo@timeheroes.fr", to: "claire.demo@timeheroes.fr", amount: 2 },
    { from: "ines.demo@timeheroes.fr", to: "david.demo@timeheroes.fr", amount: 1.5 },
    { from: "demo@timeheroes.fr", to: "thomas.demo@timeheroes.fr", amount: 1 },
    { from: "lina.demo@timeheroes.fr", to: "marc.demo@timeheroes.fr", amount: 0.5 },
    { from: "sarah.demo@timeheroes.fr", to: "romain.demo@timeheroes.fr", amount: 1 },
    { from: "claire.demo@timeheroes.fr", to: "samir.demo@timeheroes.fr", amount: 2 },
  ];

  for (const t of transfers) {
    const fromId = createdUsers.get(t.from);
    const toId = createdUsers.get(t.to);
    if (!fromId || !toId) continue;

    await prisma.transaction.create({
      data: {
        fromId,
        toId,
        amount: t.amount,
        type: "transfer",
        status: "completed",
        createdAt: daysAgo(Math.floor(Math.random() * 20) + 1),
      },
    });
    txCount++;
  }

  console.log(`  ✓ ${txCount} transactions créées`);
  console.log("");

  // Step 7: Create ratings
  console.log("⭐ Création des avis...");

  let ratingCount = 0;

  // Ratings from completed bookings
  for (const b of COMPLETED_BOOKINGS) {
    if (!b.rating) continue;
    const serviceId = serviceMap.get(b.serviceTitle);
    if (!serviceId) continue;
    const booking = await prisma.booking.findFirst({
      where: { serviceId, clientId: createdUsers.get(b.clientEmail)!, status: "completed" },
    });
    if (!booking) continue;

    const fromId = createdUsers.get(b.clientEmail);
    const toId = createdUsers.get(b.providerEmail);
    if (!fromId || !toId) continue;

    // Check if rating already exists
    const existing = await prisma.rating.findUnique({ where: { bookingId: booking.id } });
    if (!existing) {
      await prisma.rating.create({
        data: {
          bookingId: booking.id,
          fromId,
          toId,
          score: b.rating.score,
          comment: b.rating.comment,
          createdAt: b.completedAt ?? daysAgo(5),
        },
      });
      ratingCount++;
    }
  }

  // Extra ratings — create a dedicated completed booking for each
  for (const r of EXTRA_RATINGS) {
    const toId = createdUsers.get(r.providerEmail);
    const fromId = createdUsers.get(r.fromEmail);
    if (!toId || !fromId) continue;

    // Find a service from this provider to create a booking for
    const service = await prisma.service.findFirst({
      where: { providerId: toId, status: "active" },
    });
    if (!service) {
      console.log(`  ⚠️ Pas de service trouvé pour l'avis de ${r.fromEmail} -> ${r.providerEmail}`);
      continue;
    }

    const booking = await prisma.booking.create({
      data: {
        serviceId: service.id,
        clientId: fromId,
        hours: 1,
        totalTime: Math.round(1 * (service.ratePerHour || 1)),
        status: "completed",
        completedAt: daysAgo(Math.floor(Math.random() * 10) + 1),
      },
    });

    await prisma.rating.create({
      data: {
        bookingId: booking.id,
        fromId,
        toId,
        score: r.score,
        comment: r.comment,
        createdAt: daysAgo(Math.floor(Math.random() * 10) + 1),
      },
    });
    ratingCount++;
  }

  console.log(`  ✓ ${ratingCount} avis créés`);
  console.log("");

  // Step 8: Create XP events & achievements
  console.log("⚡ Création des événements XP...");

  const xpEvents: XpEventInput[] = [];

  for (const hero of HEROES) {
    const userId = createdUsers.get(hero.email)!;
    // Welcome XP
    xpEvents.push({
      userEmail: hero.email,
      type: "welcome",
      points: 20,
      sourceType: "welcome",
      description: "Bienvenue sur TimeHeroes",
      createdAt: daysAgo(30),
    });
    // Mission completion XP
    if (hero.missionsCompleted >= 1) {
      xpEvents.push({
        userEmail: hero.email,
        type: "mission_completed",
        points: hero.missionsCompleted * 50,
        sourceType: "mission",
        description: `${hero.missionsCompleted} missions terminées`,
        createdAt: daysAgo(15),
      });
    }
  }

  for (const evt of xpEvents) {
    const userId = createdUsers.get(evt.userEmail);
    if (!userId) continue;
    await prisma.userXpEvent.create({
      data: {
        userId,
        type: evt.type,
        points: evt.points,
        sourceType: evt.sourceType,
        description: evt.description,
        createdAt: evt.createdAt,
      },
    });
  }

  // Achievement events for demo user
  const demoUserId = createdUsers.get("demo@timeheroes.fr")!;
  const achievements = [
    { type: "first_mission", title: "Première mission accomplie !", description: "Tu as terminé ta première mission sur TimeHeroes." },
    { type: "level_up", title: "Niveau atteint : Active Hero", description: "Tu as atteint le niveau Active Hero avec 250 XP !" },
    { type: "badge_earned", title: "Badge débloqué : First Mission", description: "Tu as reçu le badge First Mission." },
    { type: "badge_earned", title: "Badge débloqué : Time Giver", description: "Tu as reçu le badge Time Giver." },
    { type: "badge_earned", title: "Badge débloqué : Helping Hand", description: "Tu as reçu le badge Helping Hand." },
  ];

  for (const ach of achievements) {
    await prisma.achievementEvent.create({
      data: {
        userId: demoUserId,
        type: ach.type,
        title: ach.title,
        description: ach.description,
        metadata: JSON.stringify({ seed: true }),
        createdAt: daysAgo(Math.floor(Math.random() * 20) + 1),
      },
    });
  }

  console.log(`  ✓ ${xpEvents.length} XP events + ${achievements.length} achievements créés`);
  console.log("");

  // Step 9: Assign badges
  console.log("🏅 Attribution des badges...");

  let badgeCount = 0;
  for (const assign of BADGE_ASSIGNMENTS) {
    const userId = createdUsers.get(assign.userEmail);
    if (!userId) continue;

    for (const badgeCode of assign.badgeCodes) {
      const badge = await prisma.badge.findUnique({ where: { code: badgeCode } });
      if (!badge) {
        console.log(`  ⚠️ Badge '${badgeCode}' introuvable`);
        continue;
      }

      const existing = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
      });
      if (!existing) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
            earnedAt: daysAgo(Math.floor(Math.random() * 20) + 1),
          },
        });
        badgeCount++;
      }
    }
  }

  console.log(`  ✓ ${badgeCount} badges attribués`);
  console.log("");

  // Step 10: Create quest progress for demo user
  console.log("🎯 Création des quêtes...");

  const quests = await prisma.quest.findMany();
  const demoQuests = [
    { code: "welcome-hero", progress: 1, completed: true },
    { code: "first-mission-quest", progress: 1, completed: true },
    { code: "give-time-quest", progress: 1, completed: true },
    { code: "become-reliable", progress: 3, completed: true },
    { code: "explore-skills", progress: 1, completed: false },
  ];

  let questCount = 0;
  for (const q of demoQuests) {
    const quest = quests.find((x: { code: string }) => x.code === q.code);
    if (!quest) continue;

    const existing = await prisma.userQuest.findUnique({
      where: { userId_questId: { userId: demoUserId, questId: quest.id } },
    });
    if (!existing) {
      await prisma.userQuest.create({
        data: {
          userId: demoUserId,
          questId: quest.id,
          progress: q.progress,
          completed: q.completed,
          completedAt: q.completed ? daysAgo(5) : null,
        },
      });
      questCount++;
    }
  }

  console.log(`  ✓ ${questCount} quêtes créées pour le compte démo`);
  console.log("");

  // Step 11: Create urgent requests
  console.log("🚨 Création des demandes urgentes...");

  let urgentCount = 0;
  for (const req of URGENT_REQUESTS) {
    const requesterId = createdUsers.get(req.requesterEmail);
    if (!requesterId) continue;

    await prisma.urgentRequest.create({
      data: {
        requesterId,
        title: req.title,
        description: req.description,
        category: req.category,
        city: req.city,
        urgency: req.urgency,
        hours: req.hours,
        ratePerHour: req.ratePerHour,
        totalTime: Math.round(req.hours * req.ratePerHour),
        status: req.status,
        createdAt: req.createdAt,
        expiresAt: req.expiresAt ?? null,
      },
    });
    urgentCount++;
  }
  console.log(`  ✓ ${urgentCount} demandes urgentes créées`);
  console.log("");

  // ─── Step 12: Seed HeroPassport for demo users ───────────────────────
  console.log("🛂 Création des Hero Passports...");

  type PassportSeed = {
    email: string;
    bio: string;
    offeredSkills: string;
    wantedHelp: string;
    motivations: string;
  };

  const PASSPORTS: PassportSeed[] = [
    {
      email: "demo@timeheroes.fr",
      bio: "Passionné par le numérique et l'entraide, j'aide mes voisins à se sentir chez eux avec leurs appareils. Je crois qu'on est tous plus forts quand on partage.",
      offeredSkills: "Aide numérique (smartphone, PC, imprimante)\nBricolage léger\nOrganisation de documents",
      wantedHelp: "J'aimerais apprendre le jardinage\nAide pour des petits travaux chez moi\nConseils en cuisine",
      motivations: "Créer du lien dans mon quartier\nTransmettre ce que je sais\nApprendre de nouvelles choses",
    },
    {
      email: "sarah.demo@timeheroes.fr",
      bio: "Maman de deux enfants, professeure dans l'âme. J'adore voir les progrès des élèves et leur donner confiance en eux.",
      offeredSkills: "Soutien scolaire (primaire et collège)\nAide aux devoirs\nMéthodologie et organisation",
      wantedHelp: "Aide pour le jardinage\nBabysitting ponctuel\nCours de cuisine",
      motivations: "Transmettre mes compétences\nAider les familles\nCréer du lien social",
    },
    {
      email: "karim.demo@timeheroes.fr",
      bio: "Bricoleur autodidacte, je répare tout ce qui peut l'être. Un coup de main n'a jamais fait de mal à personne.",
      offeredSkills: "Bricolage (étagères, cadres, réparations simples)\nPetite menuiserie\nMontage de meubles",
      wantedHelp: "Aide pour l'informatique\nCours d'anglais",
      motivations: "Aider les autres\nPartager mon expérience\nRencontrer des voisins",
    },
  ];

  let passportCount = 0;
  for (const p of PASSPORTS) {
    const userId = createdUsers.get(p.email);
    if (!userId) {
      console.log(`  ⚠️ User not found for: ${p.email}`);
      continue;
    }

    // Check if passport already exists
    const existing = await prisma.heroPassport.findUnique({ where: { userId } });
    if (existing) continue;

    await prisma.heroPassport.create({
      data: {
        userId,
        bio: p.bio,
        offeredSkills: p.offeredSkills,
        wantedHelp: p.wantedHelp,
        motivations: p.motivations,
      },
    });
    passportCount++;
  }
  console.log(`  ✓ ${passportCount} Hero Passports créés`);
  console.log("");

  // ─── Step 13: Create demo messages for unread tracking ─────────────────
  console.log("💬 Création des messages de démonstration...");

  let msgCount = 0;

  type MessageData = {
    serviceTitle: string;
    authorEmail: string;
    content: string;
    type: string;
    createdAt: Date;
    readAt?: Date;
  };

  const DEMO_MESSAGES: MessageData[] = [
    // Maths collège — in progress, demo is client, Sarah is provider
    // Sarah sent 2 messages that demo hasn't read yet
    {
      serviceTitle: "Maths collège — niveau 6e/5e",
      authorEmail: "sarah.demo@timeheroes.fr",
      content: "Bonjour ! Je suis dispo demain après-midi pour la séance de maths. On se retrouve à 14h ?",
      type: "USER",
      createdAt: daysAgo(1),
    },
    {
      serviceTitle: "Maths collège — niveau 6e/5e",
      authorEmail: "sarah.demo@timeheroes.fr",
      content: "N'oublie pas le cahier d'exercices, on travaillera les fractions 😊",
      type: "USER",
      createdAt: daysAgo(1),
    },
    // Configurer WhatsApp — completed, demo is provider, all messages read
    {
      serviceTitle: "Configurer WhatsApp sur Android",
      authorEmail: "nadia.demo@timeheroes.fr",
      content: "Merci beaucoup pour votre aide, tout fonctionne parfaitement ! 📱",
      type: "USER",
      createdAt: daysAgo(12),
      readAt: daysAgo(11),
    },
    {
      serviceTitle: "Configurer WhatsApp sur Android",
      authorEmail: "demo@timeheroes.fr",
      content: "Avec plaisir ! N'hésitez pas si vous avez d'autres questions.",
      type: "USER",
      createdAt: daysAgo(12),
      readAt: daysAgo(11),
    },
    // Pending booking — Anglaiss professionnel (demo not involved directly)
    // Instead, add messages for a booking where demo is actually involved as client provider
  ];

  for (const m of DEMO_MESSAGES) {
    const serviceId = serviceMap.get(m.serviceTitle);
    if (!serviceId) {
      console.log(`  ⚠️ Service not found for message: ${m.serviceTitle}`);
      continue;
    }
    const authorId = createdUsers.get(m.authorEmail);
    if (!authorId) {
      console.log(`  ⚠️ Author not found: ${m.authorEmail}`);
      continue;
    }
    // Find the booking for this service + client
    // For "Maths collège — niveau 6e/5e": client is demo@
    // For "Configurer WhatsApp": client is nadia.demo@
    let clientEmail = "";
    if (m.serviceTitle === "Maths collège — niveau 6e/5e") {
      clientEmail = "demo@timeheroes.fr";
    } else if (m.serviceTitle === "Configurer WhatsApp sur Android") {
      clientEmail = "nadia.demo@timeheroes.fr";
    }
    const clientId = createdUsers.get(clientEmail);
    if (!clientId) continue;

    const booking = await prisma.booking.findFirst({
      where: { serviceId, clientId },
      orderBy: { createdAt: "desc" },
    });
    if (!booking) {
      console.log(`  ⚠️ Booking not found for: ${m.serviceTitle}`);
      continue;
    }

    await prisma.bookingMessage.create({
      data: {
        bookingId: booking.id,
        authorId: m.authorEmail !== "SYSTEM" ? authorId : null,
        content: m.content,
        type: m.type,
        readAt: m.readAt ?? null,
        createdAt: m.createdAt,
      },
    });
    msgCount++;

    // Update lastMessageAt on the booking
    await prisma.booking.update({
      where: { id: booking.id },
      data: { lastMessageAt: m.createdAt },
    });
  }

  console.log(`  ✓ ${msgCount} messages de démonstration créés`);
  console.log("");

  // ─── Summary ──────────────────────────────────────────────────────────────
  const finalBadgeCount = await prisma.userBadge.count();
  const finalTxCount = await prisma.transaction.count();
  const finalRatingCount = await prisma.rating.count();
  const finalServiceCount = await prisma.service.count();
  const finalBookingCount = await prisma.booking.count();
  const finalUserCount = await prisma.user.count();
  const finalXpCount = await prisma.userXpEvent.count();

  console.log("═══════════════════════════════════════════════════");
  console.log("✅ Seed démo terminé avec succès !");
  console.log("═══════════════════════════════════════════════════");
  console.log("");
  console.log(`  👤 Utilisateurs :     ${finalUserCount}`);
  console.log(`  📋 Services :         ${finalServiceCount}`);
  console.log(`  📅 Bookings :         ${finalBookingCount}`);
  console.log(`  💰 Transactions :     ${finalTxCount}`);
  console.log(`  ⭐ Avis :             ${finalRatingCount}`);
  console.log(`  🏅 Badges attribués : ${finalBadgeCount}`);
  console.log(`  ⚡ Événements XP :    ${finalXpCount}`);
  console.log("");
  console.log("🔑 Compte démo :");
  console.log(`   Email :    demo@timeheroes.fr`);
  console.log(`   Password : ${DEMO_PASSWORD}`);
  console.log("");
  console.log("⚠️  Le seed est rejouable : toutes les données @timeheroes.fr sont supprimées avant recréation.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
