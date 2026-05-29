import { Search, Lock, QrCode, Award } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Trouve une mission",
    description: "Propose un service ou trouve quelqu'un à aider dans ta communauté.",
    detail: "Propose ou demande une mission",
  },
  {
    icon: Lock,
    title: "Réserve avec du TIME",
    description: "Le TIME est bloqué le temps de la mission, en toute sécurité.",
    detail: "Réserve avec du TIME",
  },
  {
    icon: QrCode,
    title: "Valide avec QR/NFC",
    description: "La mission est prouvée simplement par QR code ou NFC.",
    detail: "Valide avec QR ou NFC",
  },
  {
    icon: Award,
    title: "Gagne réputation et badges",
    description: "Le Hero reçoit TIME, XP, avis et badges à chaque mission.",
    detail: "Gagne réputation, XP et badges",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-[#262626] py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-[#f5f5f5] text-center mb-4">
          Comment ça marche
        </h2>
        <p className="text-center text-[#a3a3a3] text-sm mb-10 max-w-lg mx-auto">
          De l&apos;entraide à la reconnaissance, en 4 étapes simples.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative bg-[#111111] border border-[#262626] rounded-2xl p-5 hover:border-[#00d4aa]/30 transition-all group"
              >
                {/* Step number */}
                <span className="font-bangers text-3xl text-[#00d4aa]/20 absolute top-3 right-4 select-none">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center justify-center mb-4 group-hover:bg-[#00d4aa]/20 transition-colors">
                  <Icon className="w-5 h-5 text-[#00d4aa]" />
                </div>

                <h3 className="text-[#f5f5f5] font-semibold text-base mb-2">
                  {step.title}
                </h3>
                <p className="text-[#a3a3a3] text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
