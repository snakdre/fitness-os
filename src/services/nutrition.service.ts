import { db } from "@/lib/db"
import { startOfDay, endOfDay, subDays, format } from "date-fns"
import type {
  CreateMealInput,
  AddMealItemInput,
  CreateFoodItemInput,
  SetNutritionGoalInput,
  CalculateMacrosInput,
} from "@/lib/validations/nutrition"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyNutritionTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export interface DailyNutritionPercentages {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export interface DailyNutrition {
  meals: Awaited<ReturnType<typeof getMeals>> extends Array<infer T> ? T[] : never
  totals: DailyNutritionTotals
  goal: Awaited<ReturnType<typeof getNutritionGoal>>
  percentages: DailyNutritionPercentages
}

export interface NutritionStats {
  avgDailyCalories: number
  avgProtein: number
  streak: number
  topFoods: Array<{ name: string; brand: string | null; count: number }>
}

export interface MacroRecommendation {
  calories: number
  protein: number
  carbs: number
  fat: number
  bmr: number
  tdee: number
}

// ─── Daily Nutrition ──────────────────────────────────────────────────────────

export async function getDailyNutrition(userId: string, date: Date) {
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)

  const meals = await db.meal.findMany({
    where: {
      userId,
      date: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
    include: {
      mealItems: {
        include: {
          foodItem: true,
        },
      },
    },
    orderBy: { date: "asc" },
  })

  const totals: DailyNutritionTotals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  }

  for (const meal of meals) {
    for (const item of meal.mealItems) {
      totals.calories += item.calories
      totals.protein += item.protein
      totals.carbs += item.carbs
      totals.fat += item.fat
      totals.fiber += item.fiber ?? 0
    }
  }

  const goal = await getNutritionGoal(userId)

  const percentages: DailyNutritionPercentages = {
    calories: goal ? Math.round((totals.calories / goal.calories) * 100) : 0,
    protein: goal ? Math.round((totals.protein / goal.protein) * 100) : 0,
    carbs: goal ? Math.round((totals.carbs / goal.carbs) * 100) : 0,
    fat: goal ? Math.round((totals.fat / goal.fat) * 100) : 0,
    fiber: goal?.fiber ? Math.round((totals.fiber / goal.fiber) * 100) : 0,
  }

  return {
    meals,
    totals,
    goal,
    percentages,
  }
}

// ─── Meals ────────────────────────────────────────────────────────────────────

export async function getMeals(userId: string, from: Date, to: Date) {
  return db.meal.findMany({
    where: {
      userId,
      date: {
        gte: startOfDay(from),
        lte: endOfDay(to),
      },
    },
    include: {
      mealItems: {
        include: {
          foodItem: true,
        },
      },
    },
    orderBy: { date: "asc" },
  })
}

export async function createMeal(userId: string, data: CreateMealInput) {
  return db.meal.create({
    data: {
      userId,
      date: new Date(data.date),
      mealType: data.mealType,
      name: data.name,
      notes: data.notes,
    },
    include: {
      mealItems: {
        include: {
          foodItem: true,
        },
      },
    },
  })
}

export async function getMealById(mealId: string, userId: string) {
  return db.meal.findFirst({
    where: { id: mealId, userId },
    include: {
      mealItems: {
        include: {
          foodItem: true,
        },
      },
    },
  })
}

export async function deleteMeal(mealId: string, userId: string) {
  const meal = await db.meal.findFirst({ where: { id: mealId, userId } })
  if (!meal) throw new Error("Meal not found")

  return db.meal.delete({ where: { id: mealId } })
}

// ─── Meal Items ───────────────────────────────────────────────────────────────

export async function addFoodToMeal(
  mealId: string,
  userId: string,
  data: AddMealItemInput
) {
  // Verify meal belongs to user
  const meal = await db.meal.findFirst({ where: { id: mealId, userId } })
  if (!meal) throw new Error("Meal not found")

  const foodItem = await db.foodItem.findUnique({ where: { id: data.foodItemId } })
  if (!foodItem) throw new Error("Food item not found")

  // Calculate macros based on serving ratio
  // foodItem macros are per servingSize, scale by (quantity * servingSize / foodItem.servingSize)
  const ratio = (data.quantity * data.servingSize) / foodItem.servingSize

  const calories = Math.round(foodItem.calories * ratio * 10) / 10
  const protein = Math.round(foodItem.protein * ratio * 10) / 10
  const carbs = Math.round(foodItem.carbs * ratio * 10) / 10
  const fat = Math.round(foodItem.fat * ratio * 10) / 10
  const fiber = foodItem.fiber != null ? Math.round(foodItem.fiber * ratio * 10) / 10 : null

  return db.mealItem.create({
    data: {
      mealId,
      foodItemId: data.foodItemId,
      quantity: data.quantity,
      servingSize: data.servingSize,
      calories,
      protein,
      carbs,
      fat,
      fiber,
    },
    include: {
      foodItem: true,
    },
  })
}

export async function removeMealItem(mealItemId: string, userId: string) {
  // Verify ownership through meal
  const item = await db.mealItem.findFirst({
    where: { id: mealItemId },
    include: { meal: true },
  })

  if (!item || item.meal.userId !== userId) {
    throw new Error("Meal item not found")
  }

  return db.mealItem.delete({ where: { id: mealItemId } })
}

// ─── Food Items ───────────────────────────────────────────────────────────────

