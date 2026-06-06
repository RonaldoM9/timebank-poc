import { Lock, QrCode, Star, CreditCard } from 'lucide-react';

const cards = [
  {
    icon: Lock,
    title: 'Escrow TIME',
    description: 'Les heures sont sécurisées jusqu\'à validation.',
  },
  {
    icon: QrCode,
    title: 'QR/NFC',
    description: 'Échange d\'heures simple, rapide et sans contact.',
  },
  {
    icon: Star,
    title: 'Réputation',
    description: 'Un système équitable basé sur la confiance.',
  },
  {
    icon: CreditCard,
    title: 'Zéro euro',
    description: 'Ici, on échange du temps, pas de l\'argent.',
  },
];

export default function TrustRow() {
  return (
    <section className="py-12 md:py-16">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-tb-surface border border-tb-border rounded-xl p-4 hover:border-tb-accent/30 transition"
            >
              <div className="rounded-lg bg-tb-accent-soft w-10 h-10 flex items-center justify-center mb-3">
                <Icon className="w-6 h-6 text-tb-accent" />
              </div>
              <h3 className="font-semibold text-tb-text-primary text-sm mb-1">
                {card.title}
              </h3>
              <p className="text-tb-text-secondary text-xs">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
