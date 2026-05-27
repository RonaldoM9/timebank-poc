import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LocationFormClient from "./LocationFormClient";

export default async function SettingsLocationPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      city: true,
      postalCode: true,
      department: true,
      region: true,
      country: true,
      serviceRadiusKm: true,
      locationVisibility: true,
      availableOnline: true,
    },
  });

  if (!user) redirect("/auth/signin");

  const defaultValues = {
    city: user.city ?? "",
    postalCode: user.postalCode ?? "",
    department: user.department ?? "",
    region: user.region ?? "",
    country: user.country ?? "France",
    serviceRadiusKm: user.serviceRadiusKm ?? 10,
    locationVisibility: user.locationVisibility ?? "city",
    availableOnline: user.availableOnline ?? false,
  };

  return <LocationFormClient defaultValues={defaultValues} />;
}
