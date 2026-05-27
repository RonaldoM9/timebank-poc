import { prisma } from "./prisma";

export interface CreateRatingParams {
  bookingId: string;
  fromId: string;
  score: number;
  comment?: string;
}

export async function createRating(params: CreateRatingParams): Promise<void> {
  const { bookingId, fromId, score, comment } = params;

  // Récupérer le booking avec service + provider
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { providerId: true } },
    },
  });

  // Vérifier que le booking existe
  if (!booking) {
    throw new Error("Booking introuvable.");
  }

  // Vérifier que le booking est completed
  if (booking.status !== "completed") {
    throw new Error("Le booking doit être terminé pour être noté.");
  }

  // Vérifier que l'utilisateur est bien le client
  if (booking.clientId !== fromId) {
    throw new Error("Seul le client du booking peut laisser un avis.");
  }

  // Vérifier qu'il n'existe pas déjà un rating
  const existing = await prisma.rating.findUnique({
    where: { bookingId },
  });
  if (existing) {
    throw new Error("Un avis a déjà été publié pour ce booking.");
  }

  // Valider le score côté serveur
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    throw new Error("Le score doit être un entier entre 1 et 5.");
  }

  // Déterminer le provider
  const toId = booking.service.providerId;

  // Vérifier que le client ne note pas lui-même
  if (fromId === toId) {
    throw new Error("Vous ne pouvez pas vous noter vous-même.");
  }

  // Créer le rating (dans une transaction pour atomicité)
  await prisma.$transaction(async (tx) => {
    await tx.rating.create({
      data: {
        bookingId,
        fromId,
        toId,
        score,
        comment: comment?.trim() || null,
      },
    });

    // Recalculer la réputation du provider
    const newRep = await recalculateUserReputation(toId, tx);
    await tx.user.update({
      where: { id: toId },
      data: { reputation: newRep },
    });
  });
}

export async function recalculateUserReputation(
  userId: string,
  tx?: Omit<typeof prisma, "$transaction" | "$connect" | "$disconnect" | "$on" | "$use" | "$extends">
): Promise<number> {
  const runner = tx || prisma;

  const ratings = await runner.rating.findMany({
    where: { toId: userId },
    select: { score: true },
  });

  if (ratings.length === 0) return 0;

  const sum = ratings.reduce((acc, r) => acc + r.score, 0);
  const avg = sum / ratings.length;

  // Arrondir à 1 décimale
  return Math.round(avg * 10) / 10;
}
