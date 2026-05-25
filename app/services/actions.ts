"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createServiceSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  category: z.string().min(1, "La catégorie est requise"),
  ratePerHour: z.coerce.number().int().positive("Le tarif doit être un nombre entier positif"),
});

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  ratePerHour: number;
  providerId: string;
  status: string;
  createdAt: Date;
  provider: {
    name: string;
    walletAddress: string;
  };
};

export async function createService(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Vous devez être connecté" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    ratePerHour: formData.get("ratePerHour"),
  };

  const parsed = createServiceSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return { errors: fieldErrors };
  }

  const { title, description, category, ratePerHour } = parsed.data;

  const service = await prisma.service.create({
    data: {
      title,
      description,
      category,
      ratePerHour,
      providerId: user.id,
      status: "active",
    },
  });

  return { success: true, serviceId: service.id };
}

export async function toggleServiceStatus(serviceId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Vous devez être connecté" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { providerId: true, status: true },
  });
  if (!service) return { error: "Service introuvable" };
  if (service.providerId !== user.id) return { error: "Action non autorisée" };

  const newStatus = service.status === "active" ? "inactive" : "active";

  await prisma.service.update({
    where: { id: serviceId },
    data: { status: newStatus },
  });

  return { success: true, newStatus };
}

export async function getMyServices() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return [];

  const services = await prisma.service.findMany({
    where: { providerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      provider: {
        select: { name: true, walletAddress: true },
      },
    },
  });

  return services.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
}

export async function getActiveServices(search?: string, category?: string) {
  const where: Record<string, unknown> = { status: "active" };

  if (category && category !== "Tous") {
    where.category = category;
  }

  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search.trim() } },
      { description: { contains: search.trim() } },
      { provider: { name: { contains: search.trim() } } },
    ];
  }

  const services = await prisma.service.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      provider: {
        select: { name: true, walletAddress: true },
      },
    },
  });

  return services.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
}

export async function getServiceById(id: string) {
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      provider: {
        select: { id: true, name: true, walletAddress: true },
      },
    },
  });

  if (!service) return null;

  return {
    ...service,
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  };
}
