import { prisma } from "@/lib/prisma";
import { FACILITATOR_THRESHOLDS as T } from "@/lib/facilitator-thresholds";

// ─── Types ──────────────────────────────────────────────────────────────────

export type MatchTargetType = "URGENT_REQUEST" | "SOLIDARITY_MISSION" | "COLLECTIVE_MISSION";

export type MatchTarget = {
  type: MatchTargetType;
  targetId: string;
  title: string;
  description: string;
  category: string | null;
  city: string | null;
  department: string | null;
  region: string | null;
  online: boolean;
  requesterId: string;
};

export type ScoreBreakdown = {
  skillScore: number;
  locationScore: number;
  availabilityScore: number;
  trustScore: number;
  reciprocityScore: number;
  communityHealthScore: number;
  totalScore: number;
};

export type Explanation = {
  reasons: string[];
  risks: string[];
};

export type CandidateScore = {
  userId: string;
  userName: string;
  breakdown: ScoreBreakdown;
  explanation: Explanation;
};

export type RecommendationStatus =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CONTACTED"
  | "ASSIGNED_MANUALLY"
  | "DISMISSED";

// ─── Score labels ───────────────────────────────────────────────────────────

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Très bon match";
  if (score >= 75) return "Bon match";
  if (score >= 60) return "Match possible";
  if (score >= 40) return "Match faible";
  return "Non recommandé";
}

// ─── Keyword helpers ────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "le", "la", "les", "du", "de", "des", "un", "une", "et", "ou", "à", "au",
  "aux", "en", "dans", "pour", "sur", "avec", "est", "sont", "ce", "cet",
  "cette", "ses", "son", "sa", "que", "qui", "par", "pas",
  "the", "a", "an", "of", "in", "to", "for", "with", "and", "or", "is", "are",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9éèêëàâäùûüôöîïç\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function keywordOverlap(a: string, b: string): number {
  const tokensA = new Set(tokenize(a));
  const tokensB = tokenize(b);
  if (tokensA.size === 0) return 0;
  const matches = tokensB.filter((w) => tokensA.has(w));
  return matches.length / tokensA.size;
}

// ─── Target resolver ────────────────────────────────────────────────────────

async function resolveTarget(
  targetType: MatchTargetType,
  targetId: string
): Promise<MatchTarget> {
  switch (targetType) {
    case "URGENT_REQUEST": {
      const req = await prisma.urgentRequest.findUnique({
        where: { id: targetId },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          city: true,
          department: true,
          region: true,
          online: true,
          requesterId: true,
        },
      });
      if (!req) throw new Error("Demande urgente introuvable");
      return { ...req, type: "URGENT_REQUEST", targetId: req.id };
    }
    case "SOLIDARITY_MISSION": {
      const svc = await prisma.service.findUnique({
        where: { id: targetId },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          providerId: true,
        },
      });
      if (!svc) throw new Error("Mission solidaire introuvable");
      return {
        type: "SOLIDARITY_MISSION",
        targetId: svc.id,
        title: svc.title,
        description: svc.description,
        category: svc.category,
        city: null,
        department: null,
        region: null,
        online: false,
        requesterId: svc.providerId,
      };
    }
    case "COLLECTIVE_MISSION": {
      const cm = await prisma.collectiveMission.findUnique({
        where: { id: targetId },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          city: true,
          department: true,
          region: true,
          online: true,
          organizerId: true,
        },
      });
      if (!cm) throw new Error("Mission collective introuvable");
      return {
        ...cm,
        type: "COLLECTIVE_MISSION",
        targetId: cm.id,
        requesterId: cm.organizerId,
      };
    }
  }
}

// ─── Exclusion rules ────────────────────────────────────────────────────────

