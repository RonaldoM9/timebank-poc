import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getFacilitatorNetworkDashboard } from "@/lib/facilitator-network";
import NetworkClient from "./NetworkClient";

export const dynamic = "force-dynamic";

export default async function FacilitatorNetworkPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, role: true },
  });

  if (!user || (user.role !== "FACILITATOR" && user.role !== "ADMIN")) {
    redirect("/dashboard");
  }

  const dashboard = await getFacilitatorNetworkDashboard();

  return (
    <NetworkClient user={user} initialDashboard={dashboard} />
  );
}
