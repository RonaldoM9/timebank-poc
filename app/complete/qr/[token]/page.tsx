import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QRCompleteClient from "./QRCompleteClient";
import crypto from "crypto";

export default async function QRCompletePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await getServerSession(authOptions);

  // Si non connecté, redirect signin avec callback
  if (!session?.user?.email) {
    redirect(`/auth/signin?callbackUrl=/complete/qr/${token}`);
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) redirect(`/auth/signin?callbackUrl=/complete/qr/${token}`);

  // Vérifier le token côté serveur
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const booking = await prisma.booking.findFirst({
    where: { completionTokenHash: tokenHash },
    include: {
      service: {
        select: {
          title: true,
          provider: { select: { id: true, name: true } },
        },
      },
      client: { select: { id: true, name: true } },
      proofOfCompletion: { select: { id: true } },
    },
  });

  // Déterminer l'erreur
  let error: string | null = null;

  if (!booking) {
    error = "QR code invalide ou inexistant";
  } else if (booking.clientId !== user.id) {
    error = "Vous n'êtes pas autorisé à valider cette mission";
  } else if (booking.service.provider.id === user.id) {
    error = "Le provider ne peut pas valider son propre QR";
  } else if (booking.status === "cancelled") {
    error = "Cette mission a été annulée";
  } else if (booking.status === "completed") {
    error = "Mission déjà validée";
  } else if (booking.proofOfCompletion) {
    error = "Mission déjà validée via QR";
  } else if (
    booking.completionTokenExpiresAt &&
    new Date() > booking.completionTokenExpiresAt
  ) {
    error = "QR code expiré";
  }

  const bookingData = booking
    ? {
        id: booking.id,
        serviceTitle: booking.service.title,
        providerName: booking.service.provider.name,
        providerId: booking.service.provider.id,
        clientName: booking.client.name,
        clientId: booking.client.id,
        hours: booking.hours,
        totalTime: booking.totalTime,
        status: booking.status,
      }
    : null;

  return (
    <QRCompleteClient
      token={token}
      booking={bookingData}
      error={error}
      userId={user.id}
    />
  );
}
