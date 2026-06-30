// ─── Lot 25 — TimeLedger constants and enums ─────────────────────────────

/** Transaction types */
export const TIME_TRANSACTION_TYPES = {
  OPENING_BALANCE: "opening_balance",
  WELCOME_MINT: "welcome_mint",
  ADMIN_MINT: "admin_mint",
  BOOKING_LOCK: "booking_lock",
  BOOKING_RELEASE: "booking_release",
  BOOKING_REFUND: "booking_refund",
  TRANSFER_IN: "transfer_in",
  TRANSFER_OUT: "transfer_out",
  COMMUNITY_POT_DEPOSIT: "community_pot_deposit",
  COMMUNITY_POT_WITHDRAWAL: "community_pot_withdrawal",
  MISSION_REWARD: "mission_reward",
  MANUAL_ADJUSTMENT: "manual_adjustment",
  DISPUTE_FREEZE: "dispute_freeze",
  DISPUTE_RESOLUTION: "dispute_resolution",
  EXPIRATION: "expiration",
  REVERSAL: "reversal",
} as const;

export type TimeTransactionType =
  (typeof TIME_TRANSACTION_TYPES)[keyof typeof TIME_TRANSACTION_TYPES];

/** Transaction statuses */
export const TIME_TRANSACTION_STATUSES = {
  CREATED: "created",
  PENDING: "pending",
  LOCKED: "locked",
  COMPLETED: "completed",
  RELEASED: "released",
  REFUNDED: "refunded",
  DISPUTED: "disputed",
  FROZEN: "frozen",
  REVERSED: "reversed",
  EXPIRED: "expired",
  ADJUSTED: "adjusted",
  FAILED: "failed",
} as const;

export type TimeTransactionStatus =
  (typeof TIME_TRANSACTION_STATUSES)[keyof typeof TIME_TRANSACTION_STATUSES];

/** Directions */
export const TIME_DIRECTIONS = {
  CREDIT: "credit",
  DEBIT: "debit",
} as const;

export type TimeDirection =
  (typeof TIME_DIRECTIONS)[keyof typeof TIME_DIRECTIONS];

/** Sources */
export const TIME_SOURCES = {
  SYSTEM: "system",
  BOOKING: "booking",
  MISSION: "mission",
  COMMUNITY_POT: "community_pot",
  ORGANIZATION: "organization",
  FACILITATOR: "facilitator",
  DEMO_SEED: "demo_seed",
  MIGRATION: "migration",
  MANUAL: "manual",
} as const;

export type TimeSource =
  (typeof TIME_SOURCES)[keyof typeof TIME_SOURCES];

/** Minimum P2P exchange in minutes */
export const MIN_P2P_EXCHANGE_MINUTES = 30;

/** Idempotency key separator */
export const IDEMPOTENCY_SEPARATOR = ":";

export function buildIdempotencyKey(
  type: string,
  bookingId: string,
  userId: string
): string {
  return [type, bookingId, userId].join(IDEMPOTENCY_SEPARATOR);
}

// ─── Format helpers ──────────────────────────────────────────────────────

/** Convert minutes to TIME units (number) */
export function minutesToTime(minutes: number): number {
  return minutes / 60;
}

/** Format minutes as "X TIME" with French locale */
export function formatTimeAmount(minutes: number): string {
  const time = minutesToTime(minutes);
  // Use French formatting with comma
  const formatted = time.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
  return `${formatted} TIME`;
}

/** Format minutes as natural duration (e.g., "1h30", "30 min") */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h${remainingMinutes}`;
}

/** Full display — e.g., "1,5 TIME · 1h30" */
export function formatTimeWithDuration(minutes: number): string {
  return `${formatTimeAmount(minutes)} · ${formatDuration(minutes)}`;
}

/** Map transaction types to user-facing labels */
export function getLedgerTransactionLabel(type: string): string {
  const labels: Record<string, string> = {
    opening_balance: "Solde initial",
    welcome_mint: "Crédit de bienvenue",
    admin_mint: "Crédit administrateur",
    booking_lock: "Réservation",
    booking_release: "Aide validée",
    booking_refund: "Remboursement",
    transfer_in: "Transfert reçu",
    transfer_out: "Transfert envoyé",
    community_pot_deposit: "Don au pot commun",
    community_pot_withdrawal: "Reçu du pot commun",
    mission_reward: "Récompense mission",
    manual_adjustment: "Ajustement manuel",
    dispute_freeze: "Litige — gel",
    dispute_resolution: "Litige — résolution",
    expiration: "Expiration",
    reversal: "Annulation comptable",
  };
  return labels[type] ?? "Transaction TimeHeroes";
}
