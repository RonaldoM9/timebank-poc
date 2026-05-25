"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Clock, Search, ExternalLink, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  ratePerHour: number;
  status: string;
  createdAt: string;
  provider: {
    name: string;
    walletAddress: string;
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
  const [loading, setLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category !== "Tous") params.set("category", category);

    const res = await fetch(`/api/services?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setServices(data);
    }
    setLoading(false);
  }, [search, category]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => fetchServices(), 300);
    return () => clearTimeout(timer);
  }, [fetchServices]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-[#262626]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#00d4aa]" />
            <span className="font-anton text-lg tracking-wide text-[#f5f5f5]">
              TimeBank
            </span>
          </div>
          {session ? (
            <Link
              href="/dashboard"
              className="text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors text-sm"
            >
              Tableau de bord
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors text-sm"
            >
              Connexion
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Hero */}
        <div className="text-center mb-2">
          <h1 className="text-3xl font-anton tracking-wide text-[#f5f5f5] mb-1">
            Explorer les services
          </h1>
          <p className="text-[#a3a3a3] text-sm">
            Trouve un héros du quotidien et réserve bientôt avec tes TIME.
          </p>
          <span className="inline-block mt-2 font-bangers text-[#00d4aa] text-xs tracking-wider opacity-60">
            ~ chaque compétence peut aider quelqu&apos;un ~
          </span>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c5c5c]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un service…"
              className="w-full bg-[#111111] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#00d4aa] transition-colors text-sm"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#111111] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] focus:outline-none focus:border-[#00d4aa] transition-colors text-sm appearance-none cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-[#5c5c5c] mx-auto mb-3" />
            <p className="text-[#a3a3a3] text-sm">
              Aucun service trouvé pour cette recherche.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-[#111111] border border-[#262626] rounded-2xl p-5 hover:border-[#00d4aa]/20 transition-all group flex flex-col"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-bangers tracking-wider text-[#00d4aa] bg-[#00d4aa]/5 rounded-full px-2 py-0.5">
                      {service.category}
                    </span>
                    <span className="text-[#00d4aa] font-semibold text-sm whitespace-nowrap ml-2">
                      {service.ratePerHour} TIME/h
                    </span>
                  </div>
                  <h3 className="font-semibold text-[#f5f5f5] mb-1 line-clamp-1 group-hover:text-[#00d4aa] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-[#a3a3a3] text-sm line-clamp-2 mb-3">
                    {service.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#262626]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#5c5c5c]">
                        par{" "}
                        <span className="text-[#a3a3a3]">{service.provider.name}</span>
                      </p>
                      <p className="text-[10px] text-[#5c5c5c] font-bangers tracking-wider">
                        NOUVEAU HÉROS
                      </p>
                    </div>
                    <Link
                      href={`/services/${service.id}`}
                      className="inline-flex items-center gap-1 bg-[#181818] hover:bg-[#222] border border-[#262626] rounded-xl px-3 py-1.5 text-xs text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
                    >
                      Voir
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
