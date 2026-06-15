import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MatchingClient from "./MatchingClient";

export const dynamic = "force-dynamic";

export default async function FacilitatorMatchingPage() {
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

  return <MatchingClient user={user} />;
}
