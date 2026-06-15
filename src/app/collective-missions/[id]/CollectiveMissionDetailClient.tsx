"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CollectiveMissionWithParticipants, ParticipantDetail } from "@/lib/collective-missions";
import {
  getMissionStatusLabel,
  getMissionStatusColor,
  getCollectiveMissionTypeLabel,
  getParticipantRoleLabel,
  getParticipantStatusLabel,
  getFundingSourceLabel,
} from "@/lib/collective-mission-labels";
import {
  joinCollectiveMissionAction,
  leaveCollectiveMissionAction,
  validateParticipantAction,
  markParticipantNoShowAction,
  completeCollectiveMissionAction,
  cancelCollectiveMissionAction,
} from "../actions";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  HeartHandshake,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  UserX,
  XCircle,
  LogOut,
  LogIn,
} from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  mission: CollectiveMissionWithParticipants;
  participants: ParticipantDetail[];
  viewer: {
    id: string;
    name: string;
    role: string;
  };
}

// ─── Status consts for readability ─────────────────────────────────────────────

const OPEN_STATUSES = ["OPEN", "FULL"];
const MANAGEMENT_STATUSES = ["OPEN", "FULL", "IN_PROGRESS", "ATTENDANCE_PENDING"];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function CollectiveMissionDetailClient({
  mission,
  participants,
  viewer,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const statusLabel = getMissionStatusLabel(mission.status);
  const statusColor = getMissionStatusColor(mission.status);
  const typeLabel = getCollectiveMissionTypeLabel(mission.type);
  const fundingLabel = getFundingSourceLabel(mission.fundingSource);
  const isOrganizerOrFacilitator =
    mission.organizerId === viewer.id ||
    mission.facilitatorId === viewer.id ||
    viewer.role === "ADMIN" ||
    viewer.role === "FACILITATOR";

  const isViewerParticipant = participants.some(
    (p) => p.userId === viewer.id && p.status === "JOINED"
  );
  const isViewerJoined = mission.userStatus === "JOINED";
  const viewerParticipant = participants.find((p) => p.userId === viewer.id);

  // Date formatting
  const startDate = mission.startsAt
    ? new Date(mission.startsAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const endDate = mission.endsAt
    ? new Date(mission.endsAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const completedDate = mission.completedAt
    ? new Date(mission.completedAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  // ─── Action helpers ───────────────────────────────────────────────────────

  const clearFeedback = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleAction = async (
    actionKey: string,
    actionFn: () => Promise<any>
  ) => {
    clearFeedback();
    setLoadingAction(actionKey);
    try {
      const result = await actionFn();
      if (result.success) {
        setSuccessMessage("Action effectuée avec succès.");
        startTransition(() => {
          router.refresh();
        });
      } else {
        setErrorMessage(result.error ?? "Une erreur est survenue.");
      }
    } catch (e: any) {
      setErrorMessage(e.message ?? "Une erreur est survenue.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleJoin = () =>
    handleAction("join", () => joinCollectiveMissionAction(mission.id));

  const handleLeave = () =>
    handleAction("leave", () => leaveCollectiveMissionAction(mission.id));

  const handleValidate = (participantId: string) =>
    handleAction(`validate-${participantId}`, () =>
      validateParticipantAction(mission.id, participantId)
    );

  const handleNoShow = (participantId: string) =>
    handleAction(`noshow-${participantId}`, () =>
      markParticipantNoShowAction(mission.id, participantId)
    );

  const handleComplete = () =>
    handleAction("complete", () => completeCollectiveMissionAction(mission.id));

  const handleCancel = () =>
    handleAction("cancel", () => cancelCollectiveMissionAction(mission.id));

  // ─── Derived state ────────────────────────────────────────────────────────

  const canJoin =
    !viewerParticipant &&
    OPEN_STATUSES.includes(mission.status) &&
    mission.status !== "CANCELLED";

  const canLeave =
    isViewerJoined && OPEN_STATUSES.includes(mission.status);

  const canManage = isOrganizerOrFacilitator && MANAGEMENT_STATUSES.includes(mission.status);
  const hasValidatedParticipants = participants.some(
    (p) => p.status === "VALIDATED"
  );
  const joinedParticipants = participants.filter(
    (p) => p.status === "JOINED" && p.role !== "ORGANIZER"
  );

  const isCompleteCancelAllowed =
    isOrganizerOrFacilitator &&
    ["OPEN", "FULL", "IN_PROGRESS", "ATTENDANCE_PENDING"].includes(
      mission.status
    );

  const isCompleted = mission.status === "COMPLETED";

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/collective-missions"
        className="inline-flex items-center gap-1.5 text-sm text-tb-text-secondary hover:text-tb-accent transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux missions collectives
      </Link>

      {/* Feedback banners */}
      {successMessage && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto text-emerald-400/70 hover:text-emerald-400"
          >
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-red-400/70 hover:text-red-400"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Header card ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-tb-border bg-tb-surface p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Type badge */}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-tb-accent/10 text-tb-accent text-xs font-medium">
                {typeLabel}
              </span>

              {/* Status badge */}
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${statusColor}`}
              >
                {statusLabel}
              </span>

              {/* Solidarity badge */}
              {mission.isSolidarity && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-pink-500/10 text-pink-400 text-xs font-medium">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  Solidaire
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-tb-text-primary font-anton tracking-wide">
              {mission.title}
            </h1>

            <p className="text-sm text-tb-text-muted">
              Organisée par <span className="font-medium text-tb-text-secondary">{mission.organizerName}</span>
            </p>
          </div>

          {/* CTA buttons in header */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            {canJoin && (
              <button
                onClick={handleJoin}
                disabled={loadingAction === "join"}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-tb-accent text-white font-semibold text-sm hover:brightness-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingAction === "join" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                Rejoindre
              </button>
            )}

            {canLeave && (
              <button
                onClick={handleLeave}
                disabled={loadingAction === "leave"}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-tb-border bg-tb-surface text-tb-text-secondary font-semibold text-sm hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingAction === "leave" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                Quitter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Description ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-tb-border bg-tb-surface p-6">
        <h2 className="text-base font-semibold text-tb-text-primary mb-3">
          Description
        </h2>
        <p className="text-sm text-tb-text-secondary leading-relaxed whitespace-pre-wrap">
          {mission.description}
        </p>
      </div>

      {/* ── Info grid ───────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-tb-border bg-tb-surface p-6">
        <h2 className="text-base font-semibold text-tb-text-primary mb-4">
          Informations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* City / Department */}
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-tb-text-muted shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-tb-text-muted">Lieu</p>
              <p className="text-sm text-tb-text-primary">
                {mission.online
                  ? "En ligne"
                  : mission.city
                  ? `${mission.city}${mission.department ? ` (${mission.department})` : ""}`
                  : mission.department ?? "Non précisé"}
              </p>
              {mission.locationLabel && (
                <p className="text-xs text-tb-text-muted mt-0.5">
                  {mission.locationLabel}
                </p>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-tb-text-muted shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-tb-text-muted">Date</p>
              <p className="text-sm text-tb-text-primary">
                {startDate ?? "À définir"}
              </p>
              {endDate && (
                <p className="text-xs text-tb-text-muted mt-0.5">
                  au {endDate}
                </p>
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-tb-text-muted shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-tb-text-muted">Durée</p>
              <p className="text-sm text-tb-text-primary">
                {mission.durationHours}h
                {mission.durationHours > 1 ? "" : ""}
              </p>
            </div>
          </div>

          {/* Participants count */}
          <div className="flex items-start gap-2.5">
            <Users className="w-4 h-4 text-tb-text-muted shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-tb-text-muted">Participants</p>
              <p className="text-sm text-tb-text-primary">
                {mission.participantCount}/{mission.maxParticipants}
                {mission.minParticipants > 1 &&
                  ` (min. ${mission.minParticipants})`}
              </p>
            </div>
          </div>

          {/* Funding source */}
          <div className="flex items-start gap-2.5">
            <Banknote className="w-4 h-4 text-tb-text-muted shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-tb-text-muted">Financement</p>
              <p className="text-sm text-tb-text-primary">{fundingLabel}</p>
              {mission.fundingSource !== "NONE" &&
                mission.communityPotAmount > 0 && (
                  <p className="text-xs text-tb-text-muted mt-0.5">
                    {mission.communityPotAmount} TIME
                  </p>
                )}
            </div>
          </div>

          {/* Solidarity details */}
          {mission.isSolidarity && mission.solidarityCategory && (
            <div className="flex items-start gap-2.5">
              <HeartHandshake className="w-4 h-4 text-tb-text-muted shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-tb-text-muted">Mission solidaire</p>
                <p className="text-sm text-tb-text-primary">
                  {mission.solidarityCategory}
                </p>
                {mission.solidarityReason && (
                  <p className="text-xs text-tb-text-muted mt-0.5">
                    {mission.solidarityReason}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Participants section ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-tb-border bg-tb-surface p-6">
        <h2 className="text-base font-semibold text-tb-text-primary mb-4">
          Participants ({participants.length})
        </h2>

        {participants.length === 0 ? (
          <p className="text-sm text-tb-text-muted">
            Aucun participant pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tb-border">
                  <th className="text-left py-2.5 pr-4 text-xs font-medium text-tb-text-muted">
                    Nom
                  </th>
                  <th className="text-left py-2.5 pr-4 text-xs font-medium text-tb-text-muted">
                    Rôle
                  </th>
                  <th className="text-left py-2.5 pr-4 text-xs font-medium text-tb-text-muted">
                    Statut
                  </th>
                  {canManage && (
                    <th className="text-right py-2.5 text-xs font-medium text-tb-text-muted">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-tb-border last:border-0"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-tb-accent/10 text-tb-accent text-xs font-semibold flex items-center justify-center shrink-0">
                          {p.userName.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-tb-text-primary font-medium">
                          {p.userName}
                          {p.userId === viewer.id && (
                            <span className="ml-1.5 text-xs text-tb-text-muted">
                              (toi)
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-tb-text-secondary">
                        {getParticipantRoleLabel(p.role)}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-xs font-medium ${
                          p.status === "VALIDATED"
                            ? "text-emerald-400"
                            : p.status === "NO_SHOW"
                            ? "text-red-400"
                            : p.status === "CANCELLED"
                            ? "text-gray-400"
                            : "text-blue-400"
                        }`}
                      >
                        {getParticipantStatusLabel(p.status)}
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Management actions for JOINED participants (not the organizer) */}
                          {p.status === "JOINED" && p.role !== "ORGANIZER" && (
                            <>
                              <button
                                onClick={() => handleValidate(p.id)}
                                disabled={
                                  loadingAction === `validate-${p.id}`
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loadingAction === `validate-${p.id}` ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <UserCheck className="w-3 h-3" />
                                )}
                                Valider présence
                              </button>
                              <button
                                onClick={() => handleNoShow(p.id)}
                                disabled={
                                  loadingAction === `noshow-${p.id}`
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loadingAction === `noshow-${p.id}` ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <UserX className="w-3 h-3" />
                                )}
                                Absent
                              </button>
                            </>
                          )}

                          {/* Already validated / no-show — show label instead */}
                          {p.status === "VALIDATED" && (
                            <span className="text-xs text-emerald-400 font-medium">
                              Présence validée
                              {p.timeReward != null && ` (${p.timeReward}h)`}
                            </span>
                          )}
                          {p.status === "NO_SHOW" && (
                            <span className="text-xs text-red-400 font-medium">
                              Absent
                            </span>
                          )}
                          {p.status === "CANCELLED" && (
                            <span className="text-xs text-gray-400 font-medium">
                              Annulé
                            </span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Viewer's own status info */}
        {viewerParticipant && viewerParticipant.status === "VALIDATED" && (
          <div className="mt-3 pt-3 border-t border-tb-border">
            <p className="text-xs text-emerald-400 font-medium">
              ✅ Ta présence a été validée
              {viewerParticipant.hoursValidated != null &&
                ` (${viewerParticipant.hoursValidated}h)`}
              {viewerParticipant.timeReward != null &&
                ` — ${viewerParticipant.timeReward} TIME reçus`}
            </p>
          </div>
        )}
      </div>

      {/* ── Organizer/Facilitator actions ──────────────────────────────────── */}
      {canManage && (
        <div className="rounded-2xl border border-tb-border bg-tb-surface p-6">
          <h2 className="text-base font-semibold text-tb-text-primary mb-4">
            Gestion de la mission
          </h2>
          <div className="flex flex-wrap gap-3">
            {/* "Compléter la mission" — shown when at least one participant is VALIDATED */}
            {hasValidatedParticipants && isCompleteCancelAllowed && (
              <button
                onClick={handleComplete}
                disabled={loadingAction === "complete"}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingAction === "complete" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Compléter la mission
              </button>
            )}

            {/* "Annuler la mission" */}
            {isCompleteCancelAllowed && (
              <button
                onClick={handleCancel}
                disabled={loadingAction === "cancel"}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingAction === "cancel" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Annuler la mission
              </button>
            )}

            {!hasValidatedParticipants && (
              <p className="text-xs text-tb-text-muted self-center">
                Valide au moins un participant pour pouvoir compléter la mission.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── History section (COMPLETED missions) ────────────────────────────── */}
      {isCompleted && (
        <div className="rounded-2xl border border-tb-border bg-tb-surface p-6">
          <h2 className="text-base font-semibold text-tb-text-primary mb-4">
            Mission terminée
          </h2>

          {completedDate && (
            <p className="text-sm text-tb-text-muted mb-4">
              Terminée le {completedDate}
            </p>
          )}

          <h3 className="text-sm font-medium text-tb-text-primary mb-3">
            Récompenses TIME par participant
          </h3>

          {participants.filter((p) => p.timeReward != null).length === 0 ? (
            <p className="text-sm text-tb-text-muted">
              Aucune récompense distribuée.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-tb-border">
                    <th className="text-left py-2.5 pr-4 text-xs font-medium text-tb-text-muted">
                      Participant
                    </th>
                    <th className="text-left py-2.5 pr-4 text-xs font-medium text-tb-text-muted">
                      Rôle
                    </th>
                    <th className="text-left py-2.5 pr-4 text-xs font-medium text-tb-text-muted">
                      Statut
                    </th>
                    <th className="text-right py-2.5 text-xs font-medium text-tb-text-muted">
                      TIME reçus
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participants
                    .filter((p) => p.status === "VALIDATED" || p.timeReward != null)
                    .map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-tb-border last:border-0"
                      >
                        <td className="py-3 pr-4">
                          <span className="text-tb-text-primary font-medium">
                            {p.userName}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-tb-text-secondary">
                            {getParticipantRoleLabel(p.role)}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs text-emerald-400 font-medium">
                            {getParticipantStatusLabel(p.status)}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="text-tb-accent font-semibold">
                            {p.timeReward != null ? `${p.timeReward} TIME` : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Cancelled info */}
      {mission.status === "CANCELLED" && mission.cancelledAt && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <p className="text-sm text-red-400 font-medium">
              Mission annulée le{" "}
              {new Date(mission.cancelledAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
