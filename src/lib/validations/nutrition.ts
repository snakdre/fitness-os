import { z } from "zod"

export const createMealSchema = z.object({
  date: z.string().datetime(),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK", "PRE_WORKOUT", "POST_WORKOUT"]),
  name: z.string().optional(),
  notes: z.string().optional(),
})

export const addMealItemSchema = z.object({
  foodItemId: z.string().cuid(),
  quantity: z.number().positive(),
  servingSize: z.number().positive(),
})

export const createFoodItemSchema = z.object({
  name: z.string().min(1).max(200),
  brand: z.string().optional(),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  fiber: z.number().nonnegative().optional(),
  sodium: z.number().nonnegative().optional(),
  sugar: z.number().nonnegative().optional(),
  servingSize: z.number().positive().default(100),
  servingUnit: z.string().default("g"),
  barcode: z.string().optional(),
})

export const updateFoodItemSchema = createFoodItemSchema.partial()

export const setNutritionGoalSchema = z.object({
  calories: z.number().int().positive(),
  protein: z.number().positive(),
  carbs: z.number().positive(),
  fat: z.number().positive(),
  fiber: z.number().positive().optional(),
  water: z.number().positive().optional(),
})

export const calculateMacrosSchema = z.object({
  weight: z.number().positive(),
  height: z.number().positive(),
  age: z.number().int().positive(),
  gender: z.enum(["male", "female"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "very_active", "extremely_active"]),
  goal: z.enum(["loss", "gain", "maintenance"]),
})

export const getMealsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

export type CreateMealInput = z.infer<typeof createMealSchema>
export type AddMealItemInput = z.infer<typeof addMealItemSchema>
export type CreateFoodItemInput = z.infer<typeof createFoodItemSchema>
export type UpdateFoodItemInput = z.infer<typeof updateFoodItemSchema>
export type SetNutritionGoalInput = z.infer<typeof setNutritionGoalSchema>
export type CalculateMacrosInput = z.infer<typeof calculateMacrosSchema>
