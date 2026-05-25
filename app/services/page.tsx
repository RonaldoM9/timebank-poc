import { prisma } from "@/lib/prisma";
import ServicesClient from "./ServicesClient";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    include: {
      provider: {
        select: { name: true, walletAddress: true },
      },
    },
  });

  const serialized = services.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return <ServicesClient initialServices={serialized} />;
}
