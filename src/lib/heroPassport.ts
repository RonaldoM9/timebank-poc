import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export type HeroPassportData = {
  bio: string | null;
  offeredSkills: string | null;
  wantedHelp: string | null;
  motivations: string | null;
  completionPercent: number;
};

const updatePassportSchema = z.object({
  bio: z.string().max(500).optional().default(""),
  offeredSkills: z.string().max(1000).optional().default(""),
  wantedHelp: z.string().max(1000).optional().default(""),
  motivations: z.string().max(1000).optional().default(""),
});

export type UpdatePassportResult =
  | { success: true; completionPercent: number }
  | { error: string }
  | { errors: Record<string, string[]> };

export function computeCompletion(data: {
  bio: string | null;
  offeredSkills: string | null;
  wantedHelp: string | null;
  motivations: string | null;
}): number {
  let pct = 0;
  if (data.bio?.trim()) pct += 25;
  if (data.offeredSkills?.trim()) pct += 30;
  if (data.wantedHelp?.trim()) pct += 20;
  if (data.motivations?.trim()) pct += 25;
  return pct;
}

export async function getHeroPassport(
  userId: string
): Promise<HeroPassportData> {
  const passport = await prisma.heroPassport.findUnique({
    where: { userId },
  });

  if (!passport) {
    return {
      bio: null,
      offeredSkills: null,
      wantedHelp: null,
      motivations: null,
      completionPercent: 0,
    };
  }

  return {
    bio: passport.bio,
    offeredSkills: passport.offeredSkills,
    wantedHelp: passport.wantedHelp,
    motivations: passport.motivations,
    completionPercent: computeCompletion({
      bio: passport.bio,
      offeredSkills: passport.offeredSkills,
      wantedHelp: passport.wantedHelp,
      motivations: passport.motivations,
    }),
  };
}

export async function updateHeroPassport(
  formData: FormData
): Promise<UpdatePassportResult> {
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
    bio: formData.get("bio")?.toString() ?? "",
    offeredSkills: formData.get("offeredSkills")?.toString() ?? "",
    wantedHelp: formData.get("wantedHelp")?.toString() ?? "",
    motivations: formData.get("motivations")?.toString() ?? "",
  };

  const parsed = updatePassportSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { bio: bioVal, offeredSkills, wantedHelp, motivations } = parsed.data;

  // Upsert: create if doesn't exist, update if does
  const passport = await prisma.heroPassport.upsert({
    where: { userId: user.id },
    update: {
      bio: bioVal || null,
      offeredSkills: offeredSkills || null,
      wantedHelp: wantedHelp || null,
      motivations: motivations || null,
    },
    create: {
      userId: user.id,
      bio: bioVal || null,
      offeredSkills: offeredSkills || null,
      wantedHelp: wantedHelp || null,
      motivations: motivations || null,
    },
  });

  const completionPercent = computeCompletion({
    bio: passport.bio,
    offeredSkills: passport.offeredSkills,
    wantedHelp: passport.wantedHelp,
    motivations: passport.motivations,
  });

  return { success: true, completionPercent };
}
