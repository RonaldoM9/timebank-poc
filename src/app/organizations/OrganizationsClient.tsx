"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import ConnectedHeader from "@/components/ConnectedHeader";
import {
  Building2,
  Search,
  MapPin,
  Users,
  Clock,
  Plus,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import {
  getOrganizationTypeLabel,
  getOrganizationStatusLabel,
  getOrganizationStatusColor,
} from "@/lib/organization-labels";

type OrgSummary = {
  id: string;
  name: string;
  slug: string;
  type: string;
  shortDescription: string | null;
  city: string | null;
  department: string | null;
  region: string | null;
  isVerified: boolean;
  status: string;
  logoUrl: string | null;
  potBalance: number;
  memberCount: number;
};

type Props = {
  organizations: OrgSummary[];
  isAuthenticated: boolean;
};

export default function OrganizationsClient({ organizations, isAuthenticated }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  const types = useMemo(() => {
    const set = new Set(organizations.map((o) => o.type));
    return Array.from(set).sort();
  }, [organizations]);

  const cities = useMemo(() => {
    const set = new Set(organizations.filter((o) => o.city).map((o) => o.city!));
    return Array.from(set).sort();
  }, [organizations]);

  const filtered = useMemo(() => {
    return organizations.filter((o) => {
      if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.shortDescription?.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== "all" && o.type !== typeFilter) return false;
      if (cityFilter !== "all" && o.city !== cityFilter) return false;
      return true;
    });
  }, [organizations, search, typeFilter, cityFilter]);

  return (
    <div className="min-h-screen bg-tb-bg">
      <ConnectedHeader />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-tb-text-primary flex items-center gap-2">
              <Building2 className="w-6 h-6 text-tb-accent" />
              Organisations partenaires
            </h1>
            <p className="text-tb-text-secondary text-sm mt-1">
              Découvrez les mairies, associations, écoles, bailleurs et entreprises
              qui mobilisent leurs communautés avec TimeHeroes.
            </p>
          </div>
          {isAuthenticated && (
            <Link
              href="/organizations/new"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Créer une organisation
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tb-text-muted" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-tb-surface-elevated border border-tb-border rounded-xl px-9 py-2 text-sm text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent/50"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-tb-surface-elevated border border-tb-border rounded-xl px-3 py-2 text-sm text-tb-text-primary focus:outline-none focus:border-tb-accent/50"
          >
            <option value="all">Tous les types</option>
            {types.map((t) => (
              <option key={t} value={t}>{getOrganizationTypeLabel(t)}</option>
            ))}
          </select>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-tb-surface-elevated border border-tb-border rounded-xl px-3 py-2 text-sm text-tb-text-primary focus:outline-none focus:border-tb-accent/50"
          >
            <option value="all">Toutes les villes</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-tb-border rounded-2xl">
            <Building2 className="w-12 h-12 text-tb-border mx-auto mb-3" />
            <p className="text-tb-text-muted">Aucune organisation trouvée.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((org) => (
              <Link
                key={org.id}
                href={`/organizations/${org.slug}`}
                className="bg-white border border-tb-border rounded-2xl p-5 hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-tb-accent/10 border border-tb-accent/20 flex items-center justify-center text-lg font-bold text-tb-accent shrink-0">
                      {org.logoUrl ? (
                        <img src={org.logoUrl} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        org.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="text-tb-text-primary font-semibold">{org.name}</h3>
                      <p className="text-xs text-tb-text-muted">{getOrganizationTypeLabel(org.type)}</p>
                    </div>
                  </div>
                </div>

                {org.shortDescription && (
                  <p className="text-sm text-tb-text-secondary line-clamp-2">{org.shortDescription}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-tb-text-muted flex-wrap">
                  {org.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {org.city}{org.department ? ` · ${org.department}` : ""}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {org.memberCount} membre{org.memberCount > 1 ? "s" : ""}
                  </span>
                  {org.potBalance > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {org.potBalance} TIME
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getOrganizationStatusColor(org.status)}`}>
                    {getOrganizationStatusLabel(org.status)}
                  </span>
                  {org.isVerified && (
                    <span className="text-xs px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Partenaire vérifié
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
