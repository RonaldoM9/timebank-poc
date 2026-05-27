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
          <h1 className="text-2xl font-anton tracking-wide text-[#f5f5f5]">
            {name}
          </h1>
          {isHero && hasRatings && (
            <span className="inline-flex items-center gap-1 text-xs font-bangers tracking-wider text-[#00d4aa] bg-[#00d4aa]/5 rounded-full px-3 py-1 whitespace-nowrap">
              <Sparkles className="w-3 h-3" />
              HÉROS DU QUOTIDIEN
            </span>
          )}
          {!hasRatings && (
            <span className="inline-flex items-center gap-1 text-xs font-bangers tracking-wider text-[#a3a3a3] bg-[#222] rounded-full px-3 py-1 whitespace-nowrap">
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
                <span className="text-[#f5f5f5] font-medium">
                  {reputation.toFixed(1)}
                </span>
                <span className="text-[#5c5c5c]">/ 5</span>
                <span className="text-[#5c5c5c]">
                  — {ratingsCount} avis
                </span>
              </>
            ) : (
              <span className="text-[#5c5c5c] italic">
                Aucun avis pour le moment
              </span>
            )}
          </div>
        </div>

        {/* Date + Wallet */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#5c5c5c]">
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
