"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Clock, ArrowLeft, Calendar, User, Shield, MapPin, HeartHandshake, Star } from "lucide-react";
import ConnectedHeader from "@/components/ConnectedHeader";
import SolidarityBadge, { SOLIDARITY_CATEGORY_LABELS } from "@/components/SolidarityBadge";

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  ratePerHour: number;
  status: string;
  createdAt: string;
  isSolidarityMission: boolean;
  solidarityStatus: string;
  solidarityCategory: string | null;
  solidarityReason: string | null;
  provider: {
    id: string;
    name: string;
    walletAddress: string;
    reputation: number;
    city: string | null;
    department: string | null;
    region: string | null;
    locationVisibility: string | null;
    serviceRadiusKm: number | null;
    availableOnline: boolean | null;
  };
}

function getProviderLocation(service: ServiceDetail): string | null {
  const p = service.provider;
  const vis = p.locationVisibility;
  if (vis === "hidden" || !vis) return null;
  if (vis === "city") return [p.city, p.department].filter(Boolean).join(", ") || null;
  if (vis === "department") return p.department || null;
  if (vis === "region") return p.region || null;
  return null;
}

export default function ServiceDetailClient({ service, isOwner }: { service: ServiceDetail; isOwner: boolean }) {
  const { data: session } = useSession();
  const location = getProviderLocation(service);
  const categoryEmoji: Record<string, string> = {
    tech: "💻", design: "🎨", langues: "🌍", career: "💼",
    bricolage: "🔧", cuisine: "🍳", "bien-être": "🧘",
    administratif: "📋", communauté: "🤝", autre: "⭐",
    senior_support: "👴", digital_help: "📱", education: "📚",
    transport: "🚗", jardinage: "🌱", home_repair: "🔧", daily_life: "🏠",
    LOCAL_SUPPORT: "🤝", SENIOR_SUPPORT: "👴", DIGITAL_HELP: "📱",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ConnectedHeader />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-6 w-full">
        {/* Back link */}
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-tb-text-secondary hover:text-tb-accent transition-colors text-xs mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour aux missions
        </Link>

        {/* ─── MAIN CARD ─── */}
        <div className="bg-tb-surface border border-tb-border rounded-2xl overflow-hidden">
          {/* Header with category color */}
          <div className="bg-gradient-to-r from-tb-accent/5 to-transparent px-6 pt-6 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-semibold text-tb-accent bg-tb-accent/10 rounded-full px-2.5 py-0.5">
                    {categoryEmoji[service.category.toLowerCase()] || "⭐"} {service.category}
                  </span>
                  <SolidarityBadge status={service.solidarityStatus} />
                  {service.status === "inactive" && (
                    <span className="text-[10px] text-tb-text-muted bg-gray-500/10 rounded-full px-2.5 py-0.5">
                      Inactif
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-anton tracking-wide text-tb-text-primary">
                  {service.title}
                </h1>
                <div className="flex items-center gap-3 mt-2 text-xs text-tb-text-secondary">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <Link href={`/profile/${service.provider.id}`} className="hover:text-tb-accent transition-colors">
                      {service.provider.name}
                    </Link>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(service.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold text-tb-accent">
                  {service.ratePerHour}
                </div>
                <div className="text-xs text-tb-text-muted">TIME / heure</div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 space-y-5">
            {/* ─── DESCRIPTION ─── */}
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-tb-text-muted mb-2">
                Description
              </h2>
              <p className="text-sm text-tb-text-primary leading-relaxed whitespace-pre-wrap">
                {service.description}
              </p>
            </div>

            {/* ─── HERO PROFILE ─── */}
            <div className="bg-tb-bg border border-tb-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-tb-accent/10 flex items-center justify-center text-tb-accent font-bold text-sm shrink-0">
                  {service.provider.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-tb-text-primary">{service.provider.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {service.provider.reputation > 0 ? (
                      <>
                        <span className="flex items-center gap-0.5 text-xs font-semibold text-yellow-500">
                          <Star className="w-3 h-3 fill-yellow-400" />
                          {service.provider.reputation.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-tb-text-muted">Héros de confiance</span>
                      </>
                    ) : (
                      <span className="text-[10px] text-tb-text-muted font-medium">Nouveau héros</span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/profile/${service.provider.id}`}
                  className="text-[10px] text-tb-accent hover:underline font-medium shrink-0"
                >
                  Profil →
                </Link>
              </div>

              {/* Location */}
              {(location || service.provider.availableOnline) && (
                <div className="flex items-center gap-3 flex-wrap text-xs text-tb-text-secondary pt-3 border-t border-tb-border">
                  {location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-tb-text-muted" />
                      {location}
                      {service.provider.serviceRadiusKm && ` · ${service.provider.serviceRadiusKm} km`}
                    </span>
                  )}
                  {service.provider.availableOnline && (
                    <span className="text-tb-accent text-[10px] font-medium">✅ En ligne possible</span>
                  )}
                </div>
              )}
            </div>

            {/* ─── SOLIDARITY INFO (compact) ─── */}
            {service.isSolidarityMission && (
              <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-4">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-teal-500 mb-2 flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  Mission solidaire
                </h2>
                {service.solidarityCategory && (
                  <p className="text-xs text-tb-text-secondary mb-1">
                    <span className="text-tb-text-primary">Catégorie :</span>{" "}
                    {SOLIDARITY_CATEGORY_LABELS[service.solidarityCategory] || service.solidarityCategory}
                  </p>
                )}
                {service.solidarityReason && (
                  <p className="text-xs text-tb-text-secondary mb-1">{service.solidarityReason}</p>
                )}
                <p className="text-xs text-tb-text-secondary">
                  <span className="text-tb-text-primary">Statut :</span>{" "}
                  <SolidarityBadge status={service.solidarityStatus} showRejected />
                </p>
                {session && !isOwner && (
                  <p className="text-xs text-tb-text-secondary mt-2 pt-2 border-t border-teal-500/10">
                    💰 Éligible au pot commun après réservation
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ─── CTA FOOTER (sticky in card) ─── */}
          <div className="border-t border-tb-border px-6 py-4 bg-gradient-to-b from-transparent to-tb-bg/50">
            {isOwner ? (
              <div className="flex items-center justify-between">
                <p className="text-xs text-tb-accent font-medium">C&apos;est votre service</p>
                <Link
                  href="/my-services"
                  className="text-xs text-tb-text-secondary hover:text-tb-text-primary underline transition-colors"
                >
                  Gérer mes services →
                </Link>
              </div>
            ) : session ? (
              <Link
                href={`/services/${service.id}/book`}
                className="block w-full bg-tb-accent hover:bg-tb-accent-hover text-white font-bold rounded-xl py-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/20 text-sm"
              >
                Réserver avec mes TIME
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="block w-full bg-tb-accent hover:bg-tb-accent-hover text-white font-bold rounded-xl py-3 text-center transition-all text-sm"
              >
                Se connecter pour réserver
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