async function getEligibleCandidates(
  target: MatchTarget
): Promise<{ userId: string; exclusion?: string }[]> {
  const allUsers = await prisma.user.findMany({
    where: {
      role: "USER",
      id: { not: target.requesterId },
    },
    select: {
      id: true,
      name: true,
      city: true,
      department: true,
      region: true,
      bio: true,
    },
  });

  // Get all user IDs that already participate in this target
  let existingParticipantIds = new Set<string>();
  if (target.type === "COLLECTIVE_MISSION") {
    const participants = await prisma.collectiveMissionParticipant.findMany({
      where: { missionId: target.targetId },
      select: { userId: true },
    });
    participants.forEach((p) => existingParticipantIds.add(p.userId));
  }

  // Get open critical alerts
  const criticalAlertUserIds = new Set<string>();
  const openAlerts = await prisma.facilitatorNetworkAlert.findMany({
    where: { status: "OPEN", severity: "CRITICAL" },
    select: { entityType: true, entityId: true },
  });
  openAlerts
    .filter((a): a is typeof a => a.entityType === "USER")
    .forEach((a) => criticalAlertUserIds.add(a.entityId!));

  // Get recent recommendations for this target (avoid duplicate proposals)
  const recentRecs = await prisma.matchRecommendation.findMany({
    where: { targetType: target.type, targetId: target.targetId },
    select: { candidateId: true },
  });
  const alreadyProposed = new Set(recentRecs.map((r) => r.candidateId));

  const results: { userId: string; exclusion?: string }[] = [];

  for (const user of allUsers) {
    // Exclure le requester
    if (user.id === target.requesterId) {
      results.push({ userId: user.id, exclusion: "Est le demandeur" });
      continue;
    }
    // Exclure les déjà participants (missions collectives)
    if (existingParticipantIds.has(user.id)) {
      results.push({ userId: user.id, exclusion: "Déjà participant" });
      continue;
    }
    // Exclure les signalements critiques
    if (criticalAlertUserIds.has(user.id)) {
      results.push({ userId: user.id, exclusion: "Signalement critique ouvert" });
      continue;
    }
    // Éviter les doublons récents
    if (alreadyProposed.has(user.id)) {
      results.push({ userId: user.id, exclusion: "Déjà proposé récemment" });
      continue;
    }
    results.push({ userId: user.id });
  }

  return results;
}

// ─── 6 scoring functions ────────────────────────────────────────────────────

/**
 * Skill Score — 30 % — adéquation besoin/compétence
 * Sources: category, keyword match (title/desc), active services, HeroPassport, mission history
 */
async function getSkillScore(
  candidateId: string,
  target: MatchTarget
): Promise<{ score: number; details: string[] }> {
  const details: string[] = [];

  // 1. Load candidate's services + passport
  const [services, passport] = await Promise.all([
    prisma.service.findMany({
      where: { providerId: candidateId, status: "active" },
      select: { title: true, description: true, category: true },
    }),
    prisma.heroPassport.findUnique({
      where: { userId: candidateId },
      select: { offeredSkills: true, bio: true },
    }),
  ]);

  let maxScore = 0;

  // A. Exact category match
  if (target.category) {
    const matchingCategory = services.filter((s) => s.category === target.category);
    if (matchingCategory.length > 0) {
      maxScore = Math.max(maxScore, 100);
      details.push("Compétence exacte : catégorie correspondante");
    }
  }

  // B. Keyword overlap on services (always try)
  let keywordScore = 0;
  for (const svc of services) {
    const overlap = keywordOverlap(target.description, svc.title + " " + svc.description);
    keywordScore = Math.max(keywordScore, overlap);
  }
  if (keywordScore > 0.1) {
    maxScore = Math.max(maxScore, Math.min(100, Math.round(keywordScore * 100)));
    details.push("Mots-clés du service correspondent à la demande");
  } else if (maxScore < 70 && services.length > 0) {
    // C. Similar category (only if not already scored via keyword)
    if (target.category) {
      const category = target.category;
      const catSimilarity = services.some(
        (s) => s.category.slice(0, 3) === category.slice(0, 3)
      );
      if (catSimilarity) {
        maxScore = Math.max(maxScore, 70);
        details.push("Catégorie proche mais pas exacte");
      } else {
        maxScore = Math.max(maxScore, 50);
        details.push("Catégorie similaire - correspondance partielle");
      }
    } else {
      maxScore = Math.max(maxScore, 50);
    }
  }

  // D. HeroPassport skills match
  if (passport?.offeredSkills) {
    const overlap = keywordOverlap(target.description, passport.offeredSkills);
    if (overlap > 0.15) {
      maxScore = Math.max(maxScore, Math.min(100, Math.round(overlap * 100)));
      details.push("Compétences déclarées dans le passeport Hero");
    }
  }

  // E. Mission history similarity
  const completedBookings = await prisma.booking.findMany({
    where: {
      clientId: candidateId,
      status: "completed",
    },
    select: {
      service: { select: { title: true, description: true, category: true } },
    },
    take: 10,
  });
  const historyOverlap = completedBookings.some(
    (b) =>
      b.service.category === target.category ||
      keywordOverlap(target.description, b.service.title + " " + b.service.description) > 0.2
  );
  if (historyOverlap) {
    maxScore = Math.max(maxScore, Math.max(maxScore, 70));
    details.push("Expérience déjà démontrée sur des missions similaires");
  }

  // F. No skills at all
  if (services.length === 0 && !passport?.offeredSkills && !historyOverlap) {
    maxScore = 0;
    details.push("Aucune compétence déclarée pertinente");
  }

  return { score: maxScore, details };
}

