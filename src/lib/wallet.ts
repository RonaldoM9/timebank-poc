// ─── Lot 25 — WalletService ────────────────────────────────────────────
// Wrapper autour du ledger pour l'affichage et le formatage

import {
  getWalletSummary,
  getWalletBreakdown,
  recalculateWallet,
  syncWalletFromLedger,
  getAvailableMinutes,
} from "./time-ledger";
import {
  formatTimeAmount,
  formatDuration,
  formatTimeWithDuration,
  minutesToTime,
  type TimeDirection,
} from "./time-labels";

export {
  formatTimeAmount,
  formatDuration,
  formatTimeWithDuration,
  minutesToTime,
};

/** Obtenir le résumé du wallet d'un utilisateur */
export async function getWallet(userId: string) {
  return getWalletSummary(userId);
}

/** Obtenir la décomposition sous-soldes */
export async function getWalletBreakdownForUser(userId: string) {
  return getWalletBreakdown(userId);
}

/** Obtenir le solde disponible en minutes */
export async function getUserAvailableMinutes(userId: string) {
  return getAvailableMinutes(userId);
}

/** Recalculer le wallet depuis le ledger */
export async function recalcWalletFromLedger(userId: string) {
  return syncWalletFromLedger(userId);
}

/** Obtenir le solde formaté pour affichage */
export async function getFormattedBalance(userId: string): Promise<{
  availableMinutes: number;
  availableDisplay: string;
  availableDuration: string;
  availableFull: string;
}> {
  const wallet = await getWalletSummary(userId);
  const minutes = wallet.availableMinutes;

  return {
    availableMinutes: minutes,
    availableDisplay: formatTimeAmount(minutes),
    availableDuration: formatDuration(minutes),
    availableFull: formatTimeWithDuration(minutes),
  };
}

export type WalletBreakdownItem = {
  key: string;
  label: string;
  minutes: number;
  sublabel: string;
  display: string;
  duration: string;
};
