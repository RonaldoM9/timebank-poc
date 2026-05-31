"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Repeat,
  ArrowLeft,
} from "lucide-react";
import ConnectedHeader from "@/components/ConnectedHeader";
import EmptyState from "@/components/EmptyState";
import type { AvailabilitySlotItem } from "./actions";
import {
  createRecurringSlot,
  createOneOffSlot,
  toggleSlot,
  deleteSlot,
} from "./actions";

// ─── Helpers ────────────────────────────────────────────────────────────

const DAY_LABELS: Record<number, string> = {
  1: "Lun",
  2: "Mar",
  3: "Mer",
  4: "Jeu",
  5: "Ven",
  6: "Sam",
  7: "Dim",
};

function formatSlot(slot: AvailabilitySlotItem): string {
  if (slot.type === "RECURRING" && slot.dayOfWeek && slot.startTime && slot.endTime) {
    return `${DAY_LABELS[slot.dayOfWeek] ?? "?"} ${slot.startTime.slice(0, 5)}–${slot.endTime.slice(0, 5)}`;
  }
  if (slot.type === "ONE_OFF" && slot.startAt && slot.endAt) {
    const start = new Date(slot.startAt);
    const end = new Date(slot.endAt);
    const dateStr = start.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const startStr = start.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endStr = end.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} ${startStr}–${endStr}`;
  }
  return "Créneau inconnu";
}

// ─── Component ──────────────────────────────────────────────────────────

export default function AvailabilityClient({
  initialSlots,
}: {
  initialSlots: AvailabilitySlotItem[];
}) {
  const router = useRouter();
  const [slots, setSlots] = useState<AvailabilitySlotItem[]>(initialSlots);
  const [activeTab, setActiveTab] = useState<"recurring" | "oneoff">("recurring");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  // ── Recurring form state ──────────────────────────────────────────────

  const [recDay, setRecDay] = useState("1");
  const [recStart, setRecStart] = useState("09:00");
  const [recEnd, setRecEnd] = useState("18:00");
  const [recErrors, setRecErrors] = useState<Record<string, string[]>>({});
  const [recSubmitting, setRecSubmitting] = useState(false);

  async function handleCreateRecurring(e: React.FormEvent) {
    e.preventDefault();
    setRecSubmitting(true);
    setRecErrors({});
    setError(null);

    const fd = new FormData();
    fd.set("type", "RECURRING");
    fd.set("dayOfWeek", recDay);
    fd.set("startTime", recStart);
    fd.set("endTime", recEnd);

    const result = await createRecurringSlot(fd);
    setRecSubmitting(false);

    if ("errors" in result && result.errors) {
      setRecErrors(result.errors as Record<string, string[]>);
      return;
    }
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    setRecDay("1");
    setRecStart("09:00");
    setRecEnd("18:00");
    refresh();
  }

  // ── One-off form state ────────────────────────────────────────────────

  const [oneOffStart, setOneOffStart] = useState("");
  const [oneOffEnd, setOneOffEnd] = useState("");
  const [oneOffErrors, setOneOffErrors] = useState<Record<string, string[]>>({});
  const [oneOffSubmitting, setOneOffSubmitting] = useState(false);

  async function handleCreateOneOff(e: React.FormEvent) {
    e.preventDefault();
    setOneOffSubmitting(true);
    setOneOffErrors({});
    setError(null);

    const fd = new FormData();
    fd.set("type", "ONE_OFF");
    fd.set("startAt", oneOffStart);
    fd.set("endAt", oneOffEnd);

    const result = await createOneOffSlot(fd);
    setOneOffSubmitting(false);

    if ("errors" in result && result.errors) {
      setOneOffErrors(result.errors as Record<string, string[]>);
      return;
    }
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    setOneOffStart("");
    setOneOffEnd("");
    refresh();
  }

  // ── Toggle / Delete ───────────────────────────────────────────────────

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleToggle(slotId: string) {
    setTogglingId(slotId);
    setError(null);
    const result = await toggleSlot(slotId);
    setTogglingId(null);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    refresh();
  }

  async function handleDelete(slotId: string) {
    if (!confirm("Supprimer ce créneau définitivement ?")) return;
    setDeletingId(slotId);
    setError(null);
    const result = await deleteSlot(slotId);
    setDeletingId(null);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    refresh();
  }

  // ── Slot lists ────────────────────────────────────────────────────────

  const recurringSlots = slots.filter((s) => s.type === "RECURRING");
  const oneOffSlots = slots.filter((s) => s.type === "ONE_OFF");
  const hasAnySlots = slots.length > 0;

  // ── Empty state ───────────────────────────────────────────────────────

  if (!hasAnySlots) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <ConnectedHeader />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={<Calendar />}
            title="Aucune disponibilité"
            description="Ajoute tes premiers créneaux pour permettre aux autres Heroes de réserver tes missions."
            actionLabel="Ajouter un créneau"
            actionHref="#"
          />
        </div>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <ConnectedHeader />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-anton tracking-wide text-[#f5f5f5] mb-1">
              Disponibilités
            </h1>
            <p className="text-[#a3a3a3] text-sm">
              {recurringSlots.length} récurrent
              {recurringSlots.length > 1 ? "s" : ""}
              {" — "}
              {oneOffSlots.length} ponctuel
              {oneOffSlots.length > 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 bg-[#181818] hover:bg-[#222] border border-[#262626] rounded-xl px-4 py-2 text-xs text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-900/20 border border-red-800/40 rounded-2xl px-5 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#262626] pb-2">
          <button
            onClick={() => setActiveTab("recurring")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "recurring"
                ? "bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30"
                : "text-[#a3a3a3] hover:text-[#f5f5f5] border border-transparent"
            }`}
          >
            <Repeat className="w-4 h-4" />
            Créneaux récurrents
          </button>
          <button
            onClick={() => setActiveTab("oneoff")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "oneoff"
                ? "bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30"
                : "text-[#a3a3a3] hover:text-[#f5f5f5] border border-transparent"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Créneaux ponctuels
          </button>
        </div>

        {/* Recurring form */}
        {activeTab === "recurring" && (
          <section className="bg-[#111111] border border-[#262626] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#f5f5f5] mb-4">
              Ajouter un créneau récurrent
            </h2>
            <form onSubmit={handleCreateRecurring} className="space-y-4">
              <div>
                <label className="block text-sm text-[#a3a3a3] mb-1">Jour</label>
                <select
                  value={recDay}
                  onChange={(e) => setRecDay(e.target.value)}
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#00d4aa]/50 transition-colors"
                >
                  <option value="1">Lundi</option>
                  <option value="2">Mardi</option>
                  <option value="3">Mercredi</option>
                  <option value="4">Jeudi</option>
                  <option value="5">Vendredi</option>
                  <option value="6">Samedi</option>
                  <option value="7">Dimanche</option>
                </select>
                {recErrors.dayOfWeek && (
                  <p className="text-red-400 text-xs mt-1">{recErrors.dayOfWeek[0]}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#a3a3a3] mb-1">Début</label>
                  <input
                    type="time"
                    value={recStart}
                    onChange={(e) => setRecStart(e.target.value)}
                    className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#00d4aa]/50 transition-colors"
                  />
                  {recErrors.startTime && (
                    <p className="text-red-400 text-xs mt-1">{recErrors.startTime[0]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#a3a3a3] mb-1">Fin</label>
                  <input
                    type="time"
                    value={recEnd}
                    onChange={(e) => setRecEnd(e.target.value)}
                    className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#00d4aa]/50 transition-colors"
                  />
                  {recErrors.endTime && (
                    <p className="text-red-400 text-xs mt-1">{recErrors.endTime[0]}</p>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={recSubmitting}
                className="inline-flex items-center gap-2 bg-[#00d4aa] hover:bg-[#00b894] text-black font-bold rounded-xl px-5 py-3 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {recSubmitting ? "Création…" : "Ajouter le créneau"}
              </button>
            </form>
          </section>
        )}

        {/* One-off form */}
        {activeTab === "oneoff" && (
          <section className="bg-[#111111] border border-[#262626] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#f5f5f5] mb-4">
              Ajouter un créneau ponctuel
            </h2>
            <form onSubmit={handleCreateOneOff} className="space-y-4">
              <div>
                <label className="block text-sm text-[#a3a3a3] mb-1">
                  Date et heure de début
                </label>
                <input
                  type="datetime-local"
                  value={oneOffStart}
                  onChange={(e) => setOneOffStart(e.target.value)}
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#00d4aa]/50 transition-colors"
                />
                {oneOffErrors.startAt && (
                  <p className="text-red-400 text-xs mt-1">{oneOffErrors.startAt[0]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-[#a3a3a3] mb-1">
                  Date et heure de fin
                </label>
                <input
                  type="datetime-local"
                  value={oneOffEnd}
                  onChange={(e) => setOneOffEnd(e.target.value)}
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#00d4aa]/50 transition-colors"
                />
                {oneOffErrors.endAt && (
                  <p className="text-red-400 text-xs mt-1">{oneOffErrors.endAt[0]}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={oneOffSubmitting}
                className="inline-flex items-center gap-2 bg-[#00d4aa] hover:bg-[#00b894] text-black font-bold rounded-xl px-5 py-3 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {oneOffSubmitting ? "Création…" : "Ajouter le créneau"}
              </button>
            </form>
          </section>
        )}

        {/* Recurring slots list */}
        {recurringSlots.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-[#f5f5f5] mb-4">
              Créneaux récurrents ({recurringSlots.length})
            </h2>
            <div className="space-y-3">
              {recurringSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-[#111111] border border-[#262626] rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-[#333] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Repeat className="w-5 h-5 text-[#5c5c5c] shrink-0" />
                    <div>
                      <span
                        className={`font-medium text-sm ${
                          slot.isActive ? "text-[#f5f5f5]" : "text-[#5c5c5c] line-through"
                        }`}
                      >
                        {formatSlot(slot)}
                      </span>
                      <span
                        className={`ml-3 text-xs font-bangers tracking-wider px-2 py-0.5 rounded-full ${
                          slot.isActive
                            ? "bg-[#00d4aa]/10 text-[#00d4aa]"
                            : "bg-[#5c5c5c]/10 text-[#5c5c5c]"
                        }`}
                      >
                        {slot.isActive ? "ACTIF" : "INACTIF"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(slot.id)}
                      disabled={togglingId === slot.id}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-colors disabled:opacity-50 ${
                        slot.isActive
                          ? "bg-amber-900/20 hover:bg-amber-900/30 text-amber-400 border border-amber-800/50"
                          : "bg-[#00d4aa]/10 hover:bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30"
                      }`}
                      title={slot.isActive ? "Désactiver" : "Activer"}
                    >
                      {slot.isActive ? (
                        <ToggleLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ToggleRight className="w-3.5 h-3.5" />
                      )}
                      {slot.isActive ? "Désactiver" : "Activer"}
                    </button>
                    <button
                      onClick={() => handleDelete(slot.id)}
                      disabled={deletingId === slot.id}
                      className="inline-flex items-center justify-center gap-1.5 bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-800/50 rounded-xl px-3 py-2 text-xs transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* One-off slots list */}
        {oneOffSlots.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-[#f5f5f5] mb-4">
              Créneaux ponctuels ({oneOffSlots.length})
            </h2>
            <div className="space-y-3">
              {oneOffSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-[#111111] border border-[#262626] rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-[#333] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Calendar className="w-5 h-5 text-[#5c5c5c] shrink-0" />
                    <div>
                      <span
                        className={`font-medium text-sm ${
                          slot.isActive ? "text-[#f5f5f5]" : "text-[#5c5c5c] line-through"
                        }`}
                      >
                        {formatSlot(slot)}
                      </span>
                      <span
                        className={`ml-3 text-xs font-bangers tracking-wider px-2 py-0.5 rounded-full ${
                          slot.isActive
                            ? "bg-[#00d4aa]/10 text-[#00d4aa]"
                            : "bg-[#5c5c5c]/10 text-[#5c5c5c]"
                        }`}
                      >
                        {slot.isActive ? "ACTIF" : "INACTIF"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(slot.id)}
                      disabled={togglingId === slot.id}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-colors disabled:opacity-50 ${
                        slot.isActive
                          ? "bg-amber-900/20 hover:bg-amber-900/30 text-amber-400 border border-amber-800/50"
                          : "bg-[#00d4aa]/10 hover:bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30"
                      }`}
                      title={slot.isActive ? "Désactiver" : "Activer"}
                    >
                      {slot.isActive ? (
                        <ToggleLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ToggleRight className="w-3.5 h-3.5" />
                      )}
                      {slot.isActive ? "Désactiver" : "Activer"}
                    </button>
                    <button
                      onClick={() => handleDelete(slot.id)}
                      disabled={deletingId === slot.id}
                      className="inline-flex items-center justify-center gap-1.5 bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-800/50 rounded-xl px-3 py-2 text-xs transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Absence of one type but empty */}
        {!hasAnySlots && activeTab === "recurring" && (
          <section>
            <h2 className="text-lg font-semibold text-[#f5f5f5] mb-4">
              Créneaux récurrents
            </h2>
            <div className="text-center py-10 bg-[#111111] border border-[#262626] rounded-2xl">
              <Repeat className="w-8 h-8 text-[#5c5c5c] mx-auto mb-3" />
              <p className="text-[#a3a3a3] text-sm">
                Aucun créneau récurrent pour le moment.
              </p>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="text-center pt-4">
          <span className="font-bangers text-[#00d4aa] text-xs tracking-wider opacity-40">
            ~ sois disponible quand les autres ont besoin de toi ~
          </span>
        </div>
      </main>
    </div>
  );
}
