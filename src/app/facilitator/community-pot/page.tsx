import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getFacilitatorDashboard, getFacilitatorRequests, getPotTransactions, getFundedMissions } from "@/lib/facilitator";
import FacilitatorClient from "./FacilitatorClient";

export default async function FacilitatorCommunityPotPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, name: true },
  });

  if (!user || (user.role !== "FACILITATOR" && user.role !== "ADMIN")) {
    redirect("/dashboard");
  }

  const [dashboard, requests, transactions, fundedMissions] = await Promise.all([
    getFacilitatorDashboard(),
    getFacilitatorRequests(),
    getPotTransactions(),
    getFundedMissions(),
  ]);

  return (
    <FacilitatorClient
      user={{ id: user.id, name: user.name, role: user.role }}
      dashboard={dashboard}
      requests={requests}
      transactions={transactions}
      fundedMissions={fundedMissions}
    />
  );
}
