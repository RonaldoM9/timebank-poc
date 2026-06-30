// ─── Lot 25 — Time Ledger Service (append-only) ─────────────────────────
//
// Règle fondamentale : on ne modifie JAMAIS un solde TIME directement.
// On ajoute TOUJOURS une transaction dans le ledger.
// Le wallet est un cache ; le ledger est la source de vérité.

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  TIME_DIRECTIONS,
  TIME_TRANSACTION_STATUSES,
  type TimeTransactionType,
  type TimeDirection,
  type TimeSource,
  buildIdempotencyKey,
} from "./time-labels";

// ─── Types ───────────────────────────────────────────────────────────────

export type CreateLedgerTransactionInput = {
  userId: string;
  counterpartyId?: string | null;
  bookingId?: string | null;
  missionId?: string | null;
  organizationId?: string | null;
  communityPotId?: string | null;
  amountMinutes: number;
  direction: TimeDirection;
  type: TimeTransactionType;
  status?: string;
  source: TimeSource;
  reason?: string | null;
  createdById?: string | null;
  metadata?: Record<string, unknown> | null;
  reversedTransactionId?: string | null;
};

export type LockTimeInput = {
  requesterId: string;
  helperId: string;
  bookingId: string;
  amountMinutes: number;
};

export type ReleaseTimeInput = {
  requesterId: string;
  helperId: string;
  bookingId: string;
  amountMinutes: number;
};

export type RefundTimeInput = {
  requesterId: string;
  bookingId: string;
  amountMinutes: number;
};

export type FreezeTimeInput = {
  requesterId: string;
  helperId: string;
  bookingId: string;
  amountMinutes: number;
};

export type ManualAdjustmentInput = {
  userId: string;
  amountMinutes: number;
  direction: TimeDirection;
  reason: string;
  createdById: string;
  metadata?: Record<string, unknown>;
};

// ─── Errors ──────────────────────────────────────────────────────────────

export class InsufficientTimeBalanceError extends Error {
  constructor(available: number, required: number) {
    super(
      `Solde TIME insuffisant. Disponible : ${available} min, requis : ${required} min.`
    );
    this.name = "InsufficientTimeBalanceError";
  }
}

export class IdempotentOperationError extends Error {
  constructor(key: string) {
    super(`Opération déjà effectuée : ${key}`);
    this.name = "IdempotentOperationError";
  }
}

// ─── Service ─────────────────────────────────────────────────────────────

export async function createLedgerTransaction(
  input: CreateLedgerTransactionInput
) {
  if (input.amountMinutes <= 0) {
    throw new Error("amountMinutes doit être strictement positif");
  }

  const tx = await prisma.timeLedgerTransaction.create({
    data: {
      userId: input.userId,
      counterpartyId: input.counterpartyId ?? null,
      bookingId: input.bookingId ?? null,
      missionId: input.missionId ?? null,
      organizationId: input.organizationId ?? null,
      communityPotId: input.communityPotId ?? null,
      amountMinutes: input.amountMinutes,
      direction: input.direction,
      type: input.type,
      status: input.status ?? TIME_TRANSACTION_STATUSES.CREATED,
      source: input.source,
      reason: input.reason ?? null,
      createdById: input.createdById ?? null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      reversedTransactionId: input.reversedTransactionId ?? null,
    },
  });

  return tx;
}

// ─── Wallet helpers ──────────────────────────────────────────────────────

/** Ensure wallet exists, create if not */
async function ensureWallet(userId: string) {
  const wallet = await prisma.userWallet.findUnique({
    where: { userId },
  });
  if (wallet) return wallet;

  return prisma.userWallet.create({
    data: { userId },
  });
}

/** Get a user's available balance from wallet cache */
export async function getAvailableMinutes(userId: string): Promise<number> {
  const wallet = await prisma.userWallet.findUnique({
    where: { userId },
    select: { availableMinutes: true },
  });

  if (!wallet) {
    // No wallet yet — might be a new user with no transactions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timeBalance: true },
    });
    if (!user) return 0;
    // If they have an old balance, return that as minutes
    return Math.round(user.timeBalance * 60);
  }

  return wallet.availableMinutes;
}

