"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Clock, Search, MapPin, AlertCircle, Plus, Zap, Users, Calendar } from "lucide-react";
import { useSession } from "next-auth/react";
import ConnectedHeader from "@/components/ConnectedHeader";

interface UrgentRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string | null;
  department: string | null;
  region: string | null;
  online: boolean;
  urgency: string;
  hours: number;
  ratePerHour: number;
  totalTime: number;
  status: string;
  createdAt: string;
  offersCount: number;
  requester: {
    id: string;
    name: string;
    reputation: number;
  };
}

const CATEGORIES = [
  "Tous", "Tech", "Design", "Langues", "Career", "Bricolage",
  "Cuisine", "Bien-être", "Administratif", "Communauté", "Autre",
];

export default function UrgentListClient({ initialRequests }: { initialRequests: UrgentRequest[] }) {
  const { data: session } = useSession();
  const [requests, setRequests] = useState(initialRequests);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [cityFilter, setCityFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category !== "Tous") params.set("category", category);
    if (cityFilter.trim()) params.set("city", cityFilter.trim());
    if (deptFilter.trim()) params.set("department", deptFilter.trim());
    if (regionFilter.trim()) params.set("region", regionFilter.trim());
    if (onlineOnly) params.set("availableOnline", "true");
    if (urgencyFilter) params.set("urgency", urgencyFilter);

    const res = await fetch(`/api/urgent?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setRequests(data);
    }
    setLoading(false);
  }, [search, category, cityFilter, deptFilter, regionFilter, onlineOnly, urgencyFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => fetchRequests(), 300);
    return () => clearTimeout(timer);
  }, [fetchRequests]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ConnectedHeader />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-[#f59e0b]" />
            <span className="font-bangers text-[#f59e0b] text-xs tracking-wider">
              ~ besoin urgent local ~
            </span>
          </div>
          <h1 className="text-3xl font-anton tracking-wide text-gray-900 mb-1">
            Demandes urgentes
          </h1>
          <p className="text-gray-500 text-sm">
            Trouve des héros disponibles près de chez toi pour t&apos;aider rapidement.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 text-xs font-semibold mb-1">Important</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                TimeHeroes est un réseau d&apos;entraide locale, pas un service d&apos;urgence.
                Pour les urgences médicales ou de sécurité, contactez les services d&apos;urgence.
              </p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Filtrer les demandes
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <input
              type="text"
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors text-sm"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[#f59e0b] transition-colors text-sm appearance-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[#f59e0b] transition-colors text-sm appearance-none"
            >
              <option value="">Toutes urgences</option>
              <option value="today">Aujourd&apos;hui</option>
              <option value="week">Cette semaine</option>
            </select>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlineOnly}
                  onChange={(e) => setOnlineOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-200 bg-white text-[#f59e0b] focus:ring-[#f59e0b]"
                />
                <span className="text-gray-500 text-sm">En ligne</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Ville"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors text-sm"
            />
            <input
              type="text"
              placeholder="Département"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors text-sm"
            />
            <input
              type="text"
              placeholder="Région"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors text-sm"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Recherche en cours…</p>
          </div>
        )}

        {/* Results */}
        {!loading && requests.length === 0 && (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-500 mb-1">Aucune demande pour le moment</h2>
            <p className="text-gray-400 text-sm mb-4">
              Sois le premier à demander de l&apos;aide près de chez toi.
            </p>
            {session && (
              <Link
                href="/urgent/new"
                className="inline-flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold rounded-xl px-6 py-3 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Demander de l&apos;aide
              </Link>
            )}
          </div>
        )}

        {/* Liste */}
        {!loading && requests.length > 0 && (
          <div className="space-y-4">
            {requests.map((req) => (
              <Link
                key={req.id}
                href={`/urgent/${req.id}`}
                className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#f59e0b]/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bangers tracking-wider text-[#f59e0b] bg-[#f59e0b]/5 rounded-full px-2.5 py-0.5">
                        {req.category}
                      </span>
                      {req.urgency === "today" ? (
                        <span className="text-xs font-bangers tracking-wider text-red-400 bg-red-500/10 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Aujourd&apos;hui
                        </span>
                      ) : (
                        <span className="text-xs font-bangers tracking-wider text-yellow-400 bg-yellow-500/10 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Cette semaine
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-anton tracking-wide text-gray-900 group-hover:text-[#f59e0b] transition-colors mb-1">
                      {req.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-2">
                      {req.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {req.online ? "En ligne" : req.city || req.department || req.region || "Non spécifié"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {req.requester.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-[#f59e0b]">
                      {req.totalTime}
                    </div>
                    <div className="text-xs text-gray-400">TIME</div>
                    {req.offersCount > 0 && (
                      <div className="text-xs text-[#00d4aa] mt-1">
                        {req.offersCount} offre{req.offersCount > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
