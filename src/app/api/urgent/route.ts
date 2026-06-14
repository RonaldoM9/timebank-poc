import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const department = searchParams.get("department") || "";
  const region = searchParams.get("region") || "";
  const availableOnline = searchParams.get("availableOnline") || "";
  const urgency = searchParams.get("urgency") || "";
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = { status: "open" };

  if (category) {
    where.category = category;
  }

  if (urgency) {
    where.urgency = urgency;
  }

  if (city) {
    where.city = city;
  }
  if (department) {
    where.department = department;
  }
  if (region) {
    where.region = region;
  }
  if (availableOnline === "true") {
    where.online = true;
  }

  if (search.trim()) {
    where.OR = [
      { title: { contains: search.trim() } },
      { description: { contains: search.trim() } },
    ];
  }

  const requests = await prisma.urgentRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          reputation: true,
        },
      },
      offers: {
        select: { id: true },
      },
    },
  });

  const mapped = requests.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    city: r.city,
    department: r.department,
    region: r.region,
    online: r.online,
    urgency: r.urgency,
    hours: r.hours,
    ratePerHour: r.ratePerHour,
    totalTime: r.totalTime,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    offersCount: r.offers.length,
    requester: r.requester,
  }));

  return NextResponse.json(mapped);
}