/** Recalculate wallet from ledger (truth source) */
export async function recalculateWallet(
  userId: string
): Promise<{
  availableMinutes: number;
  pendingMinutes: number;
  lockedMinutes: number;
  disputedMinutes: number;
  earnedMinutes: number;
  giftedMinutes: number;
  communityMinutes: number;
  expiredMinutes: number;
  totalReceivedMinutes: number;
  totalSentMinutes: number;
  totalImpactMinutes: number;
}> {
  const transactions = await prisma.timeLedgerTransaction.findMany({
    where: { userId },
  });

  let available = 0;
  let pending = 0;
  let locked = 0;
  let disputed = 0;
  let earned = 0;
  let gifted = 0;
  let community = 0;
  let expired = 0;
  let totalReceived = 0;
  let totalSent = 0;
  let totalImpact = 0;

  for (const tx of transactions) {
    const isCredit = tx.direction === TIME_DIRECTIONS.CREDIT;

    // Skip reversed transactions
    if (tx.status === TIME_TRANSACTION_STATUSES.REVERSED) continue;

    switch (tx.type) {
      case "booking_lock":
        // Debit from available, goes to locked
        if (isCredit) {
          locked += tx.amountMinutes;
        } else {
          available -= tx.amountMinutes;
        }
        break;

      case "booking_release":
        // Helper receives it as available
        if (isCredit) {
          available += tx.amountMinutes;
          earned += tx.amountMinutes;
          totalImpact += tx.amountMinutes;
        }
        break;

      case "booking_refund":
        // Goes back to requester available
        if (isCredit) {
          available += tx.amountMinutes;
        }
        break;

      case "dispute_freeze":
        if (isCredit) {
          disputed += tx.amountMinutes;
        }
        break;

      case "dispute_resolution":
        // Could go either way
        if (isCredit) {
          available += tx.amountMinutes;
        } else {
          disputed -= tx.amountMinutes;
        }
        break;

      case "opening_balance":
      case "welcome_mint":
      case "admin_mint":
      case "mission_reward":
        if (isCredit) {
          available += tx.amountMinutes;
          earned += tx.amountMinutes;
          totalImpact += tx.amountMinutes;
        }
        break;

      case "transfer_in":
        if (isCredit) {
          available += tx.amountMinutes;
          gifted += tx.amountMinutes;
        }
        break;

      case "transfer_out":
        if (!isCredit) {
          available -= tx.amountMinutes;
          totalSent += tx.amountMinutes;
        }
        break;

      case "community_pot_deposit":
        if (!isCredit) {
          available -= tx.amountMinutes;
          totalSent += tx.amountMinutes;
        }
        break;

      case "community_pot_withdrawal":
        if (isCredit) {
          available += tx.amountMinutes;
          community += tx.amountMinutes;
        }
        break;

      case "manual_adjustment":
        if (isCredit) {
          available += tx.amountMinutes;
        } else {
          available -= tx.amountMinutes;
        }
        break;

      case "expiration":
        if (!isCredit) {
          available -= tx.amountMinutes;
          expired += tx.amountMinutes;
        }
        break;

      default:
        // Unknown type — try direction-based
        if (isCredit) {
          available += tx.amountMinutes;
          totalReceived += tx.amountMinutes;
        } else {
          available -= tx.amountMinutes;
          totalSent += tx.amountMinutes;
        }
    }
  }

  return {
    availableMinutes: Math.max(0, available),
    pendingMinutes: Math.max(0, pending),
    lockedMinutes: Math.max(0, locked),
    disputedMinutes: Math.max(0, disputed),
    earnedMinutes: Math.max(0, earned),
    giftedMinutes: Math.max(0, gifted),
    communityMinutes: Math.max(0, community),
    expiredMinutes: Math.max(0, expired),
    totalReceivedMinutes: Math.max(0, totalReceived),
    totalSentMinutes: Math.max(0, totalSent),
    totalImpactMinutes: Math.max(0, totalImpact),
  };
}

/** Recalculate AND sync wallet cache from ledger */
export async function syncWalletFromLedger(userId: string) {
  const computed = await recalculateWallet(userId);
  const wallet = await ensureWallet(userId);

  const updated = await prisma.userWallet.update({
    where: { id: wallet.id },
    data: computed,
  });

  return updated;
}

// ─── Business operations ────────────────────────────────────────────────

