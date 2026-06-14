import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ServiceDetailClient from "./ServiceDetailClient";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          walletAddress: true,
          reputation: true,
          city: true,
          department: true,
          region: true,
          locationVisibility: true,
          serviceRadiusKm: true,
          availableOnline: true,
        },
      },
    },
  });

  if (!service) notFound();

  const session = await getServerSession(authOptions);
  const isOwner = session?.user?.email
    ? (await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      }))?.id === service.provider.id
    : false;

  const serialized = {
    ...service,
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
    isSolidarityMission: service.isSolidarityMission,
    solidarityStatus: service.solidarityStatus,
    solidarityCategory: service.solidarityCategory,
    solidarityReason: service.solidarityReason,
  };

  return <ServiceDetailClient service={serialized} isOwner={isOwner} />;
}
