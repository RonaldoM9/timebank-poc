"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, ExternalLink, Sparkles, MapPin, HeartHandshake } from "lucide-react";
import ConnectedHeader from "@/components/ConnectedHeader";
import PublicHeader from "@/components/landing/PublicHeader";
import { useSession } from "next-auth/react";
import SolidarityBadge from "@/components/SolidarityBadge";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  ratePerHour: number;
  providerId: string;
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

const CATEGORIES = [
  "Tous", "Tech", "Design", "Langues", "Career", "Bricolage",
  "Cuisine", "Bien-être", "Administratif", "Communauté", "Autre",
];

export default function ServicesClient({ initialServices }: { initialServices: Service[] }) {
  const { data: session } = useSession();
  const [services, setServices] = useState(initialServices);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [cityFilter, setCityFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [solidarityFilter, setSolidarityFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category !== "Tous") params.set("category", category);
    if (cityFilter.trim()) params.set("city", cityFilter.trim());
    if (deptFilter.trim()) params.set("department", deptFilter.trim());
    if (regionFilter.trim()) params.set("region", regionFilter.trim());
    if (onlineOnly) params.set("availableOnline", "true");
    if (solidarityFilter === "solidarity") params.set("solidarity", "true");

    const res = await fetch(`/api/services?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setServices(data);
    }
    setLoading(false);
  }, [search, category, cityFilter, deptFilter, regionFilter, onlineOnly, solidarityFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => fetchServices(), 300);
    return () => clearTimeout(timer);
  }, [fetchServices]);

  function getProviderZone(service: Service): string | null {
    const p = service.provider;
    const vis = p.locationVisibility;
    if (vis === "hidden" || !vis) return null;
    if (vis === "city") return p.city || null;
    if (vis === "department") return p.department || null;
    if (vis === "region") return p.region || null;
    return null;
  }

  return (
    <div className="min-h-screen">
      {session ? <ConnectedHeader /> : <PublicHeader />}

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Hero */}
        <div className="text-center mb-2">
          <h1 className="text-3xl font-anton tracking-wide text-tb-text-primary mb-1">
            Explorer les services
          </h1>
          <p className="text-tb-text-secondary text-sm">
            Trouve un héros du quotidien et réserve avec tes TIME.
          </p>
          <span className="inline-block mt-2 font-bangers text-tb-accent text-xs tracking-wider opacity-60">
            ~ chaque compétence peut aider quelqu&apos;un ~
          </span>
        </div>

        {/* Local Heroes Banner */}
        <div className="bg-gradient-to-r from-tb-accent/10 to-tb-accent/5 border border-tb-accent/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-tb-accent/10 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-tb-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-tb-text-primary">
                Trouvez des héros près de chez vous
              </h2>
              <p className="text-xs text-tb-text-secondary mt-0.5">
                Des voisins, collègues ou membres de la communauté prêts à aider autour de vous.
              </p>
            </div>
          </div>
          {session && (
            <Link
              href="/settings/location"
              className="shrink-0 text-xs text-tb-accent hover:text-tb-accent-hover font-medium transition-colors underline underline-offset-2"
            >
              Compléter ma zone
            </Link>
          )}
        </div>

        {/* Search + Filters */}
        <div className="space-y-3">
          {/* Search + category */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tb-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un service…"
                className="w-full bg-tb-surface border border-tb-border rounded-xl pl-10 pr-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors text-sm"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-tb-surface border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary focus:outline-none focus:border-tb-accent transition-colors text-sm appearance-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {/* Geo filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Ville"
              className="flex-1 bg-tb-surface border border-tb-border rounded-xl px-3.5 py-2 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors text-xs"
            />
            <input
              type="text"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              placeholder="Département"
              className="flex-1 bg-tb-surface border border-tb-border rounded-xl px-3.5 py-2 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors text-xs"
            />
            <input
              type="text"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              placeholder="Région"
              className="flex-1 bg-tb-surface border border-tb-border rounded-xl px-3.5 py-2 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors text-xs"
            />
            <label className="flex items-center gap-2 bg-tb-surface border border-tb-border rounded-xl px-3.5 py-2 text-xs text-tb-text-secondary cursor-pointer hover:border-[#5c5c5c] transition-colors whitespace-nowrap">
              <input
                type="checkbox"
                checked={onlineOnly}
                onChange={(e) => setOnlineOnly(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#00d4aa]"
              />
              En ligne
            </label>
          </div>
          {/* Active filter indicators */}
          {(cityFilter || deptFilter || regionFilter || onlineOnly) && (
            <div className="flex flex-wrap gap-2">
              {cityFilter && (
                <span className="text-[10px] bg-tb-accent/10 text-tb-accent rounded-full px-2.5 py-0.5 font-medium">
                  Ville : {cityFilter}
                </span>
              )}
              {deptFilter && (
                <span className="text-[10px] bg-tb-accent/10 text-tb-accent rounded-full px-2.5 py-0.5 font-medium">
                  Département : {deptFilter}
                </span>
              )}
              {regionFilter && (
                <span className="text-[10px] bg-tb-accent/10 text-tb-accent rounded-full px-2.5 py-0.5 font-medium">
                  Région : {regionFilter}
                </span>
              )}
              {onlineOnly && (
                <span className="text-[10px] bg-tb-accent/10 text-tb-accent rounded-full px-2.5 py-0.5 font-medium">
                  En ligne seulement
                </span>
              )}
            </div>
          )}

          {/* Solidarity filter */}
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-tb-text-muted" />
            <select
              value={solidarityFilter}
              onChange={(e) => setSolidarityFilter(e.target.value)}
              className="bg-tb-surface border border-tb-border rounded-xl px-3.5 py-2 text-tb-text-primary focus:outline-none focus:border-tb-accent transition-colors text-xs appearance-none cursor-pointer"
            >
              <option value="all">Toutes les missions</option>
              <option value="solidarity">Missions solidaires</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-tb-text-muted mx-auto mb-3" />
            <p className="text-tb-text-secondary text-sm">
              Aucun service trouvé pour cette recherche.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const zone = getProviderZone(service);
              const radiusKm = service.provider.serviceRadiusKm;
              return (
                <div
                  key={service.id}
                  className="bg-tb-surface border border-tb-border rounded-2xl p-5 hover:border-tb-accent/20 transition-all group flex flex-col"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-bangers tracking-wider text-tb-accent bg-tb-accent/5 rounded-full px-2 py-0.5">
                        {service.category}
                      </span>
                      <span className="text-tb-accent font-semibold text-sm whitespace-nowrap ml-2">
                        {service.ratePerHour} TIME/h
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <SolidarityBadge status={service.solidarityStatus} />
                    </div>
                    <h3 className="font-semibold text-tb-text-primary mb-1 line-clamp-1 group-hover:text-tb-accent transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-tb-text-secondary text-sm line-clamp-2 mb-3">
                      {service.description}
                    </p>
                    {/* Provider zone */}
                    {zone && (
                      <p className="text-[10px] text-tb-text-muted flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3" />
                        {zone}
                        {radiusKm && (
                          <span> · {radiusKm} km</span>
                        )}
                      </p>
                    )}
                    {service.provider.availableOnline && (
                      <p className="text-[10px] text-tb-accent font-medium mb-2">
                        En ligne possible
                      </p>
                    )}
                  </div>
                  <div className="pt-3 border-t border-tb-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-tb-text-muted">
                          par{" "}
                          <Link
                            href={`/profile/${service.providerId}`}
                            className="text-tb-text-secondary hover:text-tb-accent transition-colors"
                          >
                            {service.provider.name}
                          </Link>
                        </p>
                        <p className="text-[10px] text-tb-text-muted font-bangers tracking-wider">
                          {service.provider.reputation > 0
                            ? `⭐ ${service.provider.reputation.toFixed(1)}/5`
                            : "NOUVEAU HÉROS"}
                        </p>
                      </div>
                      <Link
                        href={`/services/${service.id}`}
                        className="inline-flex items-center gap-1 bg-tb-surface hover:bg-tb-surface-elevated border border-tb-border rounded-xl px-3 py-1.5 text-xs text-tb-text-secondary hover:text-tb-text-primary transition-colors"
                      >
                        Voir
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