/** Lock TIME when a booking is confirmed */
export async function lockTimeForBooking(input: LockTimeInput) {
  const idempotencyKey = buildIdempotencyKey(
    "booking_lock",
    input.bookingId,
    input.requesterId
  );

  // Check idempotency
  const existing = await prisma.timeLedgerTransaction.findFirst({
    where: {
      userId: input.requesterId,
      bookingId: input.bookingId,
      type: "booking_lock",
      status: TIME_TRANSACTION_STATUSES.LOCKED,
    },
  });
  if (existing) {
    throw new IdempotentOperationError(idempotencyKey);
  }

  // Check balance
  const available = await getAvailableMinutes(input.requesterId);
  if (available < input.amountMinutes) {
    throw new InsufficientTimeBalanceError(available, input.amountMinutes);
  }

  // Atomic operation: debit requester available, credit requester locked
  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Debit from available
    await createLedgerTransaction({
      userId: input.requesterId,
      counterpartyId: input.helperId,
      bookingId: input.bookingId,
      amountMinutes: input.amountMinutes,
      direction: TIME_DIRECTIONS.DEBIT,
      type: "booking_lock",
      status: TIME_TRANSACTION_STATUSES.LOCKED,
      source: "booking",
      reason: "Réservation confirmée",
    });

    return { success: true as const };
  });

  // Sync wallet cache
  await syncWalletFromLedger(input.requesterId);

  return result;
}

/** Release TIME to the helper when mission is validated */
export async function releaseTimeForBooking(input: ReleaseTimeInput) {
  // Check idempotency
  const existingRelease = await prisma.timeLedgerTransaction.findFirst({
    where: {
      bookingId: input.bookingId,
      type: "booking_release",
      status: TIME_TRANSACTION_STATUSES.RELEASED,
    },
  });
  if (existingRelease) {
    throw new IdempotentOperationError(
      `booking_release:${input.bookingId}`
    );
  }

  await prisma.$transaction(async (_tx: Prisma.TransactionClient) => {
    // 1. Remove locked from requester
    await createLedgerTransaction({
      userId: input.requesterId,
      counterpartyId: input.helperId,
      bookingId: input.bookingId,
      amountMinutes: input.amountMinutes,
      direction: TIME_DIRECTIONS.CREDIT,
      type: "booking_release",
      status: TIME_TRANSACTION_STATUSES.COMPLETED,
      source: "booking",
      reason: "Mission validée — sortie du requester",
    });

    // 2. Credit to helper as available
    await createLedgerTransaction({
      userId: input.helperId,
      counterpartyId: input.requesterId,
      bookingId: input.bookingId,
      amountMinutes: input.amountMinutes,
      direction: TIME_DIRECTIONS.CREDIT,
      type: "booking_release",
      status: TIME_TRANSACTION_STATUSES.RELEASED,
      source: "booking",
      reason: "Mission validée — TIME reçu",
    });
  });

  // Sync both wallets
  await Promise.all([
    syncWalletFromLedger(input.requesterId),
    syncWalletFromLedger(input.helperId),
  ]);

  return { success: true as const };
}

/** Refund TIME to the requester when booking is cancelled */
export async function refundTimeForBooking(input: RefundTimeInput) {
  // Check idempotency
  const existingRefund = await prisma.timeLedgerTransaction.findFirst({
    where: {
      bookingId: input.bookingId,
      type: "booking_refund",
      status: TIME_TRANSACTION_STATUSES.REFUNDED,
    },
  });
  if (existingRefund) {
    throw new IdempotentOperationError(
      `booking_refund:${input.bookingId}`
    );
  }

  await createLedgerTransaction({
    userId: input.requesterId,
    bookingId: input.bookingId,
    amountMinutes: input.amountMinutes,
    direction: TIME_DIRECTIONS.CREDIT,
    type: "booking_refund",
    status: TIME_TRANSACTION_STATUSES.REFUNDED,
    source: "booking",
    reason: "Annulation de réservation",
  });

  await syncWalletFromLedger(input.requesterId);

  return { success: true as const };
}

