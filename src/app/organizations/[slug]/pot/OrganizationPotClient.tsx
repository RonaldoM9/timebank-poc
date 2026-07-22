"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { donateToOrganizationPotAction } from "@/app/actions/organizations";
import ConnectedHeader from "@/components/ConnectedHeader";
import {
  ArrowLeft,
  Heart,
  Gift,
  Loader2,
  User,
  Calendar,
  TrendingUp,
  Sparkles,
  Clock,
  Wallet,
  Send,
  Info,
} from "lucide-react";
import Link from "next/link";

type PotTransaction = {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  fromUserId: string | null;
  createdAt: string;
  fromUser?: { name: string } | null;
};

type Props = {
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  potBalance: number;
  transactions: PotTransaction[];
  myRole: string | null;
};

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  DONATION: { label: "Don", color: "text-emerald-600", bg: "bg-emerald-100", icon: Heart },
  FUNDING: { label: "Financement", color: "text-blue-600", bg: "bg-blue-100", icon: TrendingUp },
  ADJUSTMENT: { label: "Ajustement", color: "text-amber-600", bg: "bg-amber-100", icon: Sparkles },
  REFUND: { label: "Remboursement", color: "text-violet-600", bg: "bg-violet-100", icon: Clock },
};

export default function OrganizationPotClient({
  organizationId,
  organizationSlug,
  organizationName,
  potBalance,
  transactions,
  myRole,
}: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // FACILITATOR, ADMIN, and OWNER can manage the pot (future: retraits, ajustements, financements)
  const canManage =
    myRole === "FACILITATOR" || myRole === "ADMIN" || myRole === "OWNER";
  const canDonate = myRole !== null; // tous les membres actifs peuvent donner
  const isMember = myRole !== null;

  async function handleDonate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);

    const parsed = parseInt(amount, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Veuillez entrer un montant valide.");
      setPending(false);
      return;
    }

    const result = await donateToOrganizationPotAction(organizationId, parsed);

    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    setSuccess(`Vous avez donné ${parsed} TIME au pot !`);
    setAmount("");
    setPending(false);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <ConnectedHeader orgRole={myRole} />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-rose-500 to-pink-600 p-6 sm:p-8">
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/5" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <Link
                href={`/organizations/${organizationSlug}/dashboard`}
                className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Tableau de bord
              </Link>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                  <Gift className="w-7 h-7 text-white/80" />
                  {canManage ? "Pot TIME — " : "Donner au pot — "}
                  {organizationName}
                </h1>
                {myRole && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/30 bg-white/10 text-white`}>
                    <Info className="w-3 h-3" />
                    {myRole === "ADMIN" || myRole === "OWNER" ? "Responsable" : myRole === "FACILITATOR" ? "Facilitateur" : "Membre"}
                  </span>
                )}
              </div>
              <p className="text-white/70 text-sm">
                {canManage
                  ? "Gérez le pot commun · Suivez les dons et financez les missions solidaires"
                  : "Donnez du TIME pour soutenir les missions et projets de votre organisation"}
              </p>
            </div>

            {/* Balance in hero */}
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-white">{potBalance}</div>
              <div className="text-sm text-white/70 mt-1">TIME dans le pot</div>
            </div>
          </div>
        </div>

        {/* ── Two-column: Balance + Donation form ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Balance card */}
          <div className="rounded-2xl bg-white border border-[#E0DDD8] p-6 flex flex-col items-center justify-center text-center hover:shadow-sm transition-shadow">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-rose-500" />
            </div>
            <div className="text-5xl font-bold text-[#101010]">{potBalance}</div>
            <div className="text-sm text-[#9A9EA2] mt-1">TIME disponibles</div>
            <div className="flex items-center gap-2 mt-4 text-xs text-[#9A9EA2]">
              <Clock className="w-3 h-3" />
              <span>1 TIME = 1 heure de service</span>
            </div>
          </div>

          {/* Donation form card */}
          <div className="rounded-2xl bg-white border border-[#E0DDD8] p-6 hover:shadow-sm transition-shadow">
            <h2 className="text-sm font-semibold text-[#101010] mb-1 flex items-center gap-2">
              <Send className="w-4 h-4 text-rose-500" />
              Faire un don au pot
            </h2>
            <p className="text-xs text-[#9A9EA2] mb-4">
              Chaque don alimente le pot commun de l'organisation.
            </p>
            {!isMember ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <p className="text-xs text-amber-700">
                  Vous devez être membre de l'organisation pour faire un don.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDonate} className="space-y-3">
              <div>
                <label htmlFor="donationAmount" className="block text-xs text-[#5F6368] mb-1.5">
                  Montant (TIME)
                </label>
                <div className="relative">
                  <input
                    id="donationAmount"
                    name="amount"
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10"
                    className="w-full bg-[#F8F5F0] border border-[#E0DDD8] rounded-xl px-4 py-3 text-[#101010] text-lg placeholder:text-[#9A9EA2] focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/20 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#9A9EA2] font-medium">
                    TIME
                  </span>
                </div>
              </div>
              <button
                type="submit"
                disabled={pending}
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-3 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-md"
              >
                {pending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    Donner
                  </>
                )}
              </button>
            </form>
            )}
            {error && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="text-xs text-emerald-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {success}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Transaction History ── */}
        <div className="rounded-2xl bg-white border border-[#E0DDD8] p-6">
          <h2 className="text-sm font-semibold text-[#101010] mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00A889]" />
            Historique des transactions
          </h2>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-[#E0DDD8] rounded-xl bg-[#F8F5F0]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 text-rose-300" />
              </div>
              <p className="text-sm text-[#9A9EA2]">
                Aucune transaction pour le moment.
              </p>
              <p className="text-xs text-[#9A9EA2] mt-1">
                Les dons des membres apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const config = typeConfig[tx.type] || typeConfig.DONATION;
                const Icon = config.icon;
                return (
                  <div
                    key={tx.id}
                    className="group flex items-center justify-between p-3.5 rounded-xl bg-[#F8F5F0] border border-[#E0DDD8] hover:border-rose-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#101010]">
                          {config.label}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                          {tx.fromUser && (
                            <span className="text-xs text-[#5F6368] flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {tx.fromUser.name}
                            </span>
                          )}
                          {tx.description && (
                            <span className="text-xs text-[#9A9EA2]">
                              {tx.description}
                            </span>
                          )}
                          <span className="text-xs text-[#9A9EA2] flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(tx.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${config.color}`}>
                      +{tx.amount} TIME
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Info card ── */}
        <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-white border border-rose-100 p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#101010]">À quoi sert le pot TIME ?</p>
              <p className="text-xs text-[#5F6368] mt-1">
                {canManage
                  ? "Le pot TIME permet à votre organisation de collecter les dons des membres pour financer des missions solidaires, soutenir des bénéficiaires, ou récompenser l'engagement. En tant que gestionnaire, vous pouvez suivre les transactions et allouer ces ressources."
                  : "Le pot TIME collecte les dons des membres de l'organisation. Chaque don est tracé et visible dans l'historique. En donnant, vous contribuez directement aux missions et projets solidaires de votre organisation."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
