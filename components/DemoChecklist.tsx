"use client";

import Link from "next/link";
import { CheckCircle, Circle } from "lucide-react";
import { useState } from "react";

const STEPS = [
  { label: "Consulte ton wallet TIME", href: "/wallet" },
  { label: "Explore les missions disponibles", href: "/services" },
  { label: "Choisis une mission locale", href: "/services" },
  { label: "Réserve un créneau disponible", href: "/services" },
  { label: "Discute avec le Hero dans la réservation", href: "/bookings" },
  { label: "Valide la mission avec QR/NFC", href: "/bookings" },
  { label: "Consulte tes rewards : XP, badges, niveau", href: "/rewards" },
  { label: "Consulte l'impact généré", href: "/impact" },
];

export default function DemoChecklist() {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const allDone = checked.size === STEPS.length;

  return (
    <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#f5f5f5] flex items-center gap-2">
          🎯 Parcours de découverte
        </h3>
        {allDone ? (
          <span className="text-xs text-[#00d4aa] font-medium">✅ Félicitations !</span>
        ) : (
          <span className="text-xs text-[#a3a3a3]">
            {checked.size}/{STEPS.length} complété{checked.size > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="space-y-1">
        {STEPS.map((step, i) => {
          const done = checked.has(i);
          return (
            <div key={i} className="flex items-center gap-3 py-1.5 group">
              <button
                onClick={() => toggle(i)}
                className="shrink-0 focus:outline-none"
                aria-label={done ? "Marquer non fait" : "Marquer fait"}
              >
                {done ? (
                  <CheckCircle className="w-4 h-4 text-[#00d4aa]" />
                ) : (
                  <Circle className="w-4 h-4 text-[#5c5c5c] group-hover:text-[#a3a3a3] transition-colors" />
                )}
              </button>
              <Link
                href={step.href}
                className={`text-sm transition-colors ${
                  done
                    ? "text-[#5c5c5c] line-through"
                    : "text-[#a3a3a3] hover:text-[#f5f5f5]"
                }`}
              >
                {i + 1}. {step.label}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
