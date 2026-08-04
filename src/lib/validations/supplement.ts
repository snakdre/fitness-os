import { z } from "zod"

export const createSupplementSchema = z.object({
  name: z.string().min(1).max(100),
  brand: z.string().optional(),
  dosage: z.number().positive(),
  unit: z.string().min(1),
  frequency: z.string().min(1),
  instructions: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  category: z.string().optional(),
})

export const updateSupplementSchema = createSupplementSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export const logSupplementSchema = z.object({
  supplementId: z.string().cuid(),
  dosage: z.number().positive(),
  notes: z.string().optional(),
})

export type CreateSupplementInput = z.infer<typeof createSupplementSchema>
export type UpdateSupplementInput = z.infer<typeof updateSupplementSchema>
export type LogSupplementInput = z.infer<typeof logSupplementSchema>
