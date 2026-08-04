import { z } from "zod"

export const shoppingItemCategorySchema = z.enum([
  "protein",
  "produce",
  "dairy",
  "grains",
  "fats",
  "supplements",
  "other",
])

export const createShoppingItemSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.number().positive().optional(),
  unit: z.string().max(50).optional(),
  category: shoppingItemCategorySchema.optional(),
  estimatedCost: z.number().min(0).optional(),
  brand: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
})

export const updateShoppingItemSchema = createShoppingItemSchema.partial().extend({
  isPurchased: z.boolean().optional(),
})

export const createShoppingListSchema = z.object({
  name: z.string().min(1).max(200),
  notes: z.string().max(1000).optional(),
  items: z.array(createShoppingItemSchema).optional(),
})

export const updateShoppingListSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  notes: z.string().max(1000).optional(),
})

export type CreateShoppingItemInput = z.infer<typeof createShoppingItemSchema>
export type UpdateShoppingItemInput = z.infer<typeof updateShoppingItemSchema>
export type CreateShoppingListInput = z.infer<typeof createShoppingListSchema>
export type UpdateShoppingListInput = z.infer<typeof updateShoppingListSchema>
