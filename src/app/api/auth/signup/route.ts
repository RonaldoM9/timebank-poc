import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { awardXP, evaluateUserRewards, checkAndUpdateQuests } from "@/lib/gamification";

const signupSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "6 caractères minimum"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        walletAddress: "", // will be updated after creation
      },
    });

    // Generate wallet address from user.id
    const walletAddress = `time_${user.id.slice(0, 12)}`;

    await prisma.user.update({
      where: { id: user.id },
      data: { walletAddress, timeBalance: 10 },
    });

    // Create mint transaction
    await prisma.transaction.create({
      data: {
        type: "mint",
        amount: 10,
        fromId: null,
        toId: user.id,
        status: "completed",
      },
    });

    // ─── Gamification : XP pour création de profil ──────────
    // Pas de quête welcome-hero ici car le profil n'est pas complet,
    // l'XP sera attribuée quand l'utilisateur complète bio + localisation
    // On initie les quêtes pour l'utilisateur
    await checkAndUpdateQuests(user.id, "profile_complete", 1);

    return NextResponse.json(
      { success: true, name: user.name },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
