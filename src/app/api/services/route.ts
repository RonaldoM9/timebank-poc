import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const department = searchParams.get("department") || "";
  const region = searchParams.get("region") || "";
  const availableOnline = searchParams.get("availableOnline") || "";
  const solidarity = searchParams.get("solidarity") || "";

  const where: Record<string, unknown> = { status: "active" };

  if (category) {
    where.category = category;
  }

  if (solidarity === "true") {
    where.isSolidarityMission = true;
    where.solidarityStatus = { in: ["SELF_DECLARED", "VERIFIED", "FUNDED"] };
  }

  if (search.trim()) {
    where.OR = [
      { title: { contains: search.trim() } },
      { description: { contains: search.trim() } },
    ];
  }

  // Filtres géographiques
  if (city) {
    where.provider = { ...(where.provider as Record<string, unknown> || {}), city };
  }
  if (department) {
    where.provider = { ...(where.provider as Record<string, unknown> || {}), department };
  }
  if (region) {
    where.provider = { ...(where.provider as Record<string, unknown> || {}), region };
  }
  if (availableOnline === "true") {
    where.provider = { ...(where.provider as Record<string, unknown> || {}), availableOnline: true };
  }

  const services = await prisma.service.findMany({
    where,
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
  }));

  return NextResponse.json(serialized);
}
