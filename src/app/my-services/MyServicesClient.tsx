"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Plus, Power, PowerOff, ExternalLink } from "lucide-react";
import { toggleServiceStatus } from "@/app/services/actions";
import ConnectedHeader from "@/components/ConnectedHeader";
import EmptyState from "@/components/EmptyState";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  ratePerHour: number;
  status: string;
  createdAt: string;
}

export default function MyServicesClient({ services }: { services: Service[] }) {
  const router = useRouter();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleToggle(serviceId: string) {
    setTogglingId(serviceId);
    await toggleServiceStatus(serviceId);
    setTogglingId(null);
    router.refresh();
  }

  if (services.length === 0) {
    return (
      <>
        <ConnectedHeader />
        <EmptyState
          title="Aucun service publié"
          description="Tu n'as pas encore proposé de mission. Publie ton premier service !"
          actionLabel="Proposer un service"
          actionHref="/services/new"
        />
      </>
    );
  }

  return (
    <>
      <ConnectedHeader />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-anton tracking-wide text-tb-text-primary mb-1">
              Mes services
            </h1>
            <p className="text-tb-text-secondary text-sm">
              {services.filter((s) => s.status === "active").length} actif
             {services.filter((s) => s.status === "active").length > 1 ? "s" : ""}
              {" — "}
              {services.filter((s) => s.status === "inactive").length} inactif
              {services.filter((s) => s.status === "inactive").length > 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/services/new"
            className="inline-flex items-center gap-2 bg-tb-accent hover:bg-tb-accent-hover text-white font-semibold rounded-xl px-4 py-2 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau service
          </Link>
        </div>

        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-tb-surface border border-tb-border rounded-2xl p-5 hover:border-[#333] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-tb-text-primary truncate">
                      {service.title}
                    </h3>
                    <span
                      className={`text-xs font-bangers tracking-wider px-2 py-0.5 rounded-full ${
                        service.status === "active"
                          ? "bg-tb-accent/10 text-tb-accent"
                          : "bg-[#5c5c5c]/10 text-tb-text-muted"
                      }`}
                    >
                      {service.status === "active" ? "ACTIF" : "INACTIF"}
                    </span>
                  </div>
                  <p className="text-tb-text-secondary text-sm line-clamp-2 mb-2">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-tb-text-muted">
                    <span className="bg-tb-surface-elevated border border-tb-border rounded-lg px-2 py-0.5">
                      {service.category}
                    </span>
                    1 TIME/h
                    <span>
                      Créé le{" "}
                      {new Date(service.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    href={`/services/${service.id}`}
                    className="inline-flex items-center justify-center gap-1.5 bg-tb-surface hover:bg-tb-surface-elevated border border-tb-border rounded-xl px-3 py-2 text-tb-text-secondary hover:text-tb-text-primary text-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Voir
                  </Link>
                  <button
                    onClick={() => handleToggle(service.id)}
                    disabled={togglingId === service.id}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-colors ${
                      service.status === "active"
                        ? "bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-800/50"
                        : "bg-tb-accent/10 hover:bg-tb-accent/20 text-tb-accent border border-tb-accent/30"
                    } disabled:opacity-50`}
                  >
                    {service.status === "active" ? (
                      <>
                        <PowerOff className="w-3.5 h-3.5" />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <Power className="w-3.5 h-3.5" />
                        Activer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
