import { z } from "zod"

export const bodyMeasurementSchema = z.object({
  date: z.string().datetime().optional(),
  weight: z.number().min(20).max(500).optional(), // kg
  bodyFat: z.number().min(1).max(70).optional(), // percentage
  chest: z.number().min(30).max(200).optional(), // cm
  waist: z.number().min(30).max(200).optional(), // cm
  hips: z.number().min(30).max(200).optional(), // cm
  biceps: z.number().min(10).max(100).optional(), // cm
  thighs: z.number().min(20).max(150).optional(), // cm
  calves: z.number().min(10).max(100).optional(), // cm
  shoulders: z.number().min(50).max(250).optional(), // cm
  neck: z.number().min(20).max(80).optional(), // cm
  notes: z.string().max(1000).optional(),
})

export const updateBodyMeasurementSchema = bodyMeasurementSchema.partial()

export type BodyMeasurementInput = z.infer<typeof bodyMeasurementSchema>
export type UpdateBodyMeasurementInput = z.infer<typeof updateBodyMeasurementSchema>
