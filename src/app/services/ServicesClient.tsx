"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Sparkles, MapPin, Plus, HeartHandshake, Clock, User } from "lucide-react";
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

const CATEGORY_EMOJIS: Record<string, string> = {
  Tech: "💻", Design: "🎨", Langues: "🌍", Career: "💼",
  Bricolage: "🔧", Cuisine: "🍳", "Bien-être": "🧘",
  Administratif: "📋", Communauté: "🤝", Autre: "⭐",
};

export default function ServicesClient({ initialServices }: { initialServices: Service[] }) {
  const { data: session } = useSession();
  const [services, setServices] = useState(initialServices);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [location, setLocation] = useState("");
  const [solidarityFilter, setSolidarityFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category !== "Tous") params.set("category", category);
    if (location.trim()) params.set("city", location.trim());
    if (solidarityFilter === "solidarity") params.set("solidarity", "true");

    const res = await fetch(`/api/services?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setServices(data);
    }
    setLoading(false);
  }, [search, category, location, solidarityFilter]);

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

  function getInitials(name: string): string {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  }

  return (
    <div className="min-h-screen">
      {session ? <ConnectedHeader /> : <PublicHeader />}

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5 animate-fade-in-up">
        {/* ─── HEADER ─── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-anton tracking-wide text-tb-text-primary">
              Explorer les missions
            </h1>
            <p className="text-tb-text-secondary text-sm mt-1">
              Trouve un héros du quotidien et réserve avec tes TIME.
            </p>
          </div>
          {session && (
            <Link
              href="/services/new"
              className="hidden sm:inline-flex items-center gap-2 bg-tb-accent hover:bg-tb-accent-hover text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/20"
            >
              <Plus className="w-4 h-4" />
              Proposer
            </Link>
          )}
        </div>

        {/* ─── FILTERS ─── */}
        <div className="space-y-3">
          {/* Row 1: Search + Category + Location */}
          <div className="flex flex-col sm:flex-row gap-2">
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
              className="bg-tb-surface border border-tb-border rounded-xl px-3.5 py-2.5 text-tb-text-primary focus:outline-none focus:border-tb-accent transition-colors text-sm appearance-none cursor-pointer min-w-[140px]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_EMOJIS[cat] || ""} {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ville ou code postal"
              className="bg-tb-surface border border-tb-border rounded-xl px-3.5 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors text-sm min-w-[160px]"
            />
          </div>

          {/* Row 2: Toggle tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSolidarityFilter("all")}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  solidarityFilter === "all"
                    ? "bg-tb-accent text-white border-tb-accent shadow-sm"
                    : "bg-tb-surface text-tb-text-secondary border-tb-border hover:border-tb-accent/50"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Toutes
              </button>
              <button
                onClick={() => setSolidarityFilter("solidarity")}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  solidarityFilter === "solidarity"
                    ? "bg-pink-500 text-white border-pink-500 shadow-sm"
                    : "bg-tb-surface text-tb-text-secondary border-tb-border hover:border-pink-500/50"
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                Solidaires
              </button>
            </div>
            {session && (
              <Link
                href="/services/new"
                className="sm:hidden inline-flex items-center gap-1.5 bg-tb-accent text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Proposer
              </Link>
            )}
          </div>
        </div>

        {/* ─── RESULTS ─── */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-tb-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-full bg-tb-accent-soft flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-tb-accent" />
            </div>
            <p className="text-tb-text-secondary text-sm font-medium">
              Aucune mission trouvée
            </p>
            <p className="text-xs text-tb-text-muted mt-1">
              Essaie de modifier tes filtres ou d&apos;élargir ta recherche.
            </p>
            <button
              onClick={() => { setSearch(""); setCategory("Tous"); setLocation(""); setSolidarityFilter("all"); }}
              className="mt-4 text-xs text-tb-accent hover:underline font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map((service, idx) => {
              const zone = getProviderZone(service);
              const radiusKm = service.provider.serviceRadiusKm;
              return (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="group bg-tb-surface border border-tb-border rounded-xl p-4 hover:border-tb-accent hover:shadow-md hover:shadow-tb-accent/5 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* Top: Category + Price */}
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] font-semibold text-tb-accent bg-tb-accent/5 rounded-full px-2.5 py-0.5">
                      {service.category}
                    </span>
                    <span className="text-sm font-bold text-tb-accent whitespace-nowrap ml-2">
                      {service.ratePerHour} TIME/h
                    </span>
                  </div>

                  {/* Solidarity badge */}
                  {service.solidarityStatus !== "CLASSIC" && (
                    <div className="mb-1.5">
                      <SolidarityBadge status={service.solidarityStatus} />
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-tb-text-primary line-clamp-1 group-hover:text-tb-accent transition-colors mb-1">
                    {service.title}
                  </h3>

                  {/* Description - 1 line only for compactness */}
                  <p className="text-xs text-tb-text-secondary line-clamp-1 mb-auto">
                    {service.description}
                  </p>

                  {/* Footer: Location + Provider */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-tb-border">
                    <div className="flex items-center gap-1.5 text-[10px] text-tb-text-muted truncate">
                      {zone && (
                        <>
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {zone}{radiusKm ? ` · ${radiusKm} km` : ""}
                          </span>
                        </>
                      )}
                      {!zone && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="truncate">{service.provider.name}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-tb-accent opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      Voir →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
