import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUrgentRequestById } from "@/app/urgent/actions";
import { notFound } from "next/navigation";
import UrgentDetailClient from "./UrgentDetailClient";

export const dynamic = "force-dynamic";

export default async function UrgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getUrgentRequestById(id);
  if (!request) notFound();

  // Check if current user is requester
  const session = await getServerSession(authOptions);
  let userId: string | null = null;
  let userRole: string | null = null;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
    userId = user?.id ?? null;
    userRole = user?.role ?? null;
  }

  const isRequester = userId === request.requester.id;

  // Check if current user has already offered
  let hasOffered = false;
  if (userId && !isRequester) {
    const offer = await prisma.urgentOffer.findFirst({
      where: { urgentRequestId: id, providerId: userId },
    });
    hasOffered = !!offer;
  }

  return (
    <UrgentDetailClient
      request={request}
      isRequester={isRequester}
      hasOffered={hasOffered}
      userRole={userRole}
    />
  );
}
