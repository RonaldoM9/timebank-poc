"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateSlug,
  requireOrganizationPermission,
  donateToOrganizationPot,
} from "@/lib/organizations";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

function getUserId(session: any): string | null {
  return (session?.user as any)?.id || null;
}

// ─── Create organization ─────────────────────────────────────────────

export async function createOrganizationAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const description = formData.get("description") as string;
  const city = formData.get("city") as string;
  const department = formData.get("department") as string || null;
  const region = formData.get("region") as string || null;
  const websiteUrl = formData.get("websiteUrl") as string || null;
  const contactName = formData.get("contactName") as string || null;
  const contactEmail = formData.get("contactEmail") as string || null;

  if (!name || name.trim().length < 3) return { error: "Le nom doit faire au moins 3 caractères." };
  if (!type) return { error: "Le type d'organisation est obligatoire." };
  if (!city) return { error: "La ville est obligatoire." };
  if (shortDescription && shortDescription.length > 180)
    return { error: "La description courte ne doit pas dépasser 180 caractères." };
  if (description && description.length > 1500)
    return { error: "La description ne doit pas dépasser 1500 caractères." };
  if (websiteUrl && !/^https?:\/\/.+/.test(websiteUrl))
    return { error: "L'URL du site web n'est pas valide." };
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))
    return { error: "L'email de contact n'est pas valide." };

  let slug = generateSlug(name);
  let attempt = 0;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    attempt++;
    slug = `${generateSlug(name)}-${attempt}`;
  }

  const org = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: name.trim(),
        slug,
        type,
        shortDescription: shortDescription?.trim() || null,
        description: description?.trim() || null,
        city,
        department,
        region,
        websiteUrl,
        contactName: contactName?.trim() || null,
        contactEmail: contactEmail?.trim() || null,
        createdById: userId,
        status: "PENDING_REVIEW",
        members: {
          create: {
            userId,
            role: "OWNER",
            status: "ACTIVE",
          },
        },
        pot: {
          create: { balance: 0 },
        },
      },
    });
    return org;
  });

  revalidatePath("/organizations");
  return { success: true, slug: org.slug };
}

// ─── Update organization ─────────────────────────────────────────────

export async function updateOrganizationAction(
  organizationId: string,
  formData: FormData
) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const perm = await requireOrganizationPermission(
    userId,
    organizationId,
    "MANAGE_ORGANIZATION"
  );
  if (!perm.allowed) return { error: perm.error };

  const name = formData.get("name") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const description = formData.get("description") as string;
  const websiteUrl = formData.get("websiteUrl") as string || null;
  const logoUrl = formData.get("logoUrl") as string || null;
  const contactName = formData.get("contactName") as string || null;
  const contactEmail = formData.get("contactEmail") as string || null;

  const data: any = {};
  if (name && name.trim().length >= 3) data.name = name.trim();
  if (shortDescription !== null) data.shortDescription = shortDescription?.trim() || null;
  if (description !== null) data.description = description?.trim() || null;
  if (websiteUrl !== null) data.websiteUrl = websiteUrl || null;
  if (logoUrl !== null) data.logoUrl = logoUrl || null;
  if (contactName !== null) data.contactName = contactName?.trim() || null;
  if (contactEmail !== null) data.contactEmail = contactEmail?.trim() || null;

  if (Object.keys(data).length === 0) return { error: "Aucune donnée à modifier." };

  const org = await prisma.organization.update({
    where: { id: organizationId },
    data,
  });

  revalidatePath(`/organizations/${org.slug}`);
  return { success: true, slug: org.slug };
}

// ─── Archive organization ────────────────────────────────────────────

export async function archiveOrganizationAction(organizationId: string) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const perm = await requireOrganizationPermission(
    userId,
    organizationId,
    "ARCHIVE_ORGANIZATION"
  );
  if (!perm.allowed) return { error: perm.error };

  const org = await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "ARCHIVED" },
  });

  revalidatePath(`/organizations/${org.slug}`);
  return { success: true };
}

// ─── Join organization ───────────────────────────────────────────────

export async function joinOrganizationAction(organizationId: string) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { status: true },
  });
  if (!org || org.status === "SUSPENDED" || org.status === "ARCHIVED")
    return { error: "Cette organisation n'est pas accessible." };

  const existing = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
  if (existing) {
    if (existing.status === "ACTIVE") return { error: "Vous êtes déjà membre." };
    if (existing.status === "REMOVED") return { error: "Vous ne pouvez pas rejoindre cette organisation." };
    await prisma.organizationMember.update({
      where: { id: existing.id },
      data: { status: "ACTIVE", joinedAt: new Date() },
    });
  } else {
    await prisma.organizationMember.create({
      data: {
        organizationId,
        userId,
        role: "MEMBER",
        status: "ACTIVE",
        joinedAt: new Date(),
      },
    });
  }

  revalidatePath(`/organizations`);
  return { success: true };
}

// ─── Leave organization ──────────────────────────────────────────────