/**
 * Location Score — 20 % — proximité géographique
 */
async function getLocationScore(
  candidateId: string,
  target: MatchTarget
): Promise<{ score: number; details: string[] }> {
  const details: string[] = [];
  const candidate = await prisma.user.findUnique({
    where: { id: candidateId },
    select: {
      city: true,
      department: true,
      region: true,
      serviceRadiusKm: true,
      availableOnline: true,
    },
  });
  if (!candidate) return { score: 0, details: ["Profil non trouvé"] };

  // Online mission — don't penalize distance
  if (target.online && candidate.availableOnline) {
    details.push("Compatible mission en ligne");
    return { score: 100, details };
  }
  if (target.online && !candidate.availableOnline) {
    details.push("Mission en ligne mais Hero non disponible en ligne");
    return { score: 50, details };
  }

  // In-person mission — compare locations
  if (!candidate.city && !candidate.department && !candidate.region) {
    details.push("Localisation non renseignée");
    return { score: 30, details };
  }

  // Same city
  if (
    target.city &&
    candidate.city &&
    target.city.toLowerCase() === candidate.city.toLowerCase()
  ) {
    details.push("Même ville que la demande");
    return { score: 100, details };
  }

  // Same department
  if (
    target.department &&
    candidate.department &&
    target.department === candidate.department
  ) {
    details.push("Même département");
    return { score: 75, details };
  }

  // Same region
  if (
    target.region &&
    candidate.region &&
    target.region === candidate.region
  ) {
    details.push("Même région");
    return { score: 50, details };
  }

  // Candidate has online available but target is not online
  if (candidate.availableOnline) {
    details.push("Disponible en ligne mais mission présentielle");
    return { score: 40, details };
  }

  details.push("Hors zone d'intervention");
  return { score: 20, details };
}

/**
 * Availability Score — 15 % — disponibilité actuelle
 */
async function getAvailabilityScore(
  candidateId: string,
  target: MatchTarget
): Promise<{ score: number; details: string[] }> {
  const details: string[] = [];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Count bookings in progress + pending
  const [pendingCount, inProgressCount, urgentOfferCount, collectiveCount] = await Promise.all([
    prisma.booking.count({
      where: { clientId: candidateId, status: "pending" },
    }),
    prisma.booking.count({
      where: { clientId: candidateId, status: "in_progress" },
    }),
    prisma.urgentOffer.count({
      where: { providerId: candidateId, status: "pending" },
    }),
    prisma.collectiveMissionParticipant.count({
      where: {
        userId: candidateId,
        status: { in: ["JOINED", "WAITLISTED", "CHECKED_IN"] },
      },
    }),
  ]);

  const totalLoad = pendingCount + inProgressCount + urgentOfferCount + collectiveCount;

  // Check availability slots compatibility
  const slots = await prisma.availabilitySlot.findMany({
    where: { userId: candidateId, isActive: true },
  });

  if (totalLoad === 0) {
    details.push("Aucune mission en cours — très disponible");
    return { score: 100, details };
  }
  if (totalLoad === 1) {
    details.push("Faible charge actuelle");
    return { score: 80, details };
  }
  if (totalLoad <= 3) {
    details.push("Charge modérée");
    return { score: 60, details };
  }
  if (totalLoad <= 5) {
    details.push("Charge importante — plusieurs missions en cours");
    return { score: 30, details };
  }

  // Check overused status from Lot 20
  const overuseAlert = await prisma.facilitatorNetworkAlert.findFirst({
    where: {
      type: "OVERUSED_HERO",
      entityType: "USER",
      entityId: candidateId,
      status: "OPEN",
    },
  });

  if (overuseAlert) {
    details.push("Hero sur-sollicité — alerte active");
    return { score: 0, details };
  }

  details.push("Très chargé — plusieurs missions actives");
  return { score: 20, details };
}

