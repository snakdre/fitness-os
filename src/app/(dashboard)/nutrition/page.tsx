"use client"

import { useState, useEffect, useCallback } from "react"
import { format, addDays, subDays, parseISO } from "date-fns"
import Link from "next/link"
import { MacroRings } from "@/components/nutrition/macro-rings"
import { MealCard } from "@/components/nutrition/meal-card"
import { NutritionSummary } from "@/components/nutrition/nutrition-summary"

type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | "PRE_WORKOUT" | "POST_WORKOUT"

interface FoodItem {
  name: string
  brand?: string | null
  servingUnit: string
}

interface MealItem {
  id: string
  quantity: number
  servingSize: number
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number | null
  foodItem: FoodItem
}

interface Meal {
  id: string
  mealType: MealType
  name?: string | null
  mealItems: MealItem[]
  date: string
}

interface NutritionGoal {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number | null
}

interface DailyData {
  meals: Meal[]
  totals: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  goal: NutritionGoal | null
  percentages: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

const MEAL_TYPES: MealType[] = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
  "PRE_WORKOUT",
  "POST_WORKOUT",
]

export default function NutritionPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [data, setData] = useState<DailyData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadDailyData = useCallback(async (date: Date) => {
    setLoading(true)
    try {
      const dateStr = format(date, "yyyy-MM-dd")
      const res = await fetch(`/api/nutrition?date=${dateStr}T00:00:00.000Z`)
      if (res.ok) {
        const json = await res.json()
        setData(json.data)
      }
    } catch (err) {
      console.error("Failed to load nutrition data", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDailyData(selectedDate)
  }, [selectedDate, loadDailyData])

  async function handleRemoveItem(mealId: string, itemId: string) {
    const res = await fetch(`/api/nutrition/meals/${mealId}/items/${itemId}`, {
      method: "DELETE",
    })
    if (res.ok) {
      loadDailyData(selectedDate)
    }
  }

  async function handleDeleteMeal(mealId: string) {
    const res = await fetch(`/api/nutrition/meals/${mealId}`, {
      method: "DELETE",
    })
    if (res.ok) {
      loadDailyData(selectedDate)
    }
  }

  const isToday = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")

  // Group meals by type - create placeholder sections for missing types
  const mealsByType = new Map<MealType, Meal[]>()
  data?.meals.forEach((meal) => {
    const existing = mealsByType.get(meal.mealType) ?? []
    existing.push(meal)
    mealsByType.set(meal.mealType, existing)
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nutrition</h1>
          <Link
            href="/nutrition/log"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Log Food
          </Link>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 mb-6">
          <button
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            ‹
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {isToday ? "Today" : format(selectedDate, "EEEE")}
            </p>
            <p className="text-xs text-gray-400">{format(selectedDate, "MMMM d, yyyy")}</p>
          </div>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            disabled={isToday}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Macro Rings */}
            {data?.goal ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                  Progress
                </h2>
                <MacroRings
                  calories={data.totals.calories}
                  protein={data.totals.protein}
                  carbs={data.totals.carbs}
                  fat={data.totals.fat}
                  goalCalories={data.goal.calories}
                  goalProtein={data.goal.protein}
                  goalCarbs={data.goal.carbs}
                  goalFat={data.goal.fat}
                />
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 p-4 text-center">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Set nutrition goals to see progress rings.{" "}
                  <Link href="/nutrition/goals" className="font-semibold underline">
                    Set goals →
                  </Link>
                </p>
              </div>
            )}

            {/* Meals */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Meals
              </h2>
              {data && data.meals.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                  <p className="text-gray-400 mb-3">No meals logged yet</p>
                  <Link
                    href="/nutrition/log"
                    className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Log your first meal →
                  </Link>
                </div>
              ) : (
                data?.meals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    mealId={meal.id}
                    mealType={meal.mealType}
                    name={meal.name}
                    items={meal.mealItems}
                    onAddFood={() => {
                      window.location.href = `/nutrition/log?mealId=${meal.id}`
                    }}
                    onRemoveItem={handleRemoveItem}
                    onDeleteMeal={handleDeleteMeal}
                  />
                ))
              )}
            </div>

            {/* Daily Summary */}
            {data && (
              <NutritionSummary
                calories={data.totals.calories}
                protein={data.totals.protein}
                carbs={data.totals.carbs}
                fat={data.totals.fat}
                fiber={data.totals.fiber}
                goalCalories={data.goal?.calories}
                goalProtein={data.goal?.protein}
                goalCarbs={data.goal?.carbs}
                goalFat={data.goal?.fat}
              />
            )}

            {/* Quick Links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { href: "/nutrition/log", label: "Log Food", icon: "📝" },
                { href: "/nutrition/history", label: "History", icon: "📊" },
                { href: "/nutrition/foods", label: "Food Library", icon: "🥗" },
                { href: "/nutrition/goals", label: "Goals", icon: "🎯" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex flex-col items-center gap-1.5 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors text-center"
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
