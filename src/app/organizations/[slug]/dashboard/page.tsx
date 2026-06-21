import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { getOrganizationDashboard } from "@/lib/organizations";
import OrganizationDashboardClient from "./OrganizationDashboardClient";

export default async function OrganizationDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/auth/signin");

  const dashboard = await getOrganizationDashboard(slug, userId);
  if (!dashboard) notFound();

  return <OrganizationDashboardClient dashboard={dashboard} />;
}