/**
 * Trust Score — 15 % — fiabilité
 */
async function getTrustScore(
  candidateId: string,
  target: MatchTarget
): Promise<{ score: number; details: string[] }> {
  const details: string[] = [];

  const user = await prisma.user.findUnique({
    where: { id: candidateId },
    select: { reputation: true },
  });
  if (!user) return { score: 0, details: ["Profil non trouvé"] };

  const reputation = user.reputation;

  // Count completed missions
  const completedCount = await prisma.booking.count({
    where: { clientId: candidateId, status: "completed" },
  });

  // Count ratings received
  const ratingsReceived = await prisma.rating.count({
    where: { toId: candidateId },
  });

  // Check for flags/reports — simplified: look for critical alerts about this user
  const userAlert = await prisma.facilitatorNetworkAlert.findFirst({
    where: {
      entityType: "USER",
      entityId: candidateId,
      type: { in: ["FLAGGED_USER", "NO_SHOW", "CRITICAL_BEHAVIOR"] },
      status: "OPEN",
    },
  });

  // Check for problematic booking behavior (cancelled by facilitator, no-show)
  const cancellationCount = await prisma.booking.count({
    where: {
      clientId: candidateId,
      status: { in: ["cancelled", "no_show"] },
    },
  });

  if (userAlert) {
    details.push("Signalement ouvert sur ce profil");
    return { score: 10, details };
  }

  if (cancellationCount >= 3) {
    details.push("Comportement problématique : annulations fréquentes");
    return { score: 0, details };
  }

  // Reputation >= 4.7 + several missions
  if (reputation >= 4.7 && completedCount >= 5) {
    details.push(`Haute fiabilité : réputation ${reputation.toFixed(1)}/5, ${completedCount} missions`);
    return { score: 100, details };
  }
  // Reputation >= 4.0
  if (reputation >= 4.0) {
    details.push(`Bonne réputation : ${reputation.toFixed(1)}/5`);
    return { score: 80, details };
  }
  // New but complete profile
  if (completedCount === 0 && ratingsReceived === 0) {
    const profile = await prisma.heroPassport.findUnique({
      where: { userId: candidateId },
    });
    const hasBio = await prisma.user.findUnique({
      where: { id: candidateId },
      select: { bio: true },
    });
    if (profile?.offeredSkills && hasBio?.bio) {
      details.push("Nouveau mais profil complet");
      return { score: 70, details };
    }
    details.push("Nouveau membre, peu d'informations");
    return { score: 50, details };
  }
  // Some info
  if (reputation > 0 || completedCount > 0) {
    details.push(`Profil avec historique : réputation ${reputation.toFixed(1)}/5`);
    return { score: 60, details };
  }

  details.push("Peu d'informations disponibles");
  return { score: 40, details };
}

/**
 * Reciprocity Score — 10 % — équilibre donner/recevoir
 */
