import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTransactionById } from "@/lib/time-ledger";
import TransactionDetailClient from "./TransactionDetailClient";

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) redirect("/auth/signin");

  const transaction = await getTransactionById(id);
  if (!transaction) notFound();
  if (transaction.userId !== user.id) notFound();

  return <TransactionDetailClient transaction={transaction as any} />;
}
