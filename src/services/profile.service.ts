import { db } from "@/lib/db"
import type { UpdateProfileInput, CreateGoalInput, UpdateGoalInput } from "@/lib/validations/profile"

export async function getProfile(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  })

  if (!user) return null

  // Create empty profile if it doesn't exist
  if (!user.profile) {
    const profile = await db.profile.create({
      data: { userId },
    })
    return { ...user, profile }
  }

  return user
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const updateData: Record<string, unknown> = { ...data }

  if (data.dateOfBirth) {
    updateData.dateOfBirth = new Date(data.dateOfBirth)
  }

  return db.profile.upsert({
    where: { userId },
    update: updateData,
    create: { userId, ...updateData },
  })
}

export async function getGoals(userId: string, status?: string) {
  return db.goal.findMany({
    where: {
      userId,
      ...(status ? { status: status as "ACTIVE" | "COMPLETED" | "PAUSED" | "ABANDONED" } : {}),
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function createGoal(userId: string, data: CreateGoalInput) {
  const createData: Record<string, unknown> = { userId, ...data }

  if (data.targetDate) {
    createData.targetDate = new Date(data.targetDate)
  }

  return db.goal.create({ data: createData as Parameters<typeof db.goal.create>[0]["data"] })
}

export async function updateGoal(goalId: string, userId: string, data: UpdateGoalInput) {
  // Verify ownership first
  const goal = await db.goal.findFirst({ where: { id: goalId, userId } })
  if (!goal) return null

  const updateData: Record<string, unknown> = { ...data }
  if (data.targetDate) {
    updateData.targetDate = new Date(data.targetDate)
  }

  return db.goal.update({
    where: { id: goalId },
    data: updateData,
  })
}

export async function deleteGoal(goalId: string, userId: string) {
  const goal = await db.goal.findFirst({ where: { id: goalId, userId } })
  if (!goal) return null

  return db.goal.delete({ where: { id: goalId } })
}
