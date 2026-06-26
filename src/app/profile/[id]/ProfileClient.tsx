"use client";

import Link from "next/link";
import { ArrowLeft, Clock, MapPin, ShieldQuestion, Sparkles, Shield, Award, Zap, HeartHandshake, BookOpen, Target, BadgeCheck } from "lucide-react";
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
    <div className="min-h-screen bg-tb-surface-elevated animate-fade-in-up">
      {/* Header */}
      <header className="border-b border-tb-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-tb-accent" />
            <span className="font-anton text-lg tracking-wide text-tb-text-primary">
              TimeHeroes
            </span>
          </div>
          <Link
            href="/services"
            className="flex items-center gap-1.5 text-tb-text-secondary hover:text-tb-text-primary transition-colors text-sm"
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
            <Shield className="w-5 h-5 text-tb-accent" />
            <h2 className="text-lg font-anton tracking-wide text-tb-text-primary">
              Niveau Hero
            </h2>
          </div>
          <div className="bg-tb-surface border border-tb-border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/5 hover:border-tb-accent/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <HeroLevelBadge level={heroLevel} />
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-tb-text-secondary font-medium">XP Totale</p>
                  <p className="text-xl font-anton tracking-wide text-tb-accent">
                    {totalXp}
                  </p>
                </div>
                {topBadges.length > 0 && (
                  <div className="hidden sm:flex items-center gap-2 border-l border-tb-border pl-4">
                    {topBadges.slice(0, 3).map((badge) => (
                      <div
                        key={badge.code}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-tb-accent/10 border border-tb-accent/20"
                        title={badge.name}
                      >
                        <Award className="h-4 w-4 text-tb-accent" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Mobile badges */}
            {topBadges.length > 0 && (
              <div className="flex items-center gap-2 mt-3 sm:hidden">
                <Zap className="w-3 h-3 text-tb-text-muted" />
                <span className="text-[11px] text-tb-text-secondary">
                  Badges&nbsp;: {topBadges.map((b) => b.name).join(", ")}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Section Trust Badges */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BadgeCheck className="w-5 h-5 text-tb-accent" />
            <h2 className="text-lg font-anton tracking-wide text-tb-text-primary">
              Badges de confiance
            </h2>
          </div>
          <div className="bg-tb-surface border border-tb-border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/5 hover:border-tb-accent/30">
            <div className="flex flex-wrap gap-3">
              {[
                { key: "localHero" as const, label: "Héros local", desc: "Localisation renseignée", color: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
                { key: "firstMission" as const, label: "Première mission", desc: "Mission accomplie", color: "border-tb-accent/30 bg-tb-accent/10 text-tb-accent" },
                { key: "reliable" as const, label: "Héros fiable", desc: "Note positive", color: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" },
                { key: "profileComplete" as const, label: "Profil complété", desc: "Passport ≥ 80 %", color: "border-purple-500/30 bg-purple-500/10 text-purple-400" },
              ].map((b) => {
                const earned = profile.badges[b.key];
                return (
                  <div
                    key={b.key}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-opacity ${
                      earned
                        ? `${b.color} opacity-100`
                        : "border-[#e5e7eb] bg-transparent text-tb-text-muted opacity-50"
                    }`}
                  >
                    <span className={earned ? "" : "grayscale"}>
                      {b.key === "localHero" ? "📍" : b.key === "firstMission" ? "🚀" : b.key === "reliable" ? "⭐" : "✅"}
                    </span>
                    <span>{b.label}</span>
                    {!earned && (
                      <span className="text-[10px] text-tb-text-muted ml-1">— à débloquer</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section Impact — KPIs */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-tb-accent" />
            <h2 className="text-lg font-anton tracking-wide text-tb-text-primary">
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
            <MapPin className="w-5 h-5 text-tb-accent" />
            <h2 className="text-lg font-anton tracking-wide text-tb-text-primary">
              Zone d&apos;intervention
            </h2>
          </div>
          <div className="bg-tb-surface border border-tb-border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/5 hover:border-tb-accent/30">
            {(() => {
              const vis = profile.locationVisibility;
              const city = profile.city;
              const dept = profile.department;
              const region = profile.region;

              if (vis === "hidden") {
                return (
                  <p className="text-sm text-tb-text-muted italic">
                    Zone non affichée
                  </p>
                );
              }

              if (vis === "city" && city) {
                return (
                  <div>
                    <p className="text-sm text-tb-text-primary font-medium">
                      {city}
                      {dept ? `, ${dept}` : ""}
                    </p>
                    {profile.serviceRadiusKm && (
                      <p className="text-xs text-tb-text-secondary mt-1">
                        Intervient dans un rayon de {profile.serviceRadiusKm} km
                      </p>
                    )}
                  </div>
                );
              }

              if (vis === "department" && dept) {
                return (
                  <p className="text-sm text-tb-text-primary font-medium">
                    Zone : {dept}
                  </p>
                );
              }

              if (vis === "region" && region) {
                return (
                  <p className="text-sm text-tb-text-primary font-medium">
                    Zone : {region}
                  </p>
                );
              }

              return (
                <p className="text-sm text-tb-text-muted italic">
                  Aucune zone renseignée
                </p>
              );
            })()}
            {profile.availableOnline && (
              <p className="text-xs text-tb-accent mt-2 font-medium">
                ✅ Disponible aussi en ligne
              </p>
            )}
          </div>
        </section>

        {/* Section Bio */}
        <section>
          <h2 className="text-lg font-anton tracking-wide text-tb-text-primary mb-3">
            À propos
          </h2>
          <div className="bg-tb-surface border border-tb-border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/5 hover:border-tb-accent/30">
            {profile.bio ? (
              <p className="text-sm text-tb-text-secondary leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm text-tb-text-muted italic">
                Ce héros n&apos;a pas encore renseigné sa bio.
              </p>
            )}
          </div>
        </section>

        {/* Section Hero Passport */}
        {profile.passport && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-tb-accent" />
              <h2 className="text-lg font-anton tracking-wide text-tb-text-primary">
                Hero Passport
              </h2>
              <span className="text-xs text-tb-text-muted ml-auto">
                {profile.passport.completionPercent}% complété
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Compétences offertes */}
              {profile.passport.offeredSkills && (
                <div className="bg-tb-surface border border-tb-border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/5 hover:border-tb-accent/30">
                  <div className="flex items-center gap-2 mb-2">
                    <HeartHandshake className="w-4 h-4 text-tb-accent" />
                    <h3 className="text-sm font-semibold text-tb-text-primary">
                      Compétences offertes
                    </h3>
                  </div>
                  <p className="text-sm text-tb-text-secondary leading-relaxed whitespace-pre-line">
                    {profile.passport.offeredSkills}
                  </p>
                </div>
              )}

              {/* Aides recherchées */}
              {profile.passport.wantedHelp && (
                <div className="bg-tb-surface border border-tb-border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/5 hover:border-tb-accent/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-sm font-semibold text-tb-text-primary">
                      Aides recherchées
                    </h3>
                  </div>
                  <p className="text-sm text-tb-text-secondary leading-relaxed whitespace-pre-line">
                    {profile.passport.wantedHelp}
                  </p>
                </div>
              )}

              {/* Motivations — full width */}
              {profile.passport.motivations && (
                <div
                  className={`bg-tb-surface border border-tb-border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/5 hover:border-tb-accent/30 ${
                    profile.passport.offeredSkills && profile.passport.wantedHelp
                      ? "sm:col-span-2"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-semibold text-tb-text-primary">
                      Motivations
                    </h3>
                  </div>
                  <p className="text-sm text-tb-text-secondary leading-relaxed whitespace-pre-line">
                    {profile.passport.motivations}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Section Services actifs */}
        <section>
          <h2 className="text-lg font-anton tracking-wide text-tb-text-primary mb-3">
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
            <div className="bg-tb-surface border border-tb-border rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/5 hover:border-tb-accent/30">
              <ShieldQuestion className="w-10 h-10 text-tb-text-muted mx-auto mb-2" />
              <p className="text-sm text-tb-text-muted italic">
                Ce héros n&apos;a pas encore de service actif.
              </p>
            </div>
          )}
        </section>

        {/* Section Avis reçus */}
        <section>
          <h2 className="text-lg font-anton tracking-wide text-tb-text-primary mb-3">
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
            <div className="bg-tb-surface border border-tb-border rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/5 hover:border-tb-accent/30">
              <Sparkles className="w-10 h-10 text-tb-text-muted mx-auto mb-2" />
              <p className="text-sm text-tb-text-muted italic">
                Aucun avis pour le moment.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
