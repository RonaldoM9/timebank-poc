/**
 * Seuils P0 pour le dashboard Intelligence réseau.
 * Tous les délais et limites sont centralisés ici pour faciliter les ajustements.
 */
export const FACILITATOR_THRESHOLDS = {
  // ─── Demandes bloquées ─────────────────────────────────────────────
  urgentRequestBlockedHours: 48,
  potRequestPendingHours: 48,
  solidarityReviewPendingHours: 72,
  bookingStuckDays: 5,

  // ─── Heroes sur-sollicités ─────────────────────────────────────────
  overusedMissionCount30d: 5,
  overusedHours30d: 10,

  // ─── Heroes sous-utilisés ──────────────────────────────────────────
  underusedNoMissionDays: 30,
  underusedMinPassportCompletion: 0.6, // 60%
  underusedMaxInactiveDays: 60,

  // ─── TIME dormants ─────────────────────────────────────────────────
  dormantTimeBalance: 10,
  strongDormantTimeBalance: 20,
  dormantTimeNoSpendDays: 30,
  strongDormantNoSpendDays: 60,

  // ─── Missions collectives ──────────────────────────────────────────
  collectiveMissionUnderfilledHoursBeforeStart: 72,
  collectiveMissionMinimumFillRate: 0.5,

  // ─── Scores ────────────────────────────────────────────────────────
  healthScore: {
    liquidityWeight: 0.25,
    responseWeight: 0.20,
    reciprocityWeight: 0.20,
    activityWeight: 0.20,
    safetyWeight: 0.15,
  },

  // ─── Overuse score weights ─────────────────────────────────────────
  overuseMissionWeight: 10,
  overuseHoursWeight: 5,
  overusePendingWeight: 10,
} as const;
