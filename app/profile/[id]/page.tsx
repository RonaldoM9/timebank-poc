import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPublicProfile } from "@/lib/profile";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await getPublicProfile(id);
  if (!profile) notFound();

  return <ProfileClient profile={profile} />;
}