export async function leaveOrganizationAction(organizationId: string) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const member = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
  if (!member || member.status !== "ACTIVE")
    return { error: "Vous n'êtes pas membre actif." };

  if (member.role === "OWNER") {
    const ownerCount = await prisma.organizationMember.count({
      where: { organizationId, role: "OWNER", status: "ACTIVE" },
    });
    if (ownerCount <= 1)
      return { error: "Vous êtes le seul responsable. Transférez le rôle avant de quitter." };
  }

  await prisma.organizationMember.update({
    where: { id: member.id },
    data: { status: "REMOVED", removedAt: new Date() },
  });

  revalidatePath("/organizations");
  return { success: true };
}

// ─── Invite member ───────────────────────────────────────────────────

export async function inviteOrganizationMemberAction(
  organizationId: string,
  formData: FormData
) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const perm = await requireOrganizationPermission(
    userId,
    organizationId,
    "MANAGE_MEMBERS"
  );
  if (!perm.allowed) return { error: perm.error };

  const email = formData.get("email") as string;
  const role = (formData.get("role") as string) || "MEMBER";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "Email invalide." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Aucun utilisateur trouvé avec cet email." };

  const existing = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId: user.id } },
  });
  if (existing?.status === "ACTIVE") return { error: "Cet utilisateur est déjà membre." };

  const tokenHash = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (existing) {
    await prisma.organizationMember.update({
      where: { id: existing.id },
      data: { status: "ACTIVE", role, invitedById: userId, joinedAt: new Date() },
    });
  } else {
    await prisma.organizationMember.create({
      data: {
        organizationId,
        userId: user.id,
        role,
        status: "ACTIVE",
        invitedById: userId,
        joinedAt: new Date(),
      },
    });
  }

  await prisma.organizationInvitation.create({
    data: {
      organizationId,
      email,
      tokenHash,
      role,
      status: "ACCEPTED",
      invitedById: userId,
      acceptedById: user.id,
      acceptedAt: new Date(),
      expiresAt,
    },
  });

  revalidatePath(`/organizations/${organizationId}/members`);
  return { success: true, message: `${user.name} a été ajouté comme ${role}.` };
}

// ─── Update member role ──────────────────────────────────────────────

export async function updateOrganizationMemberRoleAction(
  organizationId: string,
  memberId: string,
  newRole: string
) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const perm = await requireOrganizationPermission(
    userId,
    organizationId,
    "MANAGE_MEMBERS"
  );
  if (!perm.allowed) return { error: perm.error };

  const member = await prisma.organizationMember.findUnique({ where: { id: memberId } });
  if (!member || member.organizationId !== organizationId)
    return { error: "Membre introuvable." };
  if (member.role === "OWNER") return { error: "Impossible de modifier le rôle du responsable principal." };

  await prisma.organizationMember.update({
    where: { id: memberId },
    data: { role: newRole },
  });

  revalidatePath(`/organizations/${organizationId}/members`);
  return { success: true };
}

// ─── Remove member ───────────────────────────────────────────────────

export async function removeOrganizationMemberAction(
  organizationId: string,
  memberId: string
) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const perm = await requireOrganizationPermission(
    userId,
    organizationId,
    "MANAGE_MEMBERS"
  );
  if (!perm.allowed) return { error: perm.error };

  const member = await prisma.organizationMember.findUnique({ where: { id: memberId } });
  if (!member || member.organizationId !== organizationId)
    return { error: "Membre introuvable." };
  if (member.role === "OWNER") return { error: "Impossible de retirer le responsable principal." };

  await prisma.organizationMember.update({
    where: { id: memberId },
    data: { status: "REMOVED", removedAt: new Date() },
  });

  revalidatePath(`/organizations/${organizationId}/members`);
  return { success: true };
}

// ─── Admin: Verify organization ──────────────────────────────────────

export async function verifyOrganizationAction(organizationId: string) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role !== "ADMIN") return { error: "Action réservée aux administrateurs." };

  const org = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      isVerified: true,
      status: "VERIFIED",
      verifiedAt: new Date(),
      verifiedById: userId,
    },
  });

  revalidatePath(`/organizations/${org.slug}`);
  return { success: true };
}

export async function suspendOrganizationAction(organizationId: string) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role !== "ADMIN") return { error: "Action réservée aux administrateurs." };

  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "SUSPENDED" },
  });

  revalidatePath("/admin/organizations");
  return { success: true };
}

export async function activateOrganizationAction(organizationId: string) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role !== "ADMIN") return { error: "Action réservée aux administrateurs." };

  const org = await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "ACTIVE" },
  });

  revalidatePath("/admin/organizations");
  return { success: true };
}

// ─── Pot donation ────────────────────────────────────────────────────

export async function donateToOrganizationPotAction(
  organizationId: string,
  amount: number
) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const result = await donateToOrganizationPot(
    organizationId,
    userId,
    amount
  );

  if (result.success) {
    revalidatePath(`/organizations/${organizationId}/pot`);
  }
  return result;
}
