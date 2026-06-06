"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Clock, ArrowLeft, Calendar, User, Shield, MapPin } from "lucide-react";
import ConnectedHeader from "@/components/ConnectedHeader";

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  ratePerHour: number;
  status: string;
  createdAt: string;
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

export default function ServiceDetailClient({ service, isOwner }: { service: ServiceDetail; isOwner: boolean }) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen">
      <ConnectedHeader />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-tb-text-secondary hover:text-tb-text-primary transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la marketplace
        </Link>

        <div className="bg-tb-surface border border-tb-border rounded-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bangers tracking-wider text-tb-accent bg-tb-accent/5 rounded-full px-2.5 py-0.5">
                  {service.category}
                </span>
                {service.status === "inactive" && (
                  <span className="text-xs font-bangers tracking-wider text-tb-text-muted bg-[#5c5c5c]/10 rounded-full px-2.5 py-0.5">
                    INACTIF
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-anton tracking-wide text-tb-text-primary mb-1">
                {service.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-tb-text-secondary mt-2">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-tb-text-muted" />
                  <Link
                    href={`/profile/${service.provider.id}`}
                    className="hover:text-tb-accent transition-colors"
                  >
                    {service.provider.name}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-tb-text-muted" />
                  Publié le {new Date(service.createdAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-tb-accent">
                {service.ratePerHour}
              </div>
              <div className="text-xs text-tb-text-muted">TIME / heure</div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-tb-border mb-6" />

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-tb-text-secondary mb-2 uppercase tracking-wider">
              Description
            </h2>
            <p className="text-tb-text-primary leading-relaxed whitespace-pre-wrap">
              {service.description}
            </p>
          </div>

          {/* Provider info */}
          <div className="bg-tb-surface border border-tb-border rounded-xl p-4 mb-6">
            <h2 className="text-xs font-semibold text-tb-text-secondary mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              À propos du héros
            </h2>
            <p className="text-tb-text-primary font-semibold">{service.provider.name}</p>
            <p className="text-tb-text-secondary text-xs mt-0.5">
              {service.provider.walletAddress
                ? `Wallet : ${service.provider.walletAddress.slice(0, 16)}…`
                : "Nouveau héros — aucune transaction encore"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {service.provider.reputation > 0 ? (
                <>
                  <span className="text-yellow-400 text-sm font-semibold">
                    ⭐ {service.provider.reputation.toFixed(1)}/5
                  </span>
                  <span className="text-tb-text-muted text-xs">
                    Héros de confiance
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-tb-text-muted font-bangers tracking-wider">
                  NOUVEAU HÉROS DE LA COMMUNAUTÉ
                </span>
              )}
            </div>
            {/* Zone d'intervention */}
            {(service.provider.locationVisibility !== "hidden" || service.provider.availableOnline) && (
              <div className="mt-3 pt-3 border-t border-tb-border space-y-2">
                <p className="text-[10px] text-tb-text-secondary uppercase tracking-wider font-semibold">
                  Zone d&apos;intervention
                </p>
                {(() => {
                  const p = service.provider;
                  const vis = p.locationVisibility;
                  if (vis === "city" && p.city) {
                    return (
                      <p className="text-xs text-tb-text-primary flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-tb-text-muted" />
                        {p.city}
                        {p.department ? `, ${p.department}` : ""}
                        {p.serviceRadiusKm ? ` · ${p.serviceRadiusKm} km autour` : ""}
                      </p>
                    );
                  }
                  if (vis === "department" && p.department) {
                    return (
                      <p className="text-xs text-tb-text-primary flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-tb-text-muted" />
                        {p.department}
                      </p>
                    );
                  }
                  if (vis === "region" && p.region) {
                    return (
                      <p className="text-xs text-tb-text-primary flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-tb-text-muted" />
                        {p.region}
                      </p>
                    );
                  }
                  return null;
                })()}
                {service.provider.availableOnline && (
                  <p className="text-xs text-tb-accent font-medium">
                    ✅ Disponible en ligne
                  </p>
                )}
                <Link
                  href={`/profile/${service.provider.id}`}
                  className="inline-flex items-center gap-1 text-xs text-tb-accent hover:text-tb-accent-hover transition-colors font-medium"
                >
                  Voir le profil local
                  <span className="text-lg leading-none">→</span>
                </Link>
              </div>
            )}
          </div>

          {/* CTA */}
          {isOwner ? (
            <div className="bg-tb-accent/5 border border-tb-accent/20 rounded-xl p-4 text-center">
              <p className="text-tb-accent text-sm font-semibold mb-2">
                C&apos;est votre service
              </p>
              <Link
                href="/my-services"
                className="text-tb-text-secondary hover:text-tb-text-primary text-sm underline transition-colors"
              >
                Gérer mes services
              </Link>
            </div>
          ) : session ? (
            <Link
              href={`/services/${service.id}/book`}
              className="block w-full bg-tb-accent hover:bg-tb-accent-hover text-black font-semibold rounded-xl py-3 text-center transition-colors text-sm"
            >
              Réserver avec mes TIME
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="block w-full bg-tb-accent hover:bg-tb-accent-hover text-black font-semibold rounded-xl py-3 text-center transition-colors text-sm"
            >
              Se connecter pour réserver
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
