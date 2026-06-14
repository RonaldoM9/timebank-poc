"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ─── Types ──────────────────────────────────────────────────────────────────

export type AvailabilitySlotItem = {
  id: string;
  type: string;
  dayOfWeek: number | null;
  startTime: string | null;
  endTime: string | null;
  startAt: string | null;
  endAt: string | null;
  isActive: boolean;
  createdAt: string;
};

export type AvailableSlot = {
  startAt: string;
  endAt: string;
  label: string;
};

// ─── Validation schemas ─────────────────────────────────────────────────────

const recurringSlotSchema = z.object({
  type: z.literal("RECURRING"),
  dayOfWeek: z.coerce.number().int().min(1).max(7),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"),
});

const oneOffSlotSchema = z.object({
  type: z.literal("ONE_OFF"),
  startAt: z.string().min(1, "Date de début requise"),
  endAt: z.string().min(1, "Date de fin requise"),
});

// ─── Server Actions ─────────────────────────────────────────────────────────

/** Get all slots for the current user */
export async function getMySlots(): Promise<AvailabilitySlotItem[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return [];

  const slots = await prisma.availabilitySlot.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return slots.map((s) => ({
    id: s.id,
    type: s.type,
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
    startAt: s.startAt?.toISOString() ?? null,
    endAt: s.endAt?.toISOString() ?? null,
    isActive: s.isActive,
    createdAt: s.createdAt.toISOString(),
  }));
}

/** Create a recurring slot */
export async function createRecurringSlot(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Vous devez être connecté" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  const raw = {
    type: "RECURRING",
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  };

  const parsed = recurringSlotSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { dayOfWeek, startTime, endTime } = parsed.data;

  // Validation: end > start
  if (startTime >= endTime) {
    return { error: "L'heure de fin doit être après l'heure de début" };
  }

  await prisma.availabilitySlot.create({
    data: {
      userId: user.id,
      type: "RECURRING",
      dayOfWeek,
      startTime,
      endTime,
    },
  });

  return { success: true };
}

/** Create a one-off slot */
export async function createOneOffSlot(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Vous devez être connecté" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  const raw = {
    type: "ONE_OFF",
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
  };

  const parsed = oneOffSlotSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { startAt, endAt } = parsed.data;

  const startDate = new Date(startAt);
  const endDate = new Date(endAt);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { error: "Dates invalides" };
  }
  if (endDate <= startDate) {
    return { error: "La date de fin doit être après la date de début" };
  }
  if (startDate < new Date()) {
    return { error: "Impossible de créer un créneau dans le passé" };
  }

  await prisma.availabilitySlot.create({
    data: {
      userId: user.id,
      type: "ONE_OFF",
      startAt: startDate,
      endAt: endDate,
    },
  });

  return { success: true };
}

/** Toggle slot active/inactive */
export async function toggleSlot(slotId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Vous devez être connecté" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  const slot = await prisma.availabilitySlot.findUnique({
    where: { id: slotId },
  });
  if (!slot) return { error: "Créneau introuvable" };
  if (slot.userId !== user.id) return { error: "Ce créneau ne vous appartient pas" };

  await prisma.availabilitySlot.update({
    where: { id: slotId },
    data: { isActive: !slot.isActive },
  });

  return { success: true };
}

/** Delete a slot */
export async function deleteSlot(slotId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Vous devez être connecté" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  const slot = await prisma.availabilitySlot.findUnique({
    where: { id: slotId },
  });
  if (!slot) return { error: "Créneau introuvable" };
  if (slot.userId !== user.id) return { error: "Ce créneau ne vous appartient pas" };

  await prisma.availabilitySlot.delete({ where: { id: slotId } });

  return { success: true };
}

// ─── Slot generation ────────────────────────────────────────────────────────

/** Generate available slots for a provider over the next 14 days */
export async function getProviderSlots(providerId: string, hours: number): Promise<AvailableSlot[]> {
  const slots = await prisma.availabilitySlot.findMany({
    where: { userId: providerId, isActive: true },
  });

  if (slots.length === 0) return [];

  // Get existing bookings that block slots
  const existingBookings = await prisma.booking.findMany({
    where: {
      service: { providerId },
      status: { in: ["pending", "confirmed", "in_progress"] },
      startAt: { not: null },
      endAt: { not: null },
    },
    select: { startAt: true, endAt: true },
  });

  const blockedRanges: { start: Date; end: Date }[] = existingBookings
    .filter((b) => b.startAt && b.endAt)
    .map((b) => ({ start: b.startAt!, end: b.endAt! }));

  const now = new Date();
  const availableSlots: AvailableSlot[] = [];
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(0, 0, 0, 0);

    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Prisma: 1=lun..7=dim, JS: 0=dim

    // Find matching recurring slots for this day
    const matchingSlots = slots.filter((s) => {
      if (s.type === "RECURRING" && s.dayOfWeek === dayOfWeek) return true;
      if (s.type === "ONE_OFF" && s.startAt && s.endAt) {
        const slotDate = new Date(s.startAt);
        return (
          slotDate.getFullYear() === date.getFullYear() &&
          slotDate.getMonth() === date.getMonth() &&
          slotDate.getDate() === date.getDate()
        );
      }
      return false;
    });

    for (const slot of matchingSlots) {
      let slotStart: Date;
      let slotEnd: Date;

      if (slot.type === "RECURRING") {
        const [h1, m1] = (slot.startTime || "09:00").split(":").map(Number);
        const [h2, m2] = (slot.endTime || "18:00").split(":").map(Number);
        slotStart = new Date(date);
        slotStart.setHours(h1, m1, 0, 0);
        slotEnd = new Date(date);
        slotEnd.setHours(h2, m2, 0, 0);
      } else {
        slotStart = new Date(slot.startAt!);
        slotEnd = new Date(slot.endAt!);
      }

      // Skip past slots
      if (slotEnd <= now) continue;

      // Generate time slots based on duration (hours * 1h blocks)
      // Each block is 1 hour, align to the hours boundary
      const durationMs = hours * 60 * 60 * 1000;
      let cursor = new Date(slotStart);
      // Round up to next hour
      cursor.setMinutes(0, 0, 0);
      if (cursor < slotStart) cursor.setHours(cursor.getHours() + 1);

      while (cursor.getTime() + durationMs <= slotEnd.getTime()) {
        const blockStart = new Date(cursor);
        const blockEnd = new Date(cursor.getTime() + durationMs);

        // Check no conflict with existing bookings
        const hasConflict = blockedRanges.some(
          (b) => blockStart < b.end && blockEnd > b.start
        );

        if (!hasConflict && blockStart > now) {
          const dateStr = `${dayNames[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
          const timeStr = `${blockStart.getHours().toString().padStart(2, "0")}:00`;
          availableSlots.push({
            startAt: blockStart.toISOString(),
            endAt: blockEnd.toISOString(),
            label: `${dateStr} à ${timeStr} (${hours}h)`,
          });
        }

        cursor.setHours(cursor.getHours() + 1);
      }
    }
  }

  return availableSlots;
}
