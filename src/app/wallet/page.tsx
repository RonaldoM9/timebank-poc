import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import WalletClient from "./WalletClient";
import { getCommunityPot, getPotTransactions } from "@/lib/community-pot";

export default async function WalletPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, timeBalance: true, walletAddress: true, role: true },
  });

  if (!user) redirect("/auth/signin");

  const rawTransactions = await prisma.transaction.findMany({
    where: {
      OR: [{ fromId: user.id }, { toId: user.id }],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const transactions = rawTransactions.map((tx) => ({
    ...tx,
    createdAt: tx.createdAt.toISOString(),
  }));

  const pot = await getCommunityPot();
  const potTransactions = await getPotTransactions(5);

  return (
    <WalletClient
      user={user}
      transactions={transactions}
      pot={pot}
      potTransactions={potTransactions}
    />
  );
}
