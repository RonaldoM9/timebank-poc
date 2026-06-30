import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserLedger } from "@/lib/time-ledger";
import HistoryClient from "./HistoryClient";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) redirect("/auth/signin");

  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;

  const result = await getUserLedger(user.id, {
    type: params.type,
    status: params.status,
    page,
    limit: 20,
  });

  return (
    <HistoryClient
      transactions={result.transactions as any}
      total={result.total}
      page={result.page}
      totalPages={result.totalPages}
      currentType={params.type}
    />
  );
}
