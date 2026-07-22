"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import ConnectedHeader from "@/components/ConnectedHeader";
import {
  joinOrganizationAction,
  leaveOrganizationAction,
} from "@/app/actions/organizations";
import {
  getOrganizationTypeLabel,
  getOrganizationStatusLabel,
  getOrganizationStatusColor,
  getOrganizationRoleLabel,
} from "@/lib/organization-labels";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Clock,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Heart,
  ArrowLeft,
} from "lucide-react";

type OrgData = {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  description: string | null;
  shortDescription: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  websiteUrl: string | null;
  city: string | null;
  department: string | null;
  region: string | null;
  isVerified: boolean;
  contactName: string | null;
  contactEmail: string | null;
  memberCount: number;
  potBalance: number;
  createdBy: { name: string; avatar: string | null } | null;
  createdAt: string;
};

type Props = {
  organization: OrgData;
  user: { id: string; name: string } | null;
  myRole: string | null;
};

export default function OrganizationDetailClient({ organization: org, user, myRole }: Props) {
  const router = useRouter();

  const isMember = myRole !== null;
  const canManage = myRole === "FACILITATOR" || myRole === "ADMIN" || myRole === "OWNER";

  const handleJoin = useCallback(async () => {
    const result = await joinOrganizationAction(org.id);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
  }, [org.id, router]);

  const handleLeave = useCallback(async () => {
    if (!confirm("Quitter cette organisation ?")) return;
    const result = await leaveOrganizationAction(org.id);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
  }, [org.id, router]);

  return (
    <div className="min-h-screen bg-tb-bg">
      <ConnectedHeader orgRole={myRole} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/organizations"
          className="flex items-center gap-1 text-sm text-tb-text-secondary hover:text-tb-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux organisations
        </Link>

        {/* Header */}
        <div className="bg-white border border-tb-border rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-2xl bg-tb-accent/10 border border-tb-accent/20 flex items-center justify-center text-2xl font-bold text-tb-accent shrink-0">
              {org.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-tb-text-primary">{org.name}</h1>
                {org.isVerified && (
                  <span className="text-xs px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Partenaire vérifié
                  </span>
                )}
              </div>
              <p className="text-tb-text-muted text-sm mt-1">
                {getOrganizationTypeLabel(org.type)}
                {org.city && ` · ${org.city}${org.department ? `, ${org.department}` : ""}`}
              </p>
            </div>
          </div>

          {org.shortDescription && (
            <p className="text-tb-text-secondary">{org.shortDescription}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-tb-surface-elevated rounded-xl p-3 text-center">
              <Users className="w-5 h-5 text-tb-accent mx-auto mb-1" />
              <div className="text-lg font-bold text-tb-text-primary">{org.memberCount}</div>
              <div className="text-xs text-tb-text-muted">Membres</div>
            </div>
            <div className="bg-tb-surface-elevated rounded-xl p-3 text-center">
              <Heart className="w-5 h-5 text-tb-accent mx-auto mb-1" />
              <div className="text-lg font-bold text-tb-text-primary">{org.potBalance}</div>
              <div className="text-xs text-tb-text-muted">TIME au pot</div>
            </div>
            <div className="bg-tb-surface-elevated rounded-xl p-3 text-center">
              <Sparkles className="w-5 h-5 text-tb-accent mx-auto mb-1" />
              <div className="text-lg font-bold text-tb-text-primary">—</div>
              <div className="text-xs text-tb-text-muted">Missions</div>
            </div>
            <div className="bg-tb-surface-elevated rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-tb-accent mx-auto mb-1" />
              <div className="text-lg font-bold text-tb-text-primary">—</div>
              <div className="text-xs text-tb-text-muted">TIME mobilisés</div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3 flex-wrap">
            {!user ? (
              <Link
                href="/auth/signin"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors"
              >
                Connectez-vous pour rejoindre
              </Link>
            ) : isMember ? (
              <Link
                href={`/organizations/${org.slug}/pot`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 transition-colors"
              >
                <Heart className="w-4 h-4" />
                Donner au pot
              </Link>
            ) : (
              <button
                onClick={handleJoin}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors"
              >
                <Users className="w-4 h-4" />
                Rejoindre cette organisation
              </button>
            )}
            {org.websiteUrl && (
              <a
                href={org.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-tb-accent hover:text-tb-accent-hover transition-colors"
              >
                <Globe className="w-4 h-4" />
                Site web
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        {org.description && (
          <div className="bg-white border border-tb-border rounded-2xl p-6 mt-4">
            <h2 className="text-lg font-semibold text-tb-text-primary mb-3">À propos</h2>
            <p className="text-tb-text-secondary whitespace-pre-line">{org.description}</p>
          </div>
        )}

        {/* Info */}
        <div className="bg-white border border-tb-border rounded-2xl p-6 mt-4 space-y-3">
          <h2 className="text-lg font-semibold text-tb-text-primary">Informations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {org.city && (
              <div className="flex items-center gap-2 text-tb-text-secondary">
                <MapPin className="w-4 h-4 text-tb-accent" />
                {org.city}{org.department ? `, ${org.department}` : ""}{org.region ? ` — ${org.region}` : ""}
              </div>
            )}
            {org.contactEmail && (
              <div className="flex items-center gap-2 text-tb-text-secondary">
                <span className="text-tb-accent">✉</span>
                {org.contactEmail}
              </div>
            )}
            <div className="flex items-center gap-2 text-tb-text-secondary">
              <ShieldCheck className="w-4 h-4 text-tb-accent" />
              Statut : <span className={`px-2 py-0.5 rounded-full text-xs ${getOrganizationStatusColor(org.status)}`}>{getOrganizationStatusLabel(org.status)}</span>
            </div>
          </div>
        </div>

        {/* Quick links for members */}
        {isMember && (
          <div className="mt-6 flex flex-col gap-3">
            {canManage && (
              <Link
                href={`/organizations/${org.slug}/dashboard`}
                className="flex items-center justify-between bg-tb-accent/5 border border-tb-accent/20 rounded-2xl p-4 hover:bg-tb-accent/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-tb-accent" />
                  <div>
                    <p className="text-sm font-medium text-tb-text-primary">Accéder au tableau de bord</p>
                    <p className="text-xs text-tb-text-muted">Gérer les membres, missions, pot et impact</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-tb-accent" />
              </Link>
            )}
            <Link
              href={`/organizations/${org.slug}/pot`}
              className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-2xl p-4 hover:bg-rose-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-rose-500" />
                <div>
                  <p className="text-sm font-medium text-tb-text-primary">Donner au pot TIME</p>
                  <p className="text-xs text-tb-text-muted">Contribuer au pot commun de l'organisation</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-rose-400" />
            </Link>
            <Link
              href={`/organizations/${org.slug}/programs`}
              className="flex items-center justify-between bg-tb-surface-elevated border border-tb-border rounded-2xl p-4 hover:bg-tb-border transition-colors"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-tb-accent" />
                <div>
                  <p className="text-sm font-medium text-tb-text-primary">Programmes</p>
                  <p className="text-xs text-tb-text-muted">Lancer et suivre des programmes d'action locaux</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-tb-accent" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
