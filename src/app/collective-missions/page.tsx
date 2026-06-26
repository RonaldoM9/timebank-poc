import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCollectiveMissions } from "@/lib/collective-missions";
import {
  getMissionStatusLabel,
  getMissionStatusColor,
  getCollectiveMissionTypeLabel,
  getFundingSourceLabel,
} from "@/lib/collective-mission-labels";
import ConnectedHeader from "@/components/ConnectedHeader";
import EmptyState from "@/components/EmptyState";
import CollectiveMissionsFilter from "./CollectiveMissionsFilter";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  Sparkles,
  HeartHandshake,
} from "lucide-react";

export const metadata = {
  title: "Missions collectives — TimeHeroes",
  description:
    "Découvrez les missions collectives TimeHeroes : participez à des actions communes et gagnez des TIME.",
};

export default async function CollectiveMissionsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);

  const type = typeof searchParams?.type === "string" ? searchParams.type : undefined;
  const status = typeof searchParams?.status === "string" ? searchParams.status : undefined;
  const city = typeof searchParams?.city === "string" ? searchParams.city : undefined;
  const solidarity = searchParams?.solidarity === "true" ? true : undefined;

  const filters = { type, status, city, solidarity };
  const missions = await getCollectiveMissions(
    Object.values(filters).some((v) => v !== undefined) ? filters : undefined
  );

  const isEmpty = missions.length === 0;

  return (
    <>
      <ConnectedHeader />

      <main className="max-w-6xl mx-auto px-4 py-12 animate-fade-in-up">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-tb-text-primary font-anton tracking-wide">
              Missions collectives
            </h1>
            <p className="text-sm text-tb-text-secondary mt-1">
              Participe à des actions communes et gagne des TIME
            </p>
          </div>
          <Link
            href="/collective-missions/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tb-accent text-white font-semibold text-sm hover:brightness-90 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            Créer une mission
          </Link>
        </div>

        {/* Filter controls */}
        <div className="mb-8">
          <CollectiveMissionsFilter />
        </div>

        {/* Empty state */}
        {isEmpty && (
          <EmptyState
            icon={<Sparkles />}
            title="Aucune mission collective"
            description={
              Object.values(filters).some((v) => v !== undefined)
                ? "Aucune mission ne correspond à tes filtres. Essaie d'autres critères."
                : "Il n'y a pas encore de mission collective. Sois le premier à en créer une !"
            }
            actionLabel={
              Object.values(filters).some((v) => v !== undefined)
                ? "Voir toutes les missions"
                : "Créer une mission"
            }
            actionHref={
              Object.values(filters).some((v) => v !== undefined)
                ? "/collective-missions"
                : "/collective-missions/new"
            }
          />
        )}

        {/* Mission grid */}
        {!isEmpty && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {missions.map((mission, idx) => {
              const statusColorClass = getMissionStatusColor(mission.status);
              const typeLabel = getCollectiveMissionTypeLabel(mission.type);
              const statusLabel = getMissionStatusLabel(mission.status);
              const fundingLabel = getFundingSourceLabel(mission.fundingSource);

              // Format date for display
              const startDate = mission.startsAt
                ? new Date(mission.startsAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : null;

              const placesLabel =
                mission.maxParticipants > 0
                  ? `${mission.participantCount}/${mission.maxParticipants}`
                  : `${mission.participantCount}`;

              return (
                <Link
                  key={mission.id}
                  href={`/collective-missions/${mission.id}`}
                  className="group block rounded-2xl border border-tb-border bg-tb-surface hover:border-tb-accent/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/5 hover:border-tb-accent/30 overflow-hidden"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  <div className="p-5 flex flex-col gap-3">
                    {/* Top badges row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Type badge */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-tb-accent/10 text-tb-accent text-xs font-medium">
                        {typeLabel}
                      </span>

                      {/* Status badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${statusColorClass}`}
                      >
                        {statusLabel}
                      </span>

                      {/* Funding source badge */}
                      {mission.fundingSource !== "NONE" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium">
                          {fundingLabel}
                        </span>
                      )}

                      {/* Solidarity badge */}
                      {mission.isSolidarity && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-400 text-xs font-medium">
                          <HeartHandshake className="w-3 h-3" />
                          Solidaire
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-tb-text-primary group-hover:text-tb-accent transition-colors leading-snug">
                      {mission.title}
                    </h3>

                    {/* Details */}
                    <div className="flex flex-col gap-1.5 text-xs text-tb-text-secondary">
                      {/* City */}
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-tb-text-muted shrink-0" />
                        <span>{mission.city ?? (mission.online ? "En ligne" : "Non précisé")}</span>
                      </div>

                      {/* Date */}
                      {startDate && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-tb-text-muted shrink-0" />
                          <span>{startDate}</span>
                        </div>
                      )}

                      {/* Duration */}
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-tb-text-muted shrink-0" />
                        <span>
                          {mission.durationHours}h
                          {mission.durationHours > 1 ? "" : ""}
                        </span>
                      </div>

                      {/* Places */}
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-tb-text-muted shrink-0" />
                        <span>
                          {placesLabel} place{mission.maxParticipants > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="pt-2 mt-auto">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-tb-accent group-hover:underline">
                        Voir la mission
                        <span className="text-tb-text-muted group-hover:translate-x-0.5 transition-transform">
                          →
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-tb-border py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-tb-text-muted">
            TimeHeroes — Banque du temps des héros du quotidien.
          </p>
        </div>
      </footer>
    </>
  );
}
