"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ConnectedHeader from "@/components/ConnectedHeader";
import {
  verifyOrganizationAction,
  suspendOrganizationAction,
  activateOrganizationAction,
} from "@/app/actions/organizations";
import {
  getOrganizationTypeLabel,
  getOrganizationStatusLabel,
  getOrganizationStatusColor,
} from "@/lib/organization-labels";
import Link from "next/link";
import {
  ShieldCheck,
  Shield,
  Building2,
  RefreshCw,
  Loader2,
  Search,
} from "lucide-react";

type OrgData = {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  isVerified: boolean;
  city: string | null;
  memberCount: number;
  createdByName: string;
  createdAt: string;
};

type Props = {
  organizations: OrgData[];
};

export default function AdminOrganizationsClient({ organizations }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pending, setPending] = useState<string | null>(null);

  const filtered = organizations.filter((o) => {
    if (search && !o.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    return true;
  });

  const handleVerify = useCallback(
    async (id: string) => {
      setPending(id);
      await verifyOrganizationAction(id);
      setPending(null);
      router.refresh();
    },
    [router]
  );

  const handleSuspend = useCallback(
    async (id: string) => {
      if (!confirm("Suspendre cette organisation ?")) return;
      setPending(id);
      await suspendOrganizationAction(id);
      setPending(null);
      router.refresh();
    },
    [router]
  );

  const handleActivate = useCallback(
    async (id: string) => {
      setPending(id);
      await activateOrganizationAction(id);
      setPending(null);
      router.refresh();
    },
    [router]
  );

  return (
    <div className="min-h-screen bg-tb-bg">
      <ConnectedHeader />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-tb-text-primary flex items-center gap-2">
              <Shield className="w-6 h-6 text-tb-accent" />
              Administration des organisations
            </h1>
            <p className="text-tb-text-muted text-sm mt-1">
              {organizations.length} organisation{organizations.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-tb-surface-elevated border border-tb-border rounded-xl px-3 py-2 text-sm text-tb-text-primary focus:outline-none focus:border-tb-accent/50"
          >
            <option value="all">Tous les statuts</option>
            <option value="PENDING_REVIEW">En attente</option>
            <option value="VERIFIED">Vérifiée</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspendue</option>
            <option value="ARCHIVED">Archivée</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-tb-border rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-8 h-8 text-tb-border mx-auto mb-2" />
              <p className="text-tb-text-muted text-sm">Aucune organisation trouvée.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-tb-border bg-tb-surface-elevated/50">
                    <th className="text-left px-4 py-3 text-tb-text-muted font-medium">Organisation</th>
                    <th className="text-left px-4 py-3 text-tb-text-muted font-medium">Type</th>
                    <th className="text-left px-4 py-3 text-tb-text-muted font-medium">Statut</th>
                    <th className="text-left px-4 py-3 text-tb-text-muted font-medium">Membres</th>
                    <th className="text-left px-4 py-3 text-tb-text-muted font-medium">Créé par</th>
                    <th className="text-right px-4 py-3 text-tb-text-muted font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tb-border">
                  {filtered.map((org) => (
                    <tr key={org.id} className="hover:bg-tb-surface-elevated/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/organizations/${org.slug}`}
                          className="text-tb-text-primary font-medium hover:text-tb-accent transition-colors"
                        >
                          {org.name}
                        </Link>
                        {org.city && (
                          <p className="text-xs text-tb-text-muted mt-0.5">{org.city}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-tb-text-secondary">
                        {getOrganizationTypeLabel(org.type)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getOrganizationStatusColor(org.status)}`}>
                          {getOrganizationStatusLabel(org.status)}
                        </span>
                        {org.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline ml-1" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-tb-text-secondary">{org.memberCount}</td>
                      <td className="px-4 py-3 text-tb-text-secondary">{org.createdByName}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {(org.status === "PENDING_REVIEW" || !org.isVerified) && (
                            <button
                              onClick={() => handleVerify(org.id)}
                              disabled={pending === org.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
                            >
                              {pending === org.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Vérifier"
                              )}
                            </button>
                          )}
                          {org.status === "SUSPENDED" && (
                            <button
                              onClick={() => handleActivate(org.id)}
                              disabled={pending === org.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50"
                            >
                              {pending === org.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Activer"
                              )}
                            </button>
                          )}
                          {(org.status === "ACTIVE" || org.status === "VERIFIED") && (
                            <button
                              onClick={() => handleSuspend(org.id)}
                              disabled={pending === org.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                            >
                              {pending === org.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Suspendre"
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
