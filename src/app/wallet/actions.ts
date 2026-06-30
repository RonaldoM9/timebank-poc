"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  recalculateWallet,
  syncWalletFromLedger,
  createManualAdjustment,
  getWalletSummary,
  getWalletBreakdown,
  getUserLedger,
  getTransactionById,
  getAvailableMinutes,
} from "@/lib/time-ledger";

// ─── GET wallet (public for the user) ─────────────────────────────────────

export async function getMyWallet() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Non connecté" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  const wallet = await getWalletSummary(user.id);
  const breakdown = await getWalletBreakdown(user.id);

  return {
    success: true,
    wallet: {
      ...wallet,
      breakdown,
      availableMinutes: wallet.availableMinutes,
      lockedMinutes: wallet.lockedMinutes,
      pendingMinutes: wallet.pendingMinutes,
      disputedMinutes: wallet.disputedMinutes,
      totalReceivedMinutes: wallet.totalReceivedMinutes,
      totalSentMinutes: wallet.totalSentMinutes,
    },
  };
}

// ─── GET available balance (in minutes) ───────────────────────────────────

export async function getMyAvailableMinutes() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return 0;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return 0;

  return getAvailableMinutes(user.id);
}

// ─── GET ledger history ──────────────────────────────────────────────────

export async function getMyLedgerHistory(opts?: {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Non connecté" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  return getUserLedger(user.id, opts);
}

// ─── GET single transaction ──────────────────────────────────────────────

export async function getMyTransaction(transactionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Non connecté" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  const tx = await getTransactionById(transactionId);
  if (!tx) return { error: "Transaction introuvable" };
  if (tx.userId !== user.id) return { error: "Accès non autorisé" };

  return { success: true, transaction: tx };
}

// ─── ADMIN: recalculer wallet ────────────────────────────────────────────

export async function adminRecalculateWallet(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Non connecté" };

  const admin = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "FACILITATOR")) {
    return { error: "Action non autorisée" };
  }

  const wallet = await syncWalletFromLedger(userId);
  revalidatePath("/wallet");
  return { success: true, wallet };
}

// ─── ADMIN: ajustement manuel ────────────────────────────────────────────

export async function adminManualAdjustment(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Non connecté" };

  const admin = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "FACILITATOR")) {
    return { error: "Action non autorisée" };
  }

  const userId = formData.get("userId") as string;
  const amountRaw = formData.get("amountMinutes") as string;
  const direction = formData.get("direction") as "credit" | "debit";
  const reason = formData.get("reason") as string;

  if (!userId || !amountRaw || !direction || !reason) {
    return { error: "Tous les champs sont requis" };
  }

  const amountMinutes = parseInt(amountRaw, 10);
  if (isNaN(amountMinutes) || amountMinutes <= 0) {
    return { error: "Le montant doit être un entier positif" };
  }

  try {
    const tx = await createManualAdjustment({
      userId,
      amountMinutes,
      direction,
      reason,
      createdById: admin.id,
    });
    revalidatePath("/wallet");
    return { success: true, transaction: tx };
  } catch (err) {
    return { error: (err as Error).message };
  }
}
