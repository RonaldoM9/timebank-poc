"use client";

import { Calendar, Wallet, Sparkles } from "lucide-react";
import AvatarPlaceholder from "./AvatarPlaceholder";

interface PublicProfileHeaderProps {
  name: string;
  reputation: number;
  ratingsCount: number;
  createdAt: string;
  walletAddressShort: string;
}

export default function PublicProfileHeader({
  name,
  reputation,
  ratingsCount,
  createdAt,
  walletAddressShort,
}: PublicProfileHeaderProps) {
  const joinDate = new Date(createdAt).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const hasRatings = ratingsCount > 0;
  const isHero = reputation >= 4.0;

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
      <AvatarPlaceholder name={name} size="xl" />

      <div className="flex-1 text-center sm:text-left">
        {/* Nom + badge */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
          <h1 className="text-2xl font-anton tracking-wide text-tb-text-primary">
            {name}
          </h1>
          {isHero && hasRatings && (
            <span className="inline-flex items-center gap-1 text-xs font-bangers tracking-wider text-tb-accent bg-tb-accent/5 rounded-full px-3 py-1 whitespace-nowrap">
              <Sparkles className="w-3 h-3" />
              HÉROS DU QUOTIDIEN
            </span>
          )}
          {!hasRatings && (
            <span className="inline-flex items-center gap-1 text-xs font-bangers tracking-wider text-tb-text-secondary bg-tb-surface-elevated rounded-full px-3 py-1 whitespace-nowrap">
              NOUVEAU HÉROS
            </span>
          )}
        </div>

        {/* Réputation */}
        <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
          <div className="flex items-center gap-1">
            {hasRatings ? (
              <>
                <span className="text-yellow-400">⭐</span>
                <span className="text-tb-text-primary font-medium">
                  {reputation.toFixed(1)}
                </span>
                <span className="text-tb-text-muted">/ 5</span>
                <span className="text-tb-text-muted">
                  — {ratingsCount} avis
                </span>
              </>
            ) : (
              <span className="text-tb-text-muted italic">
                Aucun avis pour le moment
              </span>
            )}
          </div>
        </div>

        {/* Date + Wallet */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-tb-text-muted">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Membre depuis {joinDate}</span>
          </div>
          {walletAddressShort && (
            <div className="flex items-center gap-1.5 font-mono">
              <Wallet className="w-3.5 h-3.5" />
              <span>{walletAddressShort}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
