"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateSlug,
  requireOrganizationPermission,
  donateToOrganizationPot,
} from "@/lib/organizations";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  potDonationSchema,
  organizationIdSchema,
  memberIdSchema,
} from "@/lib/organization-schemas";
import { ORGANIZATION_ROLES } from "@/lib/organization-labels";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { z } from "zod";

// ─── Helper ──────────────────────────────────────────────────────────

function getUserId(session: any): string | null {
  return (session?.user as any)?.id || null;
}

// ─── 1. Create organization ─────────────────────────────────────────

export async function createOrganizationAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  // Zod validation
  const raw = {
    name: formData.get("name"),
    type: formData.get("type"),
    shortDescription: formData.get("shortDescription") || undefined,
    description: formData.get("description") || undefined,
    city: formData.get("city"),
    department: formData.get("department") || undefined,
    region: formData.get("region") || undefined,
    websiteUrl: formData.get("websiteUrl") || undefined,
    contactName: formData.get("contactName") || undefined,
    contactEmail: formData.get("contactEmail") || undefined,
  };

  const parsed = createOrganizationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, type, shortDescription, description, city, department, region, websiteUrl, contactName, contactEmail } = parsed.data;

  // Generate unique slug
  let slug = generateSlug(name);
  let attempt = 0;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    attempt++;
    slug = `${generateSlug(name)}-${attempt}`;
  }

  const org = await prisma.$transaction(async (tx) => {
    return tx.organization.create({
      data: {
        name,
        slug,
        type,
        shortDescription: shortDescription || null,
        description: description || null,
        city,
        department: department || null,
        region: region || null,
        websiteUrl: websiteUrl || null,
        contactName: contactName || null,
        contactEmail: contactEmail || null,
        createdById: userId,
        status: "PENDING_REVIEW",
        members: {
          create: { userId, role: "OWNER", status: "ACTIVE" },
        },
        pot: { create: { balance: 0 } },
      },
    });
  });

  revalidatePath("/organizations");
  return { success: true, slug: org.slug };
}

// ─── 2. Update organization ─────────────────────────────────────────

export async function updateOrganizationAction(
  organizationId: string,
  formData: FormData
) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  // Validate org ID
  const idResult = organizationIdSchema.safeParse(organizationId);
  if (!idResult.success) return { error: "ID d'organisation invalide." };

  // Check permission
  const perm = await requireOrganizationPermission(
    userId,
    organizationId,
    "MANAGE_ORGANIZATION"
  );
  if (!perm.allowed) return { error: perm.error };

  // Zod validation
  const raw = {
    name: formData.get("name") || undefined,
    shortDescription: formData.get("shortDescription") === "" ? null : formData.get("shortDescription") || undefined,
    description: formData.get("description") === "" ? null : formData.get("description") || undefined,
    websiteUrl: formData.get("websiteUrl") === "" ? null : formData.get("websiteUrl") || undefined,
    logoUrl: formData.get("logoUrl") === "" ? null : formData.get("logoUrl") || undefined,
    contactName: formData.get("contactName") === "" ? null : formData.get("contactName") || undefined,
    contactEmail: formData.get("contactEmail") === "" ? null : formData.get("contactEmail") || undefined,
  };

  const parsed = updateOrganizationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  // Strip undefined (not sent) but keep null (intentionally cleared)
  const cleanData: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) cleanData[key] = value;
  }

  if (Object.keys(cleanData).length === 0) {
    return { error: "Aucune donnée à modifier." };
  }

  const org = await prisma.organization.update({
    where: { id: organizationId },
    data: cleanData,
  });

  revalidatePath(`/organizations/${org.slug}`);
  return { success: true, slug: org.slug };
}

// ─── 3. Archive organization ────────────────────────────────────────

export async function archiveOrganizationAction(organizationId: string) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const idResult = organizationIdSchema.safeParse(organizationId);
  if (!idResult.success) return { error: "ID d'organisation invalide." };

  const perm = await requireOrganizationPermission(
    userId,
    organizationId,
    "ARCHIVE_ORGANIZATION"
  );
  if (!perm.allowed) return { error: perm.error };

  // Check org is not already archived
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { status: true, slug: true },
  });
  if (!org) return { error: "Organisation introuvable." };
  if (org.status === "ARCHIVED") return { error: "Cette organisation est déjà archivée." };

  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "ARCHIVED" },
  });

  revalidatePath(`/organizations/${org.slug}`);
  return { success: true };
}

