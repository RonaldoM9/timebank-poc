import { prisma } from "./prisma";

export interface PublicProfile {
  id: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  createdAt: string;
  walletAddressShort: string;
  reputation: number;
  ratingsCount: number;
  activeServicesCount: number;
  missionsCompleted: number;
  totalTimeEarned: number;
  city: string | null;
  department: string | null;
  region: string | null;
  locationVisibility: string;
  serviceRadiusKm: number | null;
  availableOnline: boolean;
  activeServices: PublicServiceItem[];
  recentRatings: PublicRatingItem[];
}

export interface PublicServiceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  ratePerHour: number;
}

export interface PublicRatingItem {
  id: string;
  score: number;
  comment: string | null;
  createdAt: string;
  clientName: string;
  clientId: string;
  serviceTitle: string;
}

export async function getPublicProfile(userId: string): Promise<PublicProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      bio: true,
      avatar: true,
      createdAt: true,
      walletAddress: true,
      reputation: true,
      city: true,
      department: true,
      region: true,
      locationVisibility: true,
      serviceRadiusKm: true,
      availableOnline: true,
    },
  });

  if (!user) return null;

  // Services actifs du provider
  const activeServices = await prisma.service.findMany({
    where: { providerId: userId, status: "active" },
    select: { id: true, title: true, description: true, category: true, ratePerHour: true },
    orderBy: { createdAt: "desc" },
  });

  // Missions completed comme provider
  const missionsCompleted = await prisma.booking.count({
    where: {
      service: { providerId: userId },
      status: "completed",
    },
  });

  // Nombre d'avis reçus
  const ratingsCount = await prisma.rating.count({
    where: { toId: userId },
  });

  // Avis reçus avec client et service
  const ratings = await prisma.rating.findMany({
    where: { toId: userId },
    select: {
      id: true,
      score: true,
      comment: true,
      createdAt: true,
      from: {
        select: { id: true, name: true },
      },
      booking: {
        select: {
          service: { select: { title: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Total TIME gagnés via release
  const timeEarnedResult = await prisma.transaction.aggregate({
    where: { toId: userId, type: "release" },
    _sum: { amount: true },
  });
  const totalTimeEarned = timeEarnedResult._sum.amount ?? 0;

  // Wallet short
  const walletAddressShort = user.walletAddress
    ? user.walletAddress.length > 12
      ? `${user.walletAddress.slice(0, 11)}...${user.walletAddress.slice(-3)}`
      : user.walletAddress
    : "";

  return {
    id: user.id,
    name: user.name,
    bio: user.bio,
    avatar: user.avatar,
    createdAt: user.createdAt.toISOString(),
    walletAddressShort,
    reputation: user.reputation,
    ratingsCount,
    activeServicesCount: activeServices.length,
    missionsCompleted,
    totalTimeEarned,
    city: user.city,
    department: user.department,
    region: user.region,
    locationVisibility: user.locationVisibility ?? "city",
    serviceRadiusKm: user.serviceRadiusKm,
    availableOnline: user.availableOnline ?? false,
    activeServices: activeServices.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      category: s.category,
      ratePerHour: s.ratePerHour,
    })),
    recentRatings: ratings.map((r) => ({
      id: r.id,
      score: r.score,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      clientName: r.from.name,
      clientId: r.from.id,
      serviceTitle: r.booking.service.title,
    })),
  };
}
