import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getMySlots } from "./actions";
import AvailabilityClient from "./AvailabilityClient";

export const metadata = {
  title: "Disponibilités — TimeHeroes",
  description: "Gère tes créneaux de disponibilité pour recevoir des réservations.",
};

export default async function AvailabilityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const slots = await getMySlots();

  return <AvailabilityClient initialSlots={slots} />;
}