// ─── 4. Join organization ───────────────────────────────────────────

export async function joinOrganizationAction(organizationId: string) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const idResult = organizationIdSchema.safeParse(organizationId);
  if (!idResult.success) return { error: "ID d'organisation invalide." };

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { status: true },
  });
  if (!org) return { error: "Organisation introuvable." };
  if (org.status === "SUSPENDED") return { error: "Cette organisation est suspendue." };
  if (org.status === "ARCHIVED") return { error: "Cette organisation est archivée." };

  const existing = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });

  if (existing) {
    if (existing.status === "ACTIVE") return { error: "Vous êtes déjà membre." };
    if (existing.status === "REMOVED") return { error: "Vous ne pouvez pas rejoindre cette organisation." };
    // Reactivate INVITED
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

  revalidatePath("/organizations");
  return { success: true };
}

// ─── 5. Leave organization ──────────────────────────────────────────

export async function leaveOrganizationAction(organizationId: string) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const idResult = organizationIdSchema.safeParse(organizationId);
  if (!idResult.success) return { error: "ID d'organisation invalide." };

  const member = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
  if (!member || member.status !== "ACTIVE") {
    return { error: "Vous n'êtes pas membre actif." };
  }

  if (member.role === "OWNER") {
    const ownerCount = await prisma.organizationMember.count({
      where: { organizationId, role: "OWNER", status: "ACTIVE" },
    });
    if (ownerCount <= 1) {
      return {
        error: "Vous êtes le seul responsable. Transférez le rôle avant de quitter.",
      };
    }
  }

  await prisma.organizationMember.update({
    where: { id: member.id },
    data: { status: "REMOVED", removedAt: new Date() },
  });

  revalidatePath("/organizations");
  return { success: true };
}

// ─── 6. Invite member ───────────────────────────────────────────────

export async function inviteOrganizationMemberAction(
  organizationId: string,
  formData: FormData
) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const idResult = organizationIdSchema.safeParse(organizationId);
  if (!idResult.success) return { error: "ID d'organisation invalide." };

  const perm = await requireOrganizationPermission(
    userId,
    organizationId,
    "MANAGE_MEMBERS"
  );
  if (!perm.allowed) return { error: perm.error };

  // Zod validation
  const raw = {
    email: formData.get("email"),
    role: formData.get("role") || "MEMBER",
  };
  const parsed = inviteMemberSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, role } = parsed.data;

  // Find target user
  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) return { error: "Aucun utilisateur trouvé avec cet email." };

  // Cannot invite yourself
  if (targetUser.id === userId) return { error: "Vous ne pouvez pas vous inviter vous-même." };

  // Check existing membership
  const existing = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId: targetUser.id } },
  });
  if (existing?.status === "ACTIVE") {
    return { error: "Cet utilisateur est déjà membre." };
  }

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
        userId: targetUser.id,
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
      acceptedById: targetUser.id,
      acceptedAt: new Date(),
      expiresAt,
    },
  });

  revalidatePath(`/organizations/${organizationId}/members`);
  return { success: true, message: `${targetUser.name} a été ajouté comme ${role}.` };
}

// ─── 7. Update member role ──────────────────────────────────────────

export async function updateOrganizationMemberRoleAction(
  organizationId: string,
  memberId: string,
  newRole: string
) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const idResult = organizationIdSchema.safeParse(organizationId);
  if (!idResult.success) return { error: "ID d'organisation invalide." };

  const perm = await requireOrganizationPermission(
    userId,
    organizationId,
    "MANAGE_MEMBERS"
  );
  if (!perm.allowed) return { error: perm.error };

  // Zod validate role
  const parsed = updateMemberRoleSchema.safeParse({ newRole });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const member = await prisma.organizationMember.findUnique({
    where: { id: memberId },
  });
  if (!member || member.organizationId !== organizationId) {
    return { error: "Membre introuvable." };
  }
  if (member.role === "OWNER") {
    return { error: "Impossible de modifier le rôle du responsable principal." };
  }

  await prisma.organizationMember.update({
    where: { id: memberId },
    data: { role: newRole },
  });

  revalidatePath(`/organizations/${organizationId}/members`);
  return { success: true };
}

