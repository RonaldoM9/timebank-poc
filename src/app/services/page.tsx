import { prisma } from "@/lib/prisma";
import ServicesClient from "./ServicesClient";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
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

  const serialized = services.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    isSolidarityMission: s.isSolidarityMission,
    solidarityStatus: s.solidarityStatus,
    solidarityCategory: s.solidarityCategory,
    solidarityReason: s.solidarityReason,
  }));

  return <ServicesClient initialServices={serialized} />;
}
