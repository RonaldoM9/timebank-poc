import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWalletDashboard } from "@/lib/wallet-dashboard";
import { getWalletSummary, getWalletBreakdown } from "@/lib/time-ledger";
import WalletClient from "./WalletClient";
import { getPotTransactions } from "@/lib/community-pot";

export default async function WalletPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, timeBalance: true, walletAddress: true, role: true, city: true, department: true },
  });

  if (!user) redirect("/auth/signin");

  // Legacy dashboard (backward compat)
  const dashboard = await getWalletDashboard(user.id);

  // New ledger wallet
  const newWallet = await getWalletSummary(user.id);
  const breakdown = await getWalletBreakdown(user.id);

  const potTransactions = await getPotTransactions(10);

  return (
    <WalletClient
      user={user}
      dashboard={dashboard}
      newWallet={newWallet}
      breakdown={breakdown}
      potTransactions={potTransactions.map((tx) => ({
        ...tx,
        createdAt: tx.createdAt,
      }))}
    />
  );
}