async function getReciprocityScore(
  candidateId: string,
  target: MatchTarget
): Promise<{ score: number; details: string[] }> {
  const details: string[] = [];

  const user = await prisma.user.findUnique({
    where: { id: candidateId },
    select: { timeBalance: true },
  });
  if (!user) return { score: 0, details: ["Profil non trouvé"] };

  // Sum TIME earned (received) and spent (given)
  const [received, given, potDonations] = await Promise.all([
    prisma.transaction.aggregate({
      where: { toId: candidateId, type: { in: ["release", "transfer"] }, status: "completed" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { fromId: candidateId, type: { in: ["escrow", "transfer"] }, status: "completed" },
      _sum: { amount: true },
    }),
    prisma.communityPotTransaction.count({
      where: { userId: candidateId, type: "DONATION" },
    }),
  ]);

  const receivedTotal = received._sum.amount ?? 0;
  const givenTotal = given._sum.amount ?? 0;

  // Check dormant time alerts
  const dormantAlert = await prisma.facilitatorNetworkAlert.findFirst({
    where: {
      type: "DORMANT_TIME",
      entityType: "USER",
      entityId: candidateId,
      status: "OPEN",
    },
  });

  if (givenTotal > 0 && receivedTotal > 0) {
    const ratio = givenTotal / (givenTotal + receivedTotal);
    if (ratio > 0.4 && ratio < 0.6) {
      details.push("Équilibre donner/recevoir : bonne réciprocité");
      return { score: 100, details };
    }
    if (givenTotal > receivedTotal * 1.5) {
      details.push("Donne plus qu'il/elle ne reçoit — bon pour la communauté");
      return { score: 70, details };
    }
    details.push("Échange actif");
    return { score: 80, details };
  }

  if (givenTotal > 0 && receivedTotal === 0) {
    details.push("A beaucoup donné mais peu reçu — mérite un retour");
    return { score: 70, details };
  }

  if (receivedTotal > 0 && givenTotal === 0) {
    details.push("A beaucoup reçu mais peu contribué");
    return { score: 30, details };
  }

  // New user — check if dormant time
  if (dormantAlert) {
    details.push("TIME dormant à remettre en circulation");
    return { score: 40, details };
  }

  // Pot commun donations bonus
  if (potDonations > 0) {
    details.push(`Donateur régulier au pot commun (${potDonations} dons)`);
    return { score: 80, details };
  }

  details.push("Nouveau membre — pas encore d'historique d'échange");
  return { score: 60, details };
}

/**
 * Community Health Score — 10 % — impact du match sur le réseau
 */
async function getCommunityHealthScore(
  candidateId: string,
  target: MatchTarget
): Promise<{ score: number; details: string[] }> {
  const details: string[] = [];

  const [overusedAlert, underusedAlert, dormantTimeAlert] = await Promise.all([
    prisma.facilitatorNetworkAlert.findFirst({
      where: { type: "OVERUSED_HERO", entityType: "USER", entityId: candidateId, status: "OPEN" },
    }),
    prisma.facilitatorNetworkAlert.findFirst({
      where: { type: "UNDERUSED_HERO", entityType: "USER", entityId: candidateId, status: "OPEN" },
    }),
    prisma.facilitatorNetworkAlert.findFirst({
      where: { type: "DORMANT_TIME", entityType: "USER", entityId: candidateId, status: "OPEN" },
    }),
  ]);

  // Hero sous-utilisé mais pertinent → bonus
  if (underusedAlert) {
    details.push("Hero sous-utilisé — bon pour l'activer sur cette mission");
    return { score: 100, details };
  }

  // Hero sur-sollicité → pénalité forte
  if (overusedAlert) {
    details.push("Hero sur-sollicité — risque de surcharge");
    return { score: 10, details };
  }

  // TIME dormant
  if (dormantTimeAlert) {
    details.push("TIME dormant — opportunité de remettre en circulation");
    return { score: 70, details };
  }

  // Check mission count in last 30 days for balance
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentMissions = await prisma.booking.count({
    where: {
      clientId: candidateId,
      completedAt: { gte: thirtyDaysAgo },
    },
  });

  if (recentMissions === 0) {
    details.push("Aucune mission ce mois-ci — disponible");
    return { score: 90, details };
  }
  if (recentMissions <= 2) {
    details.push("Activité modérée ce mois-ci");
    return { score: 80, details };
  }
  if (recentMissions <= 4) {
    details.push("Très actif ce mois-ci");
    return { score: 60, details };
  }

  details.push("Très fortement sollicité ce mois-ci");
  return { score: 30, details };
}

// ─── Orchestrateur ──────────────────────────────────────────────────────────

/**
 * Score final combiné avec pondération.
 * Formule : skill*0.30 + location*0.20 + availability*0.15 + trust*0.15 + reciprocity*0.10 + communityHealth*0.10
 */
function computeTotalScore(breakdown: ScoreBreakdown): number {
  return Math.round(
    breakdown.skillScore * 0.30 +
    breakdown.locationScore * 0.20 +
    breakdown.availabilityScore * 0.15 +
    breakdown.trustScore * 0.15 +
    breakdown.reciprocityScore * 0.10 +
    breakdown.communityHealthScore * 0.10
  );
}

/**
 * Construire l'explication "Pourquoi ce match ?" et les risques.
 */
function buildExplanation(
  candidateName: string,
  breakdown: ScoreBreakdown,
  scoreDetails: Record<string, string[]>
): Explanation {
  const reasons: string[] = [];
  const risks: string[] = [];

  // Reasons (from high scores)
  if (breakdown.skillScore >= 70) {
    const s = scoreDetails.skill?.join(", ") || "Compétence pertinente";
    reasons.push(`Compétence : ${s}`);
  }
  if (breakdown.locationScore >= 75) {
    const s = scoreDetails.location?.join(", ") || "Proche géographiquement";
    reasons.push(`Proximité : ${s}`);
  }
  if (breakdown.locationScore < 50) {
    risks.push("Distance élevée par rapport à la demande");
  }
  if (breakdown.availabilityScore >= 70) {
    reasons.push("Disponible : peu de missions en cours");
  }
  if (breakdown.availabilityScore >= 50 && breakdown.availabilityScore < 70) {
    reasons.push("Disponibilité correcte");
  }
  if (breakdown.availabilityScore < 40) {
    risks.push("Charge actuelle élevée — plusieurs missions déjà en cours");
  }
  if (breakdown.trustScore >= 80) {
    reasons.push("Fiable : bonne réputation");
  }
  if (breakdown.trustScore < 50 && breakdown.trustScore >= 30) {
    risks.push("Nouveau membre — peu d'avis encore");
  }
  if (breakdown.trustScore < 30) {
    risks.push("Fiabilité non établie — signaux de vigilance");
  }
  if (breakdown.reciprocityScore >= 70) {
    reasons.push("Bon pour la communauté : échange équilibré");
  }
  if (breakdown.reciprocityScore < 40) {
    risks.push("Déséquilibre donner/recevoir");
  }
  if (breakdown.communityHealthScore >= 80) {
    reasons.push("Profil encore peu mobilisé — bon candidat pour activer");
  }
  if (breakdown.communityHealthScore <= 30) {
    risks.push("Déjà très sollicité ce mois-ci — risque de surcharge");
  }

  return { reasons: reasons.slice(0, 5), risks: risks.slice(0, 3) };
}

/**
 * Générer les recommandations de match pour une cible donnée.
 * Fonction principale — orchestrateur complet.
 */
export async function generateMatchRecommendations(
  targetType: MatchTargetType,
  targetId: string,
  facilitatorId: string
): Promise<{
  recommendations: MatchRecommendation[];
  totalCandidates: number;
  excludedCount: number;
}> {
  // 1. Resolve target
  const target = await resolveTarget(targetType, targetId);

  // 2. Get eligible candidates
  const candidates = await getEligibleCandidates(target);
  const excludedCount = candidates.filter((c) => c.exclusion).length;
  const eligibleIds = candidates.filter((c) => !c.exclusion).map((c) => c.userId);

  if (eligibleIds.length === 0) {
    return { recommendations: [], totalCandidates: candidates.length, excludedCount };
  }

  // 3. Score each eligible candidate
  const scored: CandidateScore[] = [];

  for (const uid of eligibleIds) {
    const user = await prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, name: true },
    });
    if (!user) continue;

    const [skill, location, availability, trust, reciprocity, communityHealth] = await Promise.all([
      getSkillScore(uid, target),
      getLocationScore(uid, target),
      getAvailabilityScore(uid, target),
      getTrustScore(uid, target),
      getReciprocityScore(uid, target),
      getCommunityHealthScore(uid, target),
    ]);

    const breakdown: ScoreBreakdown = {
      skillScore: skill.score,
      locationScore: location.score,
      availabilityScore: availability.score,
      trustScore: trust.score,
      reciprocityScore: reciprocity.score,
      communityHealthScore: communityHealth.score,
      totalScore: 0,
    };
    breakdown.totalScore = computeTotalScore(breakdown);

    const scoreDetails: Record<string, string[]> = {
      skill: skill.details,
      location: location.details,
      availability: availability.details,
      trust: trust.details,
      reciprocity: reciprocity.details,
      communityHealth: communityHealth.details,
    };

    const explanation = buildExplanation(user.name!, breakdown, scoreDetails);

    scored.push({
      userId: user.id,
      userName: user.name!,
      breakdown,
      explanation,
    });
  }

  // 4. Sort by totalScore descending, keep top 5
  scored.sort((a, b) => b.breakdown.totalScore - a.breakdown.totalScore);
  const top5 = scored.slice(0, 5);

  // 5. Persist recommendations
  const recs = top5.map((s) => ({
    targetType,
    targetId,
    candidateId: s.userId,
    facilitatorId,
    score: s.breakdown.totalScore,
    skillScore: s.breakdown.skillScore,
    locationScore: s.breakdown.locationScore,
    availabilityScore: s.breakdown.availabilityScore,
    trustScore: s.breakdown.trustScore,
    reciprocityScore: s.breakdown.reciprocityScore,
    communityHealthScore: s.breakdown.communityHealthScore,
    reasonsJson: JSON.stringify(s.explanation.reasons),
    risksJson: JSON.stringify(s.explanation.risks),
    scoreBreakdownJson: JSON.stringify(s.breakdown),
    status: "PENDING_REVIEW" as const,
  }));

  // Batch insert
  await prisma.matchRecommendation.createMany({ data: recs });

  // Return the created recommendations
  const created = await prisma.matchRecommendation.findMany({
    where: { targetType, targetId, facilitatorId, status: "PENDING_REVIEW" },
    include: {
      candidate: { select: { id: true, name: true, city: true, reputation: true } },
    },
    orderBy: { score: "desc" },
    take: 5,
  });

  return {
    recommendations: created,
    totalCandidates: candidates.length,
    excludedCount,
  };
}

