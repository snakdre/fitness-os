import { z } from "zod"

export const activityLevelSchema = z.enum([
  "SEDENTARY",
  "LIGHTLY_ACTIVE",
  "MODERATELY_ACTIVE",
  "VERY_ACTIVE",
  "EXTREMELY_ACTIVE",
])

export const genderSchema = z.enum([
  "MALE",
  "FEMALE",
  "OTHER",
  "PREFER_NOT_TO_SAY",
])

export const updateProfileSchema = z.object({
  age: z.number().int().min(13).max(120).optional(),
  gender: genderSchema.optional(),
  height: z.number().min(50).max(300).optional(), // cm
  weight: z.number().min(20).max(500).optional(), // kg
  activityLevel: activityLevelSchema.optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  timezone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
})

export const goalTypeSchema = z.enum([
  "WEIGHT_LOSS",
  "MUSCLE_GAIN",
  "MAINTENANCE",
  "ENDURANCE",
  "STRENGTH",
])

export const goalStatusSchema = z.enum([
  "ACTIVE",
  "COMPLETED",
  "PAUSED",
  "ABANDONED",
])

export const createGoalSchema = z.object({
  type: goalTypeSchema,
  targetWeight: z.number().min(20).max(500).optional(),
  targetDate: z.string().datetime().optional(),
  description: z.string().max(1000).optional(),
  startWeight: z.number().min(20).max(500).optional(),
  currentWeight: z.number().min(20).max(500).optional(),
  notes: z.string().max(2000).optional(),
})

export const updateGoalSchema = createGoalSchema.partial().extend({
  status: goalStatusSchema.optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
