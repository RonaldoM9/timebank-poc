import {
  Wallet,
  Store,
  ShieldCheck,
  QrCode,
  SmartphoneNfc,
  Star,
  Users,
  Zap,
  Gamepad2,
  Send,
} from "lucide-react";

const features = [
  { icon: Wallet, title: "Wallet TIME", desc: "Suivi du solde et de l'historique des échanges." },
  { icon: Store, title: "Marketplace de missions", desc: "Proposer ou réserver des services locaux." },
  { icon: ShieldCheck, title: "Escrow TIME", desc: "Le TIME est bloqué puis libéré après validation." },
  { icon: QrCode, title: "QR Proof", desc: "Validation de mission par QR code." },
  { icon: SmartphoneNfc, title: "NFC Proof", desc: "Validation physique rapide via NFC." },
  { icon: Star, title: "Réputation", desc: "Avis et score de confiance après mission." },
  { icon: Users, title: "Local Heroes", desc: "Découverte de Heroes proches de sa zone." },
  { icon: Zap, title: "Urgent Help", desc: "Demande d'aide rapide pour besoins ponctuels." },
  { icon: Gamepad2, title: "Gamification", desc: "XP, badges, niveaux et quêtes." },
  { icon: Send, title: "Transfer TIME", desc: "Envoi de TIME entre Heroes." },
];

export default function FeatureGrid() {
  return (
    <section className="border-t border-[#262626] py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-[#f5f5f5] text-center mb-4">
          Des fonctionnalités conçues pour l&apos;entraide
        </h2>
        <p className="text-center text-[#a3a3a3] text-sm mb-10 max-w-lg mx-auto">
          Le POC embarque déjà un ensemble complet de fonctionnalités.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-[#111111] border border-[#262626] rounded-xl p-4 hover:border-[#00d4aa]/30 hover:bg-[#141414] transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center justify-center mb-3 group-hover:bg-[#00d4aa]/20 transition-colors">
                  <Icon className="w-4 h-4 text-[#00d4aa]" />
                </div>
                <h3 className="text-[#f5f5f5] font-semibold text-sm mb-1">
                  {feature.title}
                </h3>
                <p className="text-[#a3a3a3] text-xs leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
