import Link from "next/link";
import { Clock, Heart, Gift, ArrowRight } from "lucide-react";

const cards = [
  {
    icon: Clock,
    title: "Donner 1h",
    description: "Propose ton temps et aide quelqu'un près de chez toi.",
    cta: "Je propose",
    href: "/services/new",
  },
  {
    icon: Heart,
    title: "Recevoir de l'aide",
    description: "Demande un coup de main à la communauté.",
    cta: "Je cherche",
    href: "/services",
  },
  {
    icon: Gift,
    title: "Donner au pot commun",
    description: "Soutiens les missions utiles au quartier.",
    cta: "Je donne",
    href: "/wallet",
  },
];

export default function ActionCards() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-tb-text-primary text-center mb-2">
          Trois façons de faire la différence
        </h2>
        <p className="text-tb-text-secondary text-center mb-10 max-w-xl mx-auto">
          Chaque geste compte. Que tu aies du temps à offrir, un service à
          recevoir ou une envie de contribuer, il y a une place pour toi.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="bg-tb-surface border border-tb-border rounded-2xl p-6 hover:border-tb-accent/30 transition-all shadow-sm flex flex-col gap-4 group"
              >
                <div className="rounded-xl bg-tb-accent-soft w-12 h-12 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-tb-accent" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-tb-text-primary text-lg">
                    {card.title}
                  </h3>
                  <p className="text-tb-text-secondary text-sm">
                    {card.description}
                  </p>
                </div>
                <span className="text-tb-accent font-semibold text-sm flex items-center gap-1 mt-auto">
                  {card.cta}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
