import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  calculateMacros,
  getDailyNutrition,
  addFoodToMeal,
  setNutritionGoal,
  getNutritionGoal,
  getNutritionStats,
  createMeal,
  searchFoodItems,
} from "@/services/nutrition.service"

// ─── Mock db ──────────────────────────────────────────────────────────────────

vi.mock("@/lib/db", () => ({
  db: {
    meal: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    mealItem: {
      create: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    foodItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    nutritionGoal: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}))

import { db } from "@/lib/db"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDb = db as unknown as {
  meal: {
    findMany: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    findFirst: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
  mealItem: {
    create: ReturnType<typeof vi.fn>
    findFirst: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
  foodItem: {
    findMany: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
  nutritionGoal: {
    findUnique: ReturnType<typeof vi.fn>
    upsert: ReturnType<typeof vi.fn>
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── calculateMacros ──────────────────────────────────────────────────────────

describe("calculateMacros", () => {
  it("calculates BMR correctly for a male", () => {
    // weight=80kg, height=180cm, age=25, male
    // BMR = (10*80) + (6.25*180) - (5*25) + 5 = 800 + 1125 - 125 + 5 = 1805
    const result = calculateMacros(80, 180, 25, "male", "sedentary", "maintenance")
    expect(result.bmr).toBe(1805)
  })

  it("calculates BMR correctly for a female", () => {
    // weight=60kg, height=165cm, age=30, female
    // BMR = (10*60) + (6.25*165) - (5*30) - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
    const result = calculateMacros(60, 165, 30, "female", "sedentary", "maintenance")
    expect(result.bmr).toBe(1320)
  })

  it("applies correct activity multiplier for moderate activity", () => {
    // BMR = 1805, multiplier = 1.55
    const result = calculateMacros(80, 180, 25, "male", "moderate", "maintenance")
    expect(result.tdee).toBe(Math.round(1805 * 1.55))
  })

  it("applies -500 calorie adjustment for weight loss goal", () => {
    const result = calculateMacros(80, 180, 25, "male", "moderate", "loss")
    const tdee = Math.round(1805 * 1.55)
    expect(result.calories).toBe(tdee - 500)
  })

  it("applies +300 calorie adjustment for muscle gain goal", () => {
    const result = calculateMacros(80, 180, 25, "male", "moderate", "gain")
    const tdee = Math.round(1805 * 1.55)
    expect(result.calories).toBe(tdee + 300)
  })

  it("applies no adjustment for maintenance goal", () => {
    const result = calculateMacros(80, 180, 25, "male", "moderate", "maintenance")
    const tdee = Math.round(1805 * 1.55)
    expect(result.calories).toBe(tdee)
  })

  it("calculates protein at 2g per kg bodyweight", () => {
    const result = calculateMacros(80, 180, 25, "male", "moderate", "maintenance")
    expect(result.protein).toBe(80 * 2) // 160g
  })

  it("calculates fat at 25% of total calories", () => {
    const result = calculateMacros(80, 180, 25, "male", "moderate", "maintenance")
    const expectedFat = Math.round((result.calories * 0.25) / 9)
    expect(result.fat).toBe(expectedFat)
  })

  it("carbs account for remaining calories after protein and fat", () => {
    const result = calculateMacros(80, 180, 25, "male", "moderate", "maintenance")
    const proteinCalories = result.protein * 4
    const fatCalories = result.fat * 9
    const expectedCarbsCalories = result.calories - proteinCalories - fatCalories
    const expectedCarbs = Math.round(expectedCarbsCalories / 4)
    expect(result.carbs).toBe(expectedCarbs)
  })

  it("returns bmr and tdee in addition to target macros", () => {
    const result = calculateMacros(80, 180, 25, "male", "sedentary", "maintenance")
    expect(result).toHaveProperty("bmr")
    expect(result).toHaveProperty("tdee")
    expect(result).toHaveProperty("calories")
    expect(result).toHaveProperty("protein")
    expect(result).toHaveProperty("carbs")
    expect(result).toHaveProperty("fat")
  })

  it("handles extremely active multiplier (1.9)", () => {
    const result = calculateMacros(80, 180, 25, "male", "extremely_active", "maintenance")
    expect(result.tdee).toBe(Math.round(1805 * 1.9))
  })
})

// ─── getDailyNutrition ────────────────────────────────────────────────────────

describe("getDailyNutrition", () => {
  it("aggregates totals correctly from meal items", async () => {
    const mockMeals = [
      {
        id: "meal-1",
        mealType: "BREAKFAST",
        date: new Date(),
        mealItems: [
          { calories: 300, protein: 25, carbs: 30, fat: 10, fiber: 3 },
          { calories: 150, protein: 10, carbs: 20, fat: 5, fiber: 2 },
        ],
      },
      {
        id: "meal-2",
        mealType: "LUNCH",
        date: new Date(),
        mealItems: [
          { calories: 500, protein: 40, carbs: 50, fat: 15, fiber: 5 },
        ],
      },
    ]

    mockDb.meal.findMany.mockResolvedValue(mockMeals)
    mockDb.nutritionGoal.findUnique.mockResolvedValue({
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 65,
      fiber: 30,
    })

    const result = await getDailyNutrition("user-1", new Date())

    expect(result.totals.calories).toBe(950) // 300 + 150 + 500
    expect(result.totals.protein).toBe(75)   // 25 + 10 + 40
    expect(result.totals.carbs).toBe(100)    // 30 + 20 + 50
    expect(result.totals.fat).toBe(30)       // 10 + 5 + 15
    expect(result.totals.fiber).toBe(10)     // 3 + 2 + 5
  })

  it("returns zero totals when no meals logged", async () => {
    mockDb.meal.findMany.mockResolvedValue([])
    mockDb.nutritionGoal.findUnique.mockResolvedValue(null)

    const result = await getDailyNutrition("user-1", new Date())

    expect(result.totals.calories).toBe(0)
    expect(result.totals.protein).toBe(0)
    expect(result.totals.carbs).toBe(0)
    expect(result.totals.fat).toBe(0)
  })

  it("calculates correct percentages when goal is set", async () => {
    const mockMeals = [
      {
        id: "meal-1",
        mealType: "BREAKFAST",
        date: new Date(),
        mealItems: [{ calories: 1000, protein: 75, carbs: 100, fat: 32, fiber: 15 }],
      },
    ]

    mockDb.meal.findMany.mockResolvedValue(mockMeals)
    mockDb.nutritionGoal.findUnique.mockResolvedValue({
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 64,
      fiber: 30,
    })

    const result = await getDailyNutrition("user-1", new Date())

    expect(result.percentages.calories).toBe(50) // 1000/2000 = 50%
    expect(result.percentages.protein).toBe(50)  // 75/150 = 50%
    expect(result.percentages.carbs).toBe(50)    // 100/200 = 50%
    expect(result.percentages.fat).toBe(50)      // 32/64 = 50%
  })

  it("returns null goal when none set", async () => {
    mockDb.meal.findMany.mockResolvedValue([])
    mockDb.nutritionGoal.findUnique.mockResolvedValue(null)

    const result = await getDailyNutrition("user-1", new Date())

    expect(result.goal).toBeNull()
  })
})

// ─── addFoodToMeal ────────────────────────────────────────────────────────────

describe("addFoodToMeal", () => {
  it("correctly calculates macros for full serving", async () => {
    mockDb.meal.findFirst.mockResolvedValue({ id: "meal-1", userId: "user-1" })
    mockDb.foodItem.findUnique.mockResolvedValue({
      id: "food-1",
      calories: 200,
      protein: 20,
      carbs: 25,
      fat: 5,
      fiber: 3,
      servingSize: 100,
    })
    mockDb.mealItem.create.mockResolvedValue({
      id: "item-1",
      calories: 200,
      protein: 20,
      carbs: 25,
      fat: 5,
      fiber: 3,
    })

    await addFoodToMeal("meal-1", "user-1", {
      foodItemId: "food-1",
      quantity: 1,
      servingSize: 100,
    })

    const createCall = mockDb.mealItem.create.mock.calls[0][0]
    expect(createCall.data.calories).toBe(200)
    expect(createCall.data.protein).toBe(20)
    expect(createCall.data.carbs).toBe(25)
    expect(createCall.data.fat).toBe(5)
  })

  it("scales macros correctly for half serving", async () => {
    mockDb.meal.findFirst.mockResolvedValue({ id: "meal-1", userId: "user-1" })
    mockDb.foodItem.findUnique.mockResolvedValue({
      id: "food-1",
      calories: 200,
      protein: 20,
      carbs: 25,
      fat: 5,
      fiber: 4,
      servingSize: 100,
    })
    mockDb.mealItem.create.mockResolvedValue({})

    await addFoodToMeal("meal-1", "user-1", {
      foodItemId: "food-1",
      quantity: 1,
      servingSize: 50, // half serving
    })

    const createCall = mockDb.mealItem.create.mock.calls[0][0]
    expect(createCall.data.calories).toBe(100)
    expect(createCall.data.protein).toBe(10)
    expect(createCall.data.carbs).toBe(12.5)
    expect(createCall.data.fat).toBe(2.5)
    expect(createCall.data.fiber).toBe(2)
  })

  it("scales macros correctly for double quantity", async () => {
    mockDb.meal.findFirst.mockResolvedValue({ id: "meal-1", userId: "user-1" })
    mockDb.foodItem.findUnique.mockResolvedValue({
      id: "food-1",
      calories: 200,
      protein: 20,
      carbs: 25,
      fat: 5,
      fiber: null,
      servingSize: 100,
    })
    mockDb.mealItem.create.mockResolvedValue({})

    await addFoodToMeal("meal-1", "user-1", {
      foodItemId: "food-1",
      quantity: 2,
      servingSize: 100, // 2 full servings
    })

    const createCall = mockDb.mealItem.create.mock.calls[0][0]
    expect(createCall.data.calories).toBe(400)
    expect(createCall.data.protein).toBe(40)
    expect(createCall.data.carbs).toBe(50)
    expect(createCall.data.fat).toBe(10)
  })

  it("throws error when meal not found", async () => {
    mockDb.meal.findFirst.mockResolvedValue(null)

    await expect(
      addFoodToMeal("bad-meal", "user-1", {
        foodItemId: "food-1",
        quantity: 1,
        servingSize: 100,
      })
    ).rejects.toThrow("Meal not found")
  })

  it("throws error when food item not found", async () => {
    mockDb.meal.findFirst.mockResolvedValue({ id: "meal-1", userId: "user-1" })
    mockDb.foodItem.findUnique.mockResolvedValue(null)

    await expect(
      addFoodToMeal("meal-1", "user-1", {
        foodItemId: "bad-food",
        quantity: 1,
        servingSize: 100,
      })
    ).rejects.toThrow("Food item not found")
  })
})

// ─── setNutritionGoal ─────────────────────────────────────────────────────────

describe("setNutritionGoal", () => {
  it("upserts goal correctly for new user", async () => {
    const goalData = {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 65,
      fiber: 30,
      water: 2.5,
    }
    const mockGoal = { id: "goal-1", userId: "user-1", ...goalData }
    mockDb.nutritionGoal.upsert.mockResolvedValue(mockGoal)

    const result = await setNutritionGoal("user-1", goalData)

    expect(mockDb.nutritionGoal.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        create: expect.objectContaining({ userId: "user-1", calories: 2000 }),
        update: expect.objectContaining({ calories: 2000 }),
      })
    )
    expect(result).toEqual(mockGoal)
  })

  it("upserts goal correctly for existing user (update path)", async () => {
    const goalData = {
      calories: 1800,
      protein: 130,
      carbs: 180,
      fat: 60,
    }
    const mockGoal = { id: "goal-1", userId: "user-1", ...goalData }
    mockDb.nutritionGoal.upsert.mockResolvedValue(mockGoal)

    const result = await setNutritionGoal("user-1", goalData)

    expect(mockDb.nutritionGoal.upsert).toHaveBeenCalledOnce()
    expect(result.calories).toBe(1800)
  })
})

// ─── getNutritionGoal ─────────────────────────────────────────────────────────

describe("getNutritionGoal", () => {
  it("returns goal when found", async () => {
    const mockGoal = {
      id: "goal-1",
      userId: "user-1",
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 65,
    }
    mockDb.nutritionGoal.findUnique.mockResolvedValue(mockGoal)

    const result = await getNutritionGoal("user-1")

    expect(result).toEqual(mockGoal)
    expect(mockDb.nutritionGoal.findUnique).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    })
  })

  it("returns null when no goal set", async () => {
    mockDb.nutritionGoal.findUnique.mockResolvedValue(null)

    const result = await getNutritionGoal("user-1")

    expect(result).toBeNull()
  })
})

// ─── searchFoodItems ──────────────────────────────────────────────────────────

describe("searchFoodItems", () => {
  it("searches by name case-insensitively", async () => {
    const mockFoods = [
      { id: "food-1", name: "Chicken Breast", isCustom: false, isPublic: true },
    ]
    mockDb.foodItem.findMany.mockResolvedValue(mockFoods)

    const result = await searchFoodItems("chicken")

    expect(mockDb.foodItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ name: expect.objectContaining({ mode: "insensitive" }) }),
          ]),
        }),
      })
    )
    expect(result).toEqual(mockFoods)
  })

  it("includes user custom foods when userId provided", async () => {
    mockDb.foodItem.findMany.mockResolvedValue([])

    await searchFoodItems("test", "user-1")

    const call = mockDb.foodItem.findMany.mock.calls[0][0]
    const orCondition = call.where.AND[1].OR
    expect(orCondition).toContainEqual({ isPublic: true })
    expect(orCondition).toContainEqual({ createdById: "user-1" })
  })
})