export async function searchFoodItems(query: string, userId?: string) {
  const searchTerm = query.trim().toLowerCase()

  return db.foodItem.findMany({
    where: {
      AND: [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          OR: [
            { isPublic: true },
            ...(userId ? [{ createdById: userId }] : []),
          ],
        },
      ],
    },
    orderBy: [{ isCustom: "asc" }, { name: "asc" }],
    take: 30,
  })
}

export async function getFoodItemById(id: string) {
  return db.foodItem.findUnique({ where: { id } })
}

export async function createFoodItem(userId: string, data: CreateFoodItemInput) {
  return db.foodItem.create({
    data: {
      ...data,
      isCustom: true,
      isPublic: false,
      createdById: userId,
    },
  })
}

export async function updateFoodItem(
  id: string,
  userId: string,
  data: Partial<CreateFoodItemInput>
) {
  const item = await db.foodItem.findFirst({
    where: { id, createdById: userId },
  })
  if (!item) throw new Error("Food item not found or not owned by user")

  return db.foodItem.update({ where: { id }, data })
}

export async function deleteFoodItem(id: string, userId: string) {
  const item = await db.foodItem.findFirst({
    where: { id, createdById: userId },
  })
  if (!item) throw new Error("Food item not found or not owned by user")

  return db.foodItem.delete({ where: { id } })
}

// ─── Nutrition Goals ──────────────────────────────────────────────────────────

export async function getNutritionGoal(userId: string) {
  return db.nutritionGoal.findUnique({ where: { userId } })
}

export async function setNutritionGoal(userId: string, data: SetNutritionGoalInput) {
  return db.nutritionGoal.upsert({
    where: { userId },
    create: {
      userId,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber,
      water: data.water,
    },
    update: {
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber,
      water: data.water,
    },
  })
}

// ─── Nutrition Stats ──────────────────────────────────────────────────────────

export async function getNutritionStats(userId: string): Promise<NutritionStats> {
  const today = new Date()
  const sevenDaysAgo = subDays(today, 7)

  // Get all meals in the last 7 days
  const recentMeals = await db.meal.findMany({
    where: {
      userId,
      date: {
        gte: startOfDay(sevenDaysAgo),
        lte: endOfDay(today),
      },
    },
    include: {
      mealItems: {
        include: {
          foodItem: true,
        },
      },
    },
    orderBy: { date: "asc" },
  })

  // Group meals by day and calculate totals
  const dailyTotals: Record<string, { calories: number; protein: number }> = {}
  const foodFrequency: Record<string, { name: string; brand: string | null; count: number }> = {}

  for (const meal of recentMeals) {
    const dayKey = format(meal.date, "yyyy-MM-dd")
    if (!dailyTotals[dayKey]) {
      dailyTotals[dayKey] = { calories: 0, protein: 0 }
    }
    for (const item of meal.mealItems) {
      dailyTotals[dayKey].calories += item.calories
      dailyTotals[dayKey].protein += item.protein

      // Track food frequency
      const foodId = item.foodItemId
      if (!foodFrequency[foodId]) {
        foodFrequency[foodId] = {
          name: item.foodItem.name,
          brand: item.foodItem.brand,
          count: 0,
        }
      }
      foodFrequency[foodId].count++
    }
  }

  const days = Object.values(dailyTotals)
  const avgDailyCalories =
    days.length > 0
      ? Math.round(days.reduce((sum, d) => sum + d.calories, 0) / days.length)
      : 0
  const avgProtein =
    days.length > 0
      ? Math.round(days.reduce((sum, d) => sum + d.protein, 0) / days.length)
      : 0

  // Calculate streak: consecutive days with logged meals ending today
  let streak = 0
  let checkDate = today
  while (true) {
    const dateKey = format(checkDate, "yyyy-MM-dd")
    if (dailyTotals[dateKey] && dailyTotals[dateKey].calories > 0) {
      streak++
      checkDate = subDays(checkDate, 1)
    } else {
      break
    }
  }

  const topFoods = Object.values(foodFrequency)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    avgDailyCalories,
    avgProtein,
    streak,
    topFoods,
  }
}

// ─── Macro Calculator ─────────────────────────────────────────────────────────

export function calculateMacros(
  weight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: string,
  goal: string
): MacroRecommendation {
  // Mifflin-St Jeor BMR equation
  const bmr =
    10 * weight + 6.25 * height - 5 * age + (gender === "male" ? 5 : -161)

  // Activity multipliers
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  }
  const multiplier = activityMultipliers[activityLevel] ?? 1.55
  const tdee = bmr * multiplier

  // Adjust for goal
  const goalAdjustments: Record<string, number> = {
    loss: -500,
    gain: 300,
    maintenance: 0,
  }
  const targetCalories = Math.round(tdee + (goalAdjustments[goal] ?? 0))

  // Macros
  const protein = Math.round(weight * 2) // 2g per kg bodyweight
  const fat = Math.round((targetCalories * 0.25) / 9) // 25% of calories from fat (9 cal/g)
  const proteinCalories = protein * 4
  const fatCalories = fat * 9
  const carbsCalories = targetCalories - proteinCalories - fatCalories
  const carbs = Math.max(0, Math.round(carbsCalories / 4)) // 4 cal/g

  return {
    calories: targetCalories,
    protein,
    carbs,
    fat,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
  }
}
