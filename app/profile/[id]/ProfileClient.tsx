"use client";

import Link from "next/link";
import { ArrowLeft, Clock, MapPin, ShieldQuestion, Sparkles, Shield, Award, Zap } from "lucide-react";
import type { PublicProfile } from "@/lib/profile";
import type { HeroLevel } from "@/lib/gamification";
import PublicProfileHeader from "@/components/PublicProfileHeader";
import ProfileImpactCards from "@/components/ProfileImpactCards";
import PublicServiceCard from "@/components/PublicServiceCard";
import PublicRatingCard from "@/components/PublicRatingCard";
import HeroLevelBadge from "@/components/HeroLevelBadge";

interface TopBadge {
  code: string;
  name: string;
  icon: string;
}

export default function ProfileClient({
  profile,
  heroLevel,
  totalXp,
  topBadges,
}: {
  profile: PublicProfile;
  heroLevel: HeroLevel;
  totalXp: number;
  topBadges: TopBadge[];
}) {
  const hasServices = profile.activeServices.length > 0;
  const hasRatings = profile.recentRatings.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#262626]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#00d4aa]" />
            <span className="font-anton text-lg tracking-wide text-[#f5f5f5]">
              TimeHeroes
            </span>
          </div>
          <Link
            href="/services"
            className="flex items-center gap-1.5 text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux services
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Section Hero — Header profil */}
        <section>
          <PublicProfileHeader
            name={profile.name}
            reputation={profile.reputation}
            ratingsCount={profile.ratingsCount}
            createdAt={profile.createdAt}
            walletAddressShort={profile.walletAddressShort}
          />
        </section>

        {/* Section Hero Level */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-[#00d4aa]" />
            <h2 className="text-lg font-anton tracking-wide text-[#f5f5f5]">
              Niveau Hero
            </h2>
          </div>
          <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <HeroLevelBadge level={heroLevel} />
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-[#a3a3a3] font-medium">XP Totale</p>
                  <p className="text-xl font-anton tracking-wide text-[#00d4aa]">
                    {totalXp}
                  </p>
                </div>
                {topBadges.length > 0 && (
                  <div className="hidden sm:flex items-center gap-2 border-l border-[#262626] pl-4">
                    {topBadges.slice(0, 3).map((badge) => (
                      <div
                        key={badge.code}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/20"
                        title={badge.name}
                      >
                        <Award className="h-4 w-4 text-[#00d4aa]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Mobile badges */}
            {topBadges.length > 0 && (
              <div className="flex items-center gap-2 mt-3 sm:hidden">
                <Zap className="w-3 h-3 text-[#5c5c5c]" />
                <span className="text-[11px] text-[#a3a3a3]">
                  Badges&nbsp;: {topBadges.map((b) => b.name).join(", ")}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Section Impact — KPIs */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#00d4aa]" />
            <h2 className="text-lg font-anton tracking-wide text-[#f5f5f5]">
              Impact dans la communauté
            </h2>
          </div>
          <ProfileImpactCards
            reputation={profile.reputation}
            activeServicesCount={profile.activeServicesCount}
            missionsCompleted={profile.missionsCompleted}
            totalTimeEarned={profile.totalTimeEarned}
            ratingsCount={profile.ratingsCount}
          />
        </section>

        {/* Section Zone d'intervention */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-[#00d4aa]" />
            <h2 className="text-lg font-anton tracking-wide text-[#f5f5f5]">
              Zone d&apos;intervention
            </h2>
          </div>
          <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
            {(() => {
              const vis = profile.locationVisibility;
              const city = profile.city;
              const dept = profile.department;
              const region = profile.region;

              if (vis === "hidden") {
                return (
                  <p className="text-sm text-[#5c5c5c] italic">
                    Zone non affichée
                  </p>
                );
              }

              if (vis === "city" && city) {
                return (
                  <div>
                    <p className="text-sm text-[#d4d4d4] font-medium">
                      {city}
                      {dept ? `, ${dept}` : ""}
                    </p>
                    {profile.serviceRadiusKm && (
                      <p className="text-xs text-[#a3a3a3] mt-1">
                        Intervient dans un rayon de {profile.serviceRadiusKm} km
                      </p>
                    )}
                  </div>
                );
              }

              if (vis === "department" && dept) {
                return (
                  <p className="text-sm text-[#d4d4d4] font-medium">
                    Zone : {dept}
                  </p>
                );
              }

              if (vis === "region" && region) {
                return (
                  <p className="text-sm text-[#d4d4d4] font-medium">
                    Zone : {region}
                  </p>
                );
              }

              return (
                <p className="text-sm text-[#5c5c5c] italic">
                  Aucune zone renseignée
                </p>
              );
            })()}
            {profile.availableOnline && (
              <p className="text-xs text-[#00d4aa] mt-2 font-medium">
                ✅ Disponible aussi en ligne
              </p>
            )}
          </div>
        </section>

        {/* Section Bio */}
        <section>
          <h2 className="text-lg font-anton tracking-wide text-[#f5f5f5] mb-3">
            À propos
          </h2>
          <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
            {profile.bio ? (
              <p className="text-sm text-[#d4d4d4] leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm text-[#5c5c5c] italic">
                Ce héros n&apos;a pas encore renseigné sa bio.
              </p>
            )}
          </div>
        </section>

        {/* Section Services actifs */}
        <section>
          <h2 className="text-lg font-anton tracking-wide text-[#f5f5f5] mb-3">
            Super-pouvoirs proposés
          </h2>
          {hasServices ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.activeServices.map((service) => (
                <PublicServiceCard
                  key={service.id}
                  id={service.id}
                  title={service.title}
                  description={service.description}
                  category={service.category}
                  ratePerHour={service.ratePerHour}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8 text-center">
              <ShieldQuestion className="w-10 h-10 text-[#5c5c5c] mx-auto mb-2" />
              <p className="text-sm text-[#5c5c5c] italic">
                Ce héros n&apos;a pas encore de service actif.
              </p>
            </div>
          )}
        </section>

        {/* Section Avis reçus */}
        <section>
          <h2 className="text-lg font-anton tracking-wide text-[#f5f5f5] mb-3">
            Avis de la communauté
          </h2>
          {hasRatings ? (
            <div className="space-y-3">
              {profile.recentRatings.map((rating) => (
                <PublicRatingCard
                  key={rating.id}
                  score={rating.score}
                  comment={rating.comment}
                  createdAt={rating.createdAt}
                  clientName={rating.clientName}
                  clientId={rating.clientId}
                  serviceTitle={rating.serviceTitle}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8 text-center">
              <Sparkles className="w-10 h-10 text-[#5c5c5c] mx-auto mb-2" />
              <p className="text-sm text-[#5c5c5c] italic">
                Aucun avis pour le moment.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
