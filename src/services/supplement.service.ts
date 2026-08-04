import { db } from "@/lib/db"
import { startOfDay, endOfDay, subDays } from "date-fns"
import type {
  CreateSupplementInput,
  UpdateSupplementInput,
  LogSupplementInput,
} from "@/lib/validations/supplement"

// ─── Supplements ──────────────────────────────────────────────────────────────

export async function getSupplements(userId: string, activeOnly = false) {
  return db.supplement.findMany({
    where: {
      userId,
      ...(activeOnly ? { isActive: true } : {}),
    },
    include: {
      logs: {
        orderBy: { takenAt: "desc" },
        take: 1,
      },
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  })
}

export async function getSupplementById(supplementId: string, userId: string) {
  return db.supplement.findFirst({
    where: { id: supplementId, userId },
    include: {
      logs: {
        orderBy: { takenAt: "desc" },
        take: 10,
      },
    },
  })
}

export async function createSupplement(
  userId: string,
  data: CreateSupplementInput
) {
  return db.supplement.create({
    data: {
      userId,
      name: data.name,
      brand: data.brand,
      dosage: data.dosage,
      unit: data.unit,
      frequency: data.frequency,
      instructions: data.instructions,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      category: data.category,
      isActive: true,
    },
  })
}

export async function updateSupplement(
  supplementId: string,
  userId: string,
  data: UpdateSupplementInput
) {
  const existing = await db.supplement.findFirst({
    where: { id: supplementId, userId },
  })
  if (!existing) throw new Error("Supplement not found")

  return db.supplement.update({
    where: { id: supplementId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.brand !== undefined && { brand: data.brand }),
      ...(data.dosage !== undefined && { dosage: data.dosage }),
      ...(data.unit !== undefined && { unit: data.unit }),
      ...(data.frequency !== undefined && { frequency: data.frequency }),
      ...(data.instructions !== undefined && { instructions: data.instructions }),
      ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
      ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  })
}

export async function deleteSupplement(supplementId: string, userId: string) {
  const existing = await db.supplement.findFirst({
    where: { id: supplementId, userId },
  })
  if (!existing) throw new Error("Supplement not found")

  return db.supplement.delete({ where: { id: supplementId } })
}

// ─── Supplement Logs ──────────────────────────────────────────────────────────

export async function logSupplement(userId: string, data: LogSupplementInput) {
  // Verify supplement belongs to user
  const supplement = await db.supplement.findFirst({
    where: { id: data.supplementId, userId },
  })
  if (!supplement) throw new Error("Supplement not found")

  return db.supplementLog.create({
    data: {
      supplementId: data.supplementId,
      userId,
      dosage: data.dosage,
      notes: data.notes,
      takenAt: new Date(),
    },
    include: {
      supplement: true,
    },
  })
}

export async function getTodaySupplementLogs(userId: string) {
  const today = new Date()
  const dayStart = startOfDay(today)
  const dayEnd = endOfDay(today)

  return db.supplementLog.findMany({
    where: {
      userId,
      takenAt: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
    include: {
      supplement: true,
    },
    orderBy: { takenAt: "desc" },
  })
}

export async function getSupplementHistory(
  supplementId: string,
  userId: string,
  days = 30
) {
  const supplement = await db.supplement.findFirst({
    where: { id: supplementId, userId },
  })
  if (!supplement) throw new Error("Supplement not found")

  const since = subDays(new Date(), days)

  return db.supplementLog.findMany({
    where: {
      supplementId,
      userId,
      takenAt: { gte: since },
    },
    orderBy: { takenAt: "desc" },
  })
}
