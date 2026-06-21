import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import OrganizationNewClient from "./OrganizationNewClient";

export const metadata = {
  title: "Créer une organisation — TimeHeroes",
};

export default async function NewOrganizationPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/auth/signin");

  return <OrganizationNewClient />;
}
