import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TransferPageClient from "./TransferPageClient";

export default async function TransferPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, timeBalance: true },
  });

  if (!user) redirect("/auth/signin");

  return (
    <TransferPageClient
      userId={user.id}
      userName={user.name}
      timeBalance={user.timeBalance}
    />
  );
}
