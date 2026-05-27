import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UrgentNewClient from "./UrgentNewClient";

export const dynamic = "force-dynamic";

export default async function UrgentNewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { city: true, department: true, region: true },
  });

  return (
    <UrgentNewClient
      prefill={{
        city: user?.city || undefined,
        department: user?.department || undefined,
        region: user?.region || undefined,
      }}
    />
  );
}