// ─── CRUD actions ───────────────────────────────────────────────────────────

export async function approveMatchRecommendation(
  recommendationId: string,
  facilitatorId: string,
  note?: string
): Promise<void> {
  await prisma.matchRecommendation.update({
    where: { id: recommendationId },
    data: {
      status: "APPROVED",
      decidedById: facilitatorId,
      decidedAt: new Date(),
      decisionNote: note || null,
    },
  });
}

export async function rejectMatchRecommendation(
  recommendationId: string,
  facilitatorId: string,
  note?: string
): Promise<void> {
  await prisma.matchRecommendation.update({
    where: { id: recommendationId },
    data: {
      status: "REJECTED",
      decidedById: facilitatorId,
      decidedAt: new Date(),
      decisionNote: note || null,
    },
  });
}

export async function addMatchFeedback(
  recommendationId: string,
  facilitatorId: string,
  decision: string,
  comment?: string
): Promise<void> {
  const feedbacks = ["GOOD_MATCH", "BAD_MATCH", "CONTACTED", "NOT_AVAILABLE", "WRONG_SKILL", "OVERUSED", "OTHER"];
  if (!feedbacks.includes(decision)) {
    throw new Error(`Decision invalide : ${decision}`);
  }
  await prisma.matchFeedback.create({
    data: {
      recommendationId,
      facilitatorId,
      decision,
      comment: comment || null,
    },
  });
}

export async function getRecommendationsForTarget(
  targetType: string,
  targetId: string
): Promise<any[]> {
  return prisma.matchRecommendation.findMany({
    where: { targetType, targetId },
    include: {
      candidate: { select: { id: true, name: true, city: true, reputation: true, avatar: true } },
      feedbacks: {
        include: { facilitator: { select: { id: true, name: true } } },
      },
    },
    orderBy: { score: "desc" },
  });
}

// ─── Type export ────────────────────────────────────────────────────────────

export type MatchRecommendation = Awaited<ReturnType<typeof getRecommendationsForTarget>>[number];
