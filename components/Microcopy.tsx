"use client";

import { Info } from "lucide-react";

interface MicrocopyProps {
  term: string;
  explanation: string;
}

const MICROCOPIES: Record<string, string> = {
  time: "Le TIME représente du temps d'entraide. 1 TIME = 1 heure d'aide.",
  escrow: "Le TIME est bloqué pendant la réservation puis libéré quand la mission est validée.",
  qr_nfc: "La preuve QR/NFC permet de confirmer que la mission a bien été réalisée.",
  calendar: "Choisis un créneau disponible pour réserver une mission au bon moment.",
  discussion: "Gardez les échanges dans TimeHeroes pour protéger vos informations personnelles.",
  xp_badges: "Les XP et badges reconnaissent ton engagement, mais ne remplacent pas le TIME.",
};

export function Microcopy({ term }: { term: keyof typeof MICROCOPIES }) {
  const explanation = MICROCOPIES[term];
  if (!explanation) return null;

  return (
    <span className="group relative inline-flex items-center">
      <Info className="w-3.5 h-3.5 text-[#5c5c5c] hover:text-[#00d4aa] cursor-help transition-colors ml-1" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 rounded-xl bg-[#181818] border border-[#262626] text-[10px] leading-relaxed text-[#a3a3a3] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl whitespace-normal text-left">
        {explanation}
      </span>
    </span>
  );
}

export function MicrocopyInline({ term, explanation }: MicrocopyProps) {
  return (
    <span className="block text-[11px] text-[#5c5c5c] italic mt-1 leading-relaxed">
      {explanation}
      <span className="block text-[10px] text-[#3a3a3a] not-italic mt-0.5">
        {term === "TIME" && MICROCOPIES.time}
        {term === "Escrow" && MICROCOPIES.escrow}
        {term === "QR/NFC" && MICROCOPIES.qr_nfc}
        {term === "Calendrier" && MICROCOPIES.calendar}
        {term === "Discussion" && MICROCOPIES.discussion}
        {term === "XP/Badges" && MICROCOPIES.xp_badges}
      </span>
    </span>
  );
}
