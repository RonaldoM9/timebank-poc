"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRating } from "@/lib/ratings";
import { revalidatePath } from "next/cache";

export async function createRatingAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Vous devez être connecté." };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return { error: "Utilisateur introuvable." };
  }

  const bookingId = formData.get("bookingId") as string;
  const scoreRaw = formData.get("score") as string;
  const comment = (formData.get("comment") as string) || undefined;

  if (!bookingId || !scoreRaw) {
    return { error: "Paramètres manquants." };
  }

  const score = parseInt(scoreRaw, 10);

  try {
    await createRating({
      bookingId,
      fromId: user.id,
      score,
      comment,
    });

    revalidatePath(`/bookings/${bookingId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }
}
