import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserBalance } from "@/lib/ledger";
import BookServiceClient from "./BookServiceClient";

export default async function BookServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true },
  });
  if (!user) redirect("/auth/signin");

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      provider: {
        select: { id: true, name: true, walletAddress: true },
      },
    },
  });

  if (!service) redirect("/services");

  const balance = await getUserBalance(user.id);

  const serialized = {
    ...service,
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  };

  const isOwner = service.provider.id === user.id;

  return (
    <BookServiceClient
      service={serialized}
      balance={balance}
      isOwner={isOwner}
    />
  );
}
