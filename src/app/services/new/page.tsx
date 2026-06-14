import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ServiceNewClient from "./ServiceNewClient";

export default async function ServiceNewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  return <ServiceNewClient />;
}
