"use client";

import { Info } from "lucide-react";

export default function OnboardingBlock() {
  return (
    <div className="bg-gradient-to-r from-tb-accent/5 to-tb-surface border border-tb-accent/20 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-tb-accent/10 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-tb-accent" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-tb-text-primary mb-1">
            Comment fonctionne TimeHeroes ?
          </h3>
          <p className="text-xs text-tb-text-secondary">
            Tu utilises du <strong className="text-tb-text-primary">TIME</strong> pour réserver une
            mission. Le TIME est bloqué pendant la réservation, puis libéré après validation par{" "}
            <strong className="text-tb-text-primary">QR/NFC</strong>. Les avis,{" "}
            <strong className="text-tb-text-primary">XP</strong> et{" "}
            <strong className="text-tb-text-primary">badges</strong> valorisent ton engagement.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Réserve", desc: "avec du TIME", color: "text-blue-500" },
          { label: "Réalise", desc: "ta mission", color: "text-yellow-500" },
          { label: "Valide", desc: "par QR/NFC", color: "text-green-500" },
          { label: "Gagne", desc: "XP et badges", color: "text-purple-500" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-tb-surface border border-tb-border rounded-xl px-3 py-2.5 text-center"
          >
            <div className={`text-xs font-bold ${item.color}`}>{item.label}</div>
            <div className="text-[10px] text-tb-text-muted">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
