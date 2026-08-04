"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { FoodSearch } from "@/components/nutrition/food-search"

type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | "PRE_WORKOUT" | "POST_WORKOUT"

interface FoodItem {
  id: string
  name: string
  brand?: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number | null
  servingSize: number
  servingUnit: string
}

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" },
  { value: "SNACK", label: "Snack" },
  { value: "PRE_WORKOUT", label: "Pre-Workout" },
  { value: "POST_WORKOUT", label: "Post-Workout" },
]

function getNearestMealType(): MealType {
  const hour = new Date().getHours()
  if (hour < 10) return "BREAKFAST"
  if (hour < 13) return "LUNCH"
  if (hour < 16) return "SNACK"
  if (hour < 20) return "DINNER"
  return "SNACK"
}

function LogFoodContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const existingMealId = searchParams.get("mealId")

  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [mealType, setMealType] = useState<MealType>(getNearestMealType())
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [quantity, setQuantity] = useState(1)
  const [servingSize, setServingSize] = useState(100)
  const [saving, setSaving] = useState(false)
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Load recently used foods via search with empty query
    async function loadRecent() {
      try {
        const res = await fetch("/api/food?q=")
        if (res.ok) {
          const json = await res.json()
          setRecentFoods((json.data ?? []).slice(0, 6))
        }
      } catch {
        // Ignore
      }
    }
    loadRecent()
  }, [])

  function handleSelectFood(item: FoodItem) {
    setSelectedFood(item)
    setServingSize(item.servingSize)
    setError(null)
  }

  const previewCalories = selectedFood
    ? Math.round(selectedFood.calories * (quantity * servingSize) / selectedFood.servingSize * 10) / 10
    : 0
  const previewProtein = selectedFood
    ? Math.round(selectedFood.protein * (quantity * servingSize) / selectedFood.servingSize * 10) / 10
    : 0
  const previewCarbs = selectedFood
    ? Math.round(selectedFood.carbs * (quantity * servingSize) / selectedFood.servingSize * 10) / 10
    : 0
  const previewFat = selectedFood
    ? Math.round(selectedFood.fat * (quantity * servingSize) / selectedFood.servingSize * 10) / 10
    : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFood) {
      setError("Please select a food item first")
      return
    }

    setSaving(true)
    setError(null)

    try {
      let mealId = existingMealId

      // Create meal if no existing meal
      if (!mealId) {
        const mealRes = await fetch("/api/nutrition/meals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: `${date}T12:00:00.000Z`,
            mealType,
          }),
        })
        if (!mealRes.ok) {
          const json = await mealRes.json()
          throw new Error(json.error ?? "Failed to create meal")
        }
        const mealJson = await mealRes.json()
        mealId = mealJson.data.id
      }

      // Add food item to meal
      const itemRes = await fetch(`/api/nutrition/meals/${mealId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodItemId: selectedFood.id,
          quantity,
          servingSize,
        }),
      })

      if (!itemRes.ok) {
        const json = await itemRes.json()
        throw new Error(json.error ?? "Failed to add food")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/nutrition")
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Log Food</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Food Search */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Search Food
            </label>
            <FoodSearch onSelect={handleSelectFood} />

            {/* Recently used foods */}
            {!selectedFood && recentFoods.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Available foods</p>
                <div className="flex flex-wrap gap-2">
                  {recentFoods.map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => handleSelectFood(food)}
                      className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
                    >
                      {food.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected food preview */}
            {selectedFood && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      {selectedFood.name}
                    </p>
                    {selectedFood.brand && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">{selectedFood.brand}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFood(null)}
                    className="text-blue-400 hover:text-blue-600 text-xs"
                  >
                    Change
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2 text-center">
                  {[
                    { label: "Calories", value: `${previewCalories} kcal` },
                    { label: "Protein", value: `${previewProtein}g` },
                    { label: "Carbs", value: `${previewCarbs}g` },
                    { label: "Fat", value: `${previewFat}g` },
                  ].map((m) => (
                    <div key={m.label} className="bg-white dark:bg-gray-900/50 rounded-lg p-2">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{m.value}</p>
                      <p className="text-[10px] text-gray-400">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Meal Type & Date */}
          {!existingMealId && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Meal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MEAL_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setMealType(type.value)}
                      className={`text-xs py-2 px-3 rounded-lg font-medium transition-colors ${
                        mealType === type.value
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={format(new Date(), "yyyy-MM-dd")}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Portion */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Portion</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0.1, Number(e.target.value)))}
                  min={0.1}
                  step={0.1}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  Serving size ({selectedFood?.servingUnit ?? "g"})
                </label>
                <input
                  type="number"
                  value={servingSize}
                  onChange={(e) => setServingSize(Math.max(0.1, Number(e.target.value)))}
                  min={0.1}
                  step={0.1}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-lg text-sm text-green-600 dark:text-green-400">
              Food logged successfully! Redirecting...
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedFood || saving}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Logging..." : "Log Food"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LogFoodPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    }>
      <LogFoodContent />
    </Suspense>
  )
}
