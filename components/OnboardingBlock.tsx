"use client";

import { Info } from "lucide-react";

export default function OnboardingBlock() {
  return (
    <div className="bg-gradient-to-r from-[#0d2a24] to-[#111111] border border-[#00d4aa]/20 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#00d4aa]/10 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-[#00d4aa]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#f5f5f5] mb-1">
            Comment fonctionne TimeHeroes ?
          </h3>
          <p className="text-xs text-[#a3a3a3]">
            Tu utilises du <strong className="text-[#f5f5f5]">TIME</strong> pour réserver une
            mission. Le TIME est bloqué pendant la réservation, puis libéré après validation par{" "}
            <strong className="text-[#f5f5f5]">QR/NFC</strong>. Les avis,{" "}
            <strong className="text-[#f5f5f5]">XP</strong> et{" "}
            <strong className="text-[#f5f5f5]">badges</strong> valorisent ton engagement.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Réserve", desc: "avec du TIME", color: "text-blue-400" },
          { label: "Réalise", desc: "ta mission", color: "text-yellow-400" },
          { label: "Valide", desc: "par QR/NFC", color: "text-green-400" },
          { label: "Gagne", desc: "XP et badges", color: "text-purple-400" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-[#0a0a0a] border border-[#262626] rounded-xl px-3 py-2.5 text-center"
          >
            <div className={`text-xs font-bold ${item.color}`}>{item.label}</div>
            <div className="text-[10px] text-[#5c5c5c]">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
