"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateLocationSchema = z.object({
  city: z.string().optional().default(""),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "Le code postal doit faire 5 chiffres")
    .optional()
    .or(z.literal("")),
  department: z.string().optional().default(""),
  region: z.string().optional().default(""),
  country: z.string().optional().default("France"),
  serviceRadiusKm: z.coerce
    .number()
    .refine((v) => [5, 10, 20, 50].includes(v), {
      message: "Rayon invalide (5, 10, 20 ou 50)",
    })
    .default(10),
  locationVisibility: z
    .enum(["city", "department", "region", "hidden"])
    .default("city"),
  availableOnline: z.coerce.boolean().default(false),
});

export type UpdateLocationResult =
  | { success: true }
  | { error: string }
  | { errors: Record<string, string[]> };

export async function updateLocation(
  formData: FormData
): Promise<UpdateLocationResult> {
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
    city: formData.get("city")?.toString() ?? "",
    postalCode: formData.get("postalCode")?.toString() ?? "",
    department: formData.get("department")?.toString() ?? "",
    region: formData.get("region")?.toString() ?? "",
    country: formData.get("country")?.toString() ?? "France",
    serviceRadiusKm: formData.get("serviceRadiusKm")?.toString() ?? "10",
    locationVisibility:
      formData.get("locationVisibility")?.toString() ?? "city",
    availableOnline: formData.get("availableOnline") === "on" ? true : false,
  };

  const parsed = updateLocationSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return { errors: fieldErrors };
  }

  const {
    city,
    postalCode,
    department,
    region,
    country,
    serviceRadiusKm,
    locationVisibility,
    availableOnline,
  } = parsed.data;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      city: city || null,
      postalCode: postalCode || null,
      department: department || null,
      region: region || null,
      country,
      serviceRadiusKm,
      locationVisibility,
      availableOnline,
    },
  });

  return { success: true };
}