// ─── 8. Remove member ───────────────────────────────────────────────

export async function removeOrganizationMemberAction(
  organizationId: string,
  memberId: string
) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const idResult = organizationIdSchema.safeParse(organizationId);
  if (!idResult.success) return { error: "ID d'organisation invalide." };
  const midResult = memberIdSchema.safeParse(memberId);
  if (!midResult.success) return { error: "ID de membre invalide." };

  const perm = await requireOrganizationPermission(
    userId,
    organizationId,
    "MANAGE_MEMBERS"
  );
  if (!perm.allowed) return { error: perm.error };

  const member = await prisma.organizationMember.findUnique({
    where: { id: memberId },
  });
  if (!member || member.organizationId !== organizationId) {
    return { error: "Membre introuvable." };
  }
  if (member.role === "OWNER") {
    return { error: "Impossible de retirer le responsable principal." };
  }
  // Can't remove yourself via this action — use leave instead
  if (member.userId === userId) {
    return { error: "Utilisez 'Quitter' pour vous retirer vous-même." };
  }

  await prisma.organizationMember.update({
    where: { id: memberId },
    data: { status: "REMOVED", removedAt: new Date() },
  });

  revalidatePath(`/organizations/${organizationId}/members`);
  return { success: true };
}

// ─── 9. Admin: Verify organization ──────────────────────────────────

export async function verifyOrganizationAction(organizationId: string) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const idResult = organizationIdSchema.safeParse(organizationId);
  if (!idResult.success) return { error: "ID d'organisation invalide." };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") return { error: "Action réservée aux administrateurs." };

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { status: true, isVerified: true, slug: true },
  });
  if (!org) return { error: "Organisation introuvable." };
  if (org.isVerified) return { error: "Cette organisation est déjà vérifiée." };
  if (org.status === "ARCHIVED") return { error: "Impossible de vérifier une organisation archivée." };
  if (org.status === "SUSPENDED") return { error: "Impossible de vérifier une organisation suspendue." };

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      isVerified: true,
      status: "VERIFIED",
      verifiedAt: new Date(),
      verifiedById: userId,
    },
  });

  revalidatePath(`/organizations`);
  return { success: true };
}

// ─── 10. Admin: Suspend organization ────────────────────────────────

export async function suspendOrganizationAction(organizationId: string) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const idResult = organizationIdSchema.safeParse(organizationId);
  if (!idResult.success) return { error: "ID d'organisation invalide." };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") return { error: "Action réservée aux administrateurs." };

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { status: true, slug: true },
  });
  if (!org) return { error: "Organisation introuvable." };
  if (org.status === "SUSPENDED") return { error: "Cette organisation est déjà suspendue." };
  if (org.status === "ARCHIVED") return { error: "Impossible de suspendre une organisation archivée." };

  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "SUSPENDED" },
  });

  revalidatePath("/admin/organizations");
  return { success: true };
}

// ─── 11. Admin: Activate organization ───────────────────────────────

export async function activateOrganizationAction(organizationId: string) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const idResult = organizationIdSchema.safeParse(organizationId);
  if (!idResult.success) return { error: "ID d'organisation invalide." };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") return { error: "Action réservée aux administrateurs." };

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { status: true, slug: true },
  });
  if (!org) return { error: "Organisation introuvable." };
  if (org.status === "ACTIVE") return { error: "Cette organisation est déjà active." };
  if (org.status === "ARCHIVED") return { error: "Impossible d'activer une organisation archivée." };

  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "ACTIVE" },
  });

  revalidatePath("/admin/organizations");
  return { success: true };
}

// ─── 12. Pot donation ───────────────────────────────────────────────

export async function donateToOrganizationPotAction(
  organizationId: string,
  amount: number
) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const idResult = organizationIdSchema.safeParse(organizationId);
  if (!idResult.success) return { error: "ID d'organisation invalide." };

  const parsed = potDonationSchema.safeParse({ amount });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await donateToOrganizationPot(organizationId, userId, amount);

  if (result.success) {
    revalidatePath(`/organizations/${organizationId}/pot`);
  }
  return result;
}
