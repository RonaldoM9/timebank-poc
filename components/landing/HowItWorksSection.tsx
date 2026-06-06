import { Search, Lock, CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Search,
    title: "Propose ou demande une mission",
    description: "Publie un service ou trouve un coup de main près de chez toi.",
  },
  {
    number: 2,
    icon: Lock,
    title: "Les TIME sont sécurisés",
    description: "Les TIME sont bloqués pendant la réservation.",
  },
  {
    number: 3,
    icon: CheckCircle2,
    title: "Valide et gagne en confiance",
    description: "La mission est confirmée par QR/NFC ou validation, puis chacun gagne en réputation.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-tb-text-primary text-center">
          Comment ça marche
        </h2>
        <p className="text-tb-text-secondary text-center mt-2 mb-10">
          En trois étapes simples, rejoins l&apos;entraide locale.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="flex flex-col items-center text-center">
                <span className="bg-tb-accent-soft text-tb-accent w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  {step.number}
                </span>
                <Icon className="w-6 h-6 text-tb-accent mb-2" />
                <h3 className="font-semibold text-tb-text-primary">
                  {step.title}
                </h3>
                <p className="text-sm text-tb-text-secondary mt-1">
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