/** Freeze TIME during a dispute */
export async function freezeTimeForDispute(input: FreezeTimeInput) {
  // Check idempotency
  const existingFreeze = await prisma.timeLedgerTransaction.findFirst({
    where: {
      bookingId: input.bookingId,
      type: "dispute_freeze",
      status: TIME_TRANSACTION_STATUSES.FROZEN,
    },
  });
  if (existingFreeze) {
    throw new IdempotentOperationError(
      `dispute_freeze:${input.bookingId}`
    );
  }

  // Debit from requester's locked, goes to disputed
  await createLedgerTransaction({
    userId: input.requesterId,
    counterpartyId: input.helperId,
    bookingId: input.bookingId,
    amountMinutes: input.amountMinutes,
    direction: TIME_DIRECTIONS.CREDIT,
    type: "dispute_freeze",
    status: TIME_TRANSACTION_STATUSES.FROZEN,
    source: "booking",
    reason: "Ouverture de litige",
  });

  await syncWalletFromLedger(input.requesterId);

  return { success: true as const };
}

/** Create a manual adjustment (admin/facilitator only) */
export async function createManualAdjustment(input: ManualAdjustmentInput) {
  if (!input.reason || input.reason.trim().length < 3) {
    throw new Error(
      "La raison est obligatoire (min. 3 caractères) pour un ajustement manuel"
    );
  }

  const metadataWithContext: Record<string, unknown> = {
    ...(input.metadata ?? {}),
    adjustmentContext: input.metadata?.adjustmentContext ?? "manual_adjustment",
  };

  const tx = await createLedgerTransaction({
    userId: input.userId,
    amountMinutes: input.amountMinutes,
    direction: input.direction,
    type: "manual_adjustment",
    status: TIME_TRANSACTION_STATUSES.ADJUSTED,
    source: "manual",
    reason: input.reason,
    createdById: input.createdById,
    metadata: metadataWithContext,
  });

  await syncWalletFromLedger(input.userId);

  return tx;
}

// ─── Ledger queries ─────────────────────────────────────────────────────

/** Get all transactions for a user with pagination */
export async function getUserLedger(
  userId: string,
  options?: {
    type?: string;
    status?: string;
    direction?: TimeDirection;
    page?: number;
    limit?: number;
  }
) {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.TimeLedgerTransactionWhereInput = { userId };

  if (options?.type) where.type = options.type;
  if (options?.status) where.status = options.status;
  if (options?.direction) where.direction = options.direction;

  const [transactions, total] = await Promise.all([
    prisma.timeLedgerTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        counterparty: { select: { id: true, name: true } },
        booking: {
          select: {
            status: true,
            service: { select: { title: true } },
          },
        },
      },
    }),
    prisma.timeLedgerTransaction.count({ where }),
  ]);

  return {
    transactions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/** Get a single transaction by ID */
export async function getTransactionById(transactionId: string) {
  return prisma.timeLedgerTransaction.findUnique({
    where: { id: transactionId },
    include: {
      user: { select: { id: true, name: true } },
      counterparty: { select: { id: true, name: true } },
      booking: {
        select: {
          id: true,
          status: true,
          service: { select: { title: true } },
        },
      },
    },
  });
}

/** Get wallet summary (from cache) */
export async function getWalletSummary(userId: string) {
  let wallet = await prisma.userWallet.findUnique({
    where: { userId },
  });

  // If no wallet yet, create one with recalculated values
  if (!wallet) {
    wallet = await syncWalletFromLedger(userId);
  }

  return wallet;
}

/** Get wallet breakdown with sub-balances */
export async function getWalletBreakdown(userId: string) {
  const wallet = await getWalletSummary(userId);

  return [
    {
      key: "available",
      label: "Disponible",
      minutes: wallet.availableMinutes,
      sublabel: "Tu peux utiliser ce TIME pour réserver une aide.",
    },
    {
      key: "locked",
      label: "TIME bloqué",
      minutes: wallet.lockedMinutes,
      sublabel: "Ce TIME est réservé pour une mission en cours.",
    },
    {
      key: "pending",
      label: "En attente",
      minutes: wallet.pendingMinutes,
      sublabel: "TIME en attente de validation.",
    },
    {
      key: "disputed",
      label: "TIME en litige",
      minutes: wallet.disputedMinutes,
      sublabel: "Ce TIME est gelé le temps de résoudre un problème.",
    },
  ];
}
