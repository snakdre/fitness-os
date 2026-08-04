"use client"

import { useState, useEffect } from "react"
import { format, subDays, parseISO } from "date-fns"
import { CalorieChart } from "@/components/nutrition/calorie-chart"
import { MacroBreakdown } from "@/components/nutrition/macro-breakdown"

interface MealItem {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number | null
}

interface Meal {
  id: string
  date: string
  mealType: string
  name?: string | null
  mealItems: MealItem[]
}

interface DayData {
  date: string
  label: string
  calories: number
  protein: number
  carbs: number
  fat: number
  meals: Meal[]
}

interface NutritionGoal {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface Stats {
  avgDailyCalories: number
  avgProtein: number
  streak: number
  topFoods: Array<{ name: string; brand: string | null; count: number }>
}

export default function NutritionHistoryPage() {
  const [days, setDays] = useState<DayData[]>([])
  const [goal, setGoal] = useState<NutritionGoal | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<7 | 14 | 30>(7)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const to = new Date()
        const from = subDays(to, range - 1)

        const [mealsRes, goalRes, statsRes] = await Promise.all([
          fetch(`/api/nutrition/meals?from=${from.toISOString()}&to=${to.toISOString()}`),
          fetch("/api/nutrition/goal"),
          fetch("/api/nutrition/stats"),
        ])

        const [mealsJson, goalJson, statsJson] = await Promise.all([
          mealsRes.json(),
          goalRes.json(),
          statsRes.json(),
        ])

        const meals: Meal[] = mealsJson.data ?? []
        setGoal(goalJson.data ?? null)
        setStats(statsJson.data ?? null)

        // Build day-by-day data
        const dayMap = new Map<string, DayData>()

        // Initialize all days in range
        for (let i = range - 1; i >= 0; i--) {
          const d = subDays(to, i)
          const key = format(d, "yyyy-MM-dd")
          dayMap.set(key, {
            date: key,
            label: format(d, "EEE"),
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            meals: [],
          })
        }

        // Fill with meal data
        for (const meal of meals) {
          const key = format(parseISO(meal.date), "yyyy-MM-dd")
          const day = dayMap.get(key)
          if (day) {
            day.meals.push(meal)
            for (const item of meal.mealItems) {
              day.calories += item.calories
              day.protein += item.protein
              day.carbs += item.carbs
              day.fat += item.fat
            }
          }
        }

        setDays(Array.from(dayMap.values()))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [range])

  const avgCalories = days.length > 0
    ? Math.round(days.reduce((s, d) => s + d.calories, 0) / days.filter(d => d.calories > 0).length) || 0
    : 0
  const avgProtein = days.length > 0
    ? Math.round(days.reduce((s, d) => s + d.protein, 0) / days.filter(d => d.protein > 0).length) || 0
    : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Nutrition History
          </h1>
          <div className="flex items-center gap-1">
            {([7, 14, 30] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  range === r
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Avg Calories", value: `${stats.avgDailyCalories}`, unit: "kcal/day" },
                  { label: "Avg Protein", value: `${stats.avgProtein}`, unit: "g/day" },
                  { label: "Streak", value: `${stats.streak}`, unit: "days" },
                  { label: "Top Food", value: stats.topFoods[0]?.name ?? "—", unit: "" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center"
                  >
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                      {stat.value}
                    </p>
                    {stat.unit && (
                      <p className="text-xs text-gray-400">{stat.unit}</p>
                    )}
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Calorie Chart */}
            <CalorieChart
              data={days.map((d) => ({
                date: d.date,
                label: d.label,
                calories: Math.round(d.calories),
              }))}
              goalCalories={goal?.calories}
            />

            {/* Macro Trend */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {range}-Day Macro Average
              </h2>
              <MacroBreakdown
                protein={avgProtein}
                carbs={Math.round(days.filter(d => d.carbs > 0).reduce((s, d) => s + d.carbs, 0) / (days.filter(d => d.carbs > 0).length || 1))}
                fat={Math.round(days.filter(d => d.fat > 0).reduce((s, d) => s + d.fat, 0) / (days.filter(d => d.fat > 0).length || 1))}
                goalProtein={goal?.protein}
                goalCarbs={goal?.carbs}
                goalFat={goal?.fat}
              />
            </div>

            {/* Daily Log */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Daily Log
                </h2>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {[...days].reverse().map((day) => (
                  <div key={day.date} className="px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {format(parseISO(day.date), "EEEE, MMM d")}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {day.meals.length} meal{day.meals.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {day.calories > 0 ? (
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {Math.round(day.calories)} kcal
                          </p>
                          <p className="text-xs text-gray-400">
                            P {Math.round(day.protein)}g · C {Math.round(day.carbs)}g · F {Math.round(day.fat)}g
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-gray-600">No data</span>
                      )}
                    </div>
                    {goal && day.calories > 0 && (
                      <div className="mt-2 h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-orange-400"
                          style={{
                            width: `${Math.min((day.calories / goal.calories) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Top Foods */}
            {stats && stats.topFoods.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Most Logged Foods
                </h2>
                <div className="space-y-2">
                  {stats.topFoods.map((food, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 w-4">{idx + 1}.</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {food.name}
                          </p>
                          {food.brand && (
                            <p className="text-xs text-gray-400">{food.brand}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {food.count}×
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
