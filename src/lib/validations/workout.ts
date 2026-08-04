import { z } from "zod"

export const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.string().datetime(),
  notes: z.string().optional(),
  isTemplate: z.boolean().optional().default(false),
})

export const updateWorkoutSchema = createWorkoutSchema.partial().extend({
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "SKIPPED"]).optional(),
  duration: z.number().int().positive().optional(),
  caloriesBurned: z.number().int().positive().optional(),
  totalVolume: z.number().positive().optional(),
})

export const addExerciseSchema = z.object({
  exerciseId: z.string().cuid(),
  order: z.number().int().min(0),
  sets: z.array(
    z.object({
      setNumber: z.number().int().min(1),
      reps: z.number().int().positive().optional(),
      weight: z.number().positive().optional(),
      duration: z.number().int().positive().optional(),
      distance: z.number().positive().optional(),
      rpe: z.number().int().min(1).max(10).optional(),
      notes: z.string().optional(),
    })
  ),
  restTime: z.number().int().positive().optional(),
  notes: z.string().optional(),
})

export const createExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(["STRENGTH", "CARDIO", "FLEXIBILITY", "BALANCE", "SPORTS", "OTHER"]),
  muscleGroups: z.array(z.string()).min(1),
  equipment: z.array(z.string()).default([]),
  instructions: z.string().optional(),
  videoUrl: z.string().url().optional(),
})

export const updateExerciseSetSchema = z.object({
  reps: z.number().int().positive().optional(),
  weight: z.number().positive().optional(),
  isCompleted: z.boolean().optional(),
  rpe: z.number().int().min(1).max(10).optional(),
  duration: z.number().int().positive().optional(),
  distance: z.number().positive().optional(),
  notes: z.string().optional(),
})

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>
export type AddExerciseInput = z.infer<typeof addExerciseSchema>
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>
export type UpdateExerciseSetInput = z.infer<typeof updateExerciseSetSchema>
