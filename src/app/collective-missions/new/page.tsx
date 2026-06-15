import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ConnectedHeader from "@/components/ConnectedHeader";
import NewMissionClient from "./NewMissionClient";

export default async function NewCollectiveMissionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  return (
    <>
      <ConnectedHeader />
      <NewMissionClient />
    </>
  );
}