// ─── getNutritionStats ────────────────────────────────────────────────────────

describe("getNutritionStats", () => {
  it("returns zero stats when no meals in last 7 days", async () => {
    mockDb.meal.findMany.mockResolvedValue([])

    const result = await getNutritionStats("user-1")

    expect(result.avgDailyCalories).toBe(0)
    expect(result.avgProtein).toBe(0)
    expect(result.streak).toBe(0)
    expect(result.topFoods).toEqual([])
  })

  it("calculates streak correctly for consecutive days", async () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const mockMeals = [
      {
        id: "meal-1",
        date: today,
        mealType: "BREAKFAST",
        mealItems: [
          { calories: 500, protein: 30, carbs: 50, fat: 15, foodItemId: "food-1", foodItem: { name: "Oats", brand: null } },
        ],
      },
      {
        id: "meal-2",
        date: yesterday,
        mealType: "LUNCH",
        mealItems: [
          { calories: 700, protein: 40, carbs: 60, fat: 20, foodItemId: "food-2", foodItem: { name: "Rice", brand: null } },
        ],
      },
    ]

    mockDb.meal.findMany.mockResolvedValue(mockMeals)

    const result = await getNutritionStats("user-1")

    expect(result.streak).toBeGreaterThanOrEqual(1)
  })

  it("identifies top foods by frequency", async () => {
    const today = new Date()

    const mockMeals = [
      {
        id: "meal-1",
        date: today,
        mealType: "BREAKFAST",
        mealItems: [
          { calories: 300, protein: 20, carbs: 30, fat: 10, foodItemId: "food-1", foodItem: { name: "Oats", brand: "Quaker" } },
          { calories: 200, protein: 15, carbs: 25, fat: 5, foodItemId: "food-1", foodItem: { name: "Oats", brand: "Quaker" } },
          { calories: 400, protein: 25, carbs: 40, fat: 12, foodItemId: "food-2", foodItem: { name: "Eggs", brand: null } },
        ],
      },
    ]

    mockDb.meal.findMany.mockResolvedValue(mockMeals)

    const result = await getNutritionStats("user-1")

    expect(result.topFoods.length).toBeGreaterThan(0)
    // Oats appears twice, Eggs once — Oats should be first
    expect(result.topFoods[0].name).toBe("Oats")
    expect(result.topFoods[0].count).toBe(2)
  })
})

// ─── createMeal ───────────────────────────────────────────────────────────────

describe("createMeal", () => {
  it("creates a meal with correct data", async () => {
    const mockMeal = {
      id: "meal-new",
      userId: "user-1",
      mealType: "BREAKFAST",
      date: new Date("2026-08-03T12:00:00.000Z"),
      name: null,
      notes: null,
      mealItems: [],
    }
    mockDb.meal.create.mockResolvedValue(mockMeal)

    const result = await createMeal("user-1", {
      date: "2026-08-03T12:00:00.000Z",
      mealType: "BREAKFAST",
    })

    expect(mockDb.meal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          mealType: "BREAKFAST",
        }),
      })
    )
    expect(result).toEqual(mockMeal)
  })
})
