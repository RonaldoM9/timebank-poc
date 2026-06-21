// ─── Zod validation schemas for Organization operations ──────────────

import { z } from "zod";
import { ORGANIZATION_TYPES, ORGANIZATION_ROLES } from "./organization-labels";

// ─── Create organization ─────────────────────────────────────────────

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(3, "Le nom doit faire au moins 3 caractères.")
    .max(100, "Le nom ne doit pas dépasser 100 caractères.")
    .trim(),
  type: z
    .string()
    .refine((val) => Object.keys(ORGANIZATION_TYPES).includes(val), {
      message: "Type d'organisation invalide.",
    }),
  shortDescription: z
    .string()
    .max(180, "La description courte ne doit pas dépasser 180 caractères.")
    .trim()
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(1500, "La description ne doit pas dépasser 1500 caractères.")
    .trim()
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .min(1, "La ville est obligatoire.")
    .max(100, "La ville ne doit pas dépasser 100 caractères.")
    .trim(),
  department: z
    .string()
    .max(100)
    .trim()
    .optional()
    .or(z.literal("")),
  region: z
    .string()
    .max(100)
    .trim()
    .optional()
    .or(z.literal("")),
  websiteUrl: z
    .string()
    .url("L'URL du site web n'est pas valide.")
    .optional()
    .or(z.literal("")),
  contactName: z
    .string()
    .max(100)
    .trim()
    .optional()
    .or(z.literal("")),
  contactEmail: z
    .string()
    .email("L'email de contact n'est pas valide.")
    .optional()
    .or(z.literal("")),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

// ─── Update organization ─────────────────────────────────────────────

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(3, "Le nom doit faire au moins 3 caractères.")
    .max(100)
    .trim()
    .optional(),
  shortDescription: z
    .string()
    .max(180)
    .trim()
    .nullable()
    .optional(),
  description: z
    .string()
    .max(1500)
    .trim()
    .nullable()
    .optional(),
  websiteUrl: z
    .string()
    .url("L'URL du site web n'est pas valide.")
    .nullable()
    .optional()
    .or(z.literal("")),
  logoUrl: z
    .string()
    .url("L'URL du logo n'est pas valide.")
    .nullable()
    .optional()
    .or(z.literal("")),
  contactName: z
    .string()
    .max(100)
    .trim()
    .nullable()
    .optional(),
  contactEmail: z
    .string()
    .email("L'email de contact n'est pas valide.")
    .nullable()
    .optional()
    .or(z.literal("")),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

// ─── Invite member ───────────────────────────────────────────────────

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .email("Email invalide."),
  role: z
    .string()
    .refine((val) => Object.keys(ORGANIZATION_ROLES).includes(val), {
      message: "Rôle invalide.",
    }),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

// ─── Update member role ──────────────────────────────────────────────

export const updateMemberRoleSchema = z.object({
  newRole: z
    .string()
    .refine(
      (val) =>
        Object.keys(ORGANIZATION_ROLES).includes(val) && val !== "OWNER",
      { message: "Rôle invalide." }
    ),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

// ─── Pot donation ────────────────────────────────────────────────────

export const potDonationSchema = z.object({
  amount: z
    .number()
    .int("Le montant doit être un nombre entier.")
    .positive("Le montant doit être positif.")
    .max(10000, "Le montant ne peut pas dépasser 10 000 TIME."),
});

export type PotDonationInput = z.infer<typeof potDonationSchema>;

// ─── Organization ID validation ──────────────────────────────────────

export const organizationIdSchema = z.string().cuid("ID d'organisation invalide.");

export const memberIdSchema = z.string().cuid("ID de membre invalide.");
