"use client"

import { useState, useEffect } from "react"
import { MacroBreakdown } from "@/components/nutrition/macro-breakdown"

interface NutritionGoal {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number | null
  water?: number | null
}

interface MacroRecommendation {
  calories: number
  protein: number
  carbs: number
  fat: number
  bmr: number
  tdee: number
}

const defaultForm = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
  fiber: 30,
  water: 2.5,
}

export default function NutritionGoalsPage() {
  const [goal, setGoal] = useState<NutritionGoal | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Calculator state
  const [showCalc, setShowCalc] = useState(false)
  const [calcForm, setCalcForm] = useState({
    weight: 75,
    height: 175,
    age: 30,
    gender: "male",
    activityLevel: "moderate",
    goal: "maintenance",
  })
  const [recommendation, setRecommendation] = useState<MacroRecommendation | null>(null)
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    async function loadGoal() {
      const res = await fetch("/api/nutrition/goal")
      if (res.ok) {
        const json = await res.json()
        if (json.data) {
          setGoal(json.data)
          setForm({
            calories: json.data.calories,
            protein: json.data.protein,
            carbs: json.data.carbs,
            fat: json.data.fat,
            fiber: json.data.fiber ?? 30,
            water: json.data.water ?? 2.5,
          })
        }
      }
    }
    loadGoal()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch("/api/nutrition/goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(JSON.stringify(json.error) ?? "Failed to save goals")
      }

      const json = await res.json()
      setGoal(json.data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    setCalculating(true)
    try {
      const res = await fetch("/api/nutrition/calculate-macros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calcForm),
      })
      if (res.ok) {
        const json = await res.json()
        setRecommendation(json.data)
      }
    } finally {
      setCalculating(false)
    }
  }

  function applyRecommendation() {
    if (!recommendation) return
    setForm((prev) => ({
      ...prev,
      calories: recommendation.calories,
      protein: recommendation.protein,
      carbs: recommendation.carbs,
      fat: recommendation.fat,
    }))
    setShowCalc(false)
    setRecommendation(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Nutrition Goals
        </h1>

        {/* Current Goals Display */}
        {goal && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Current Goals
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: "Calories", value: goal.calories, unit: "kcal", color: "#f97316" },
                { label: "Protein", value: goal.protein, unit: "g", color: "#3b82f6" },
                { label: "Carbs", value: goal.carbs, unit: "g", color: "#22c55e" },
                { label: "Fat", value: goal.fat, unit: "g", color: "#eab308" },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {item.value}
                    <span className="text-xs font-normal text-gray-400 ml-0.5">{item.unit}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                </div>
              ))}
            </div>
            <MacroBreakdown
              protein={goal.protein}
              carbs={goal.carbs}
              fat={goal.fat}
            />
          </div>
        )}

        {/* Auto-Calculate */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Auto-Calculate
            </h2>
            <button
              onClick={() => setShowCalc(!showCalc)}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              {showCalc ? "Hide" : "Calculate →"}
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Use the Mifflin-St Jeor equation to calculate personalized calorie and macro targets.
          </p>

          {showCalc && (
            <form onSubmit={handleCalculate} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { key: "weight", label: "Weight (kg)", type: "number" },
                  { key: "height", label: "Height (cm)", type: "number" },
                  { key: "age", label: "Age", type: "number" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      value={calcForm[field.key as keyof typeof calcForm]}
                      onChange={(e) => setCalcForm({ ...calcForm, [field.key]: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Gender
                  </label>
                  <select
                    value={calcForm.gender}
                    onChange={(e) => setCalcForm({ ...calcForm, gender: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Activity Level
                  </label>
                  <select
                    value={calcForm.activityLevel}
                    onChange={(e) => setCalcForm({ ...calcForm, activityLevel: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Lightly Active</option>
                    <option value="moderate">Moderately Active</option>
                    <option value="very_active">Very Active</option>
                    <option value="extremely_active">Extremely Active</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Goal
                  </label>
                  <select
                    value={calcForm.goal}
                    onChange={(e) => setCalcForm({ ...calcForm, goal: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="loss">Weight Loss</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="gain">Muscle Gain</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={calculating}
                className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {calculating ? "Calculating..." : "Calculate"}
              </button>

              {recommendation && (
                <div className="mt-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-400 mb-2">
                    Recommendation
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center mb-3">
                    {[
                      { label: "Calories", value: `${recommendation.calories} kcal` },
                      { label: "Protein", value: `${recommendation.protein}g` },
                      { label: "Carbs", value: `${recommendation.carbs}g` },
                      { label: "Fat", value: `${recommendation.fat}g` },
                    ].map((m) => (
                      <div key={m.label} className="bg-white dark:bg-gray-900/50 rounded-lg p-2">
                        <p className="font-bold text-gray-900 dark:text-gray-100">{m.value}</p>
                        <p className="text-gray-400">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    BMR: {recommendation.bmr} kcal · TDEE: {recommendation.tdee} kcal
                  </p>
                  <button
                    type="button"
                    onClick={applyRecommendation}
                    className="text-sm px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Apply These Goals
                  </button>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Goal Form */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Set Goals
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { key: "calories", label: "Calories", unit: "kcal", min: 1000 },
                { key: "protein", label: "Protein", unit: "g", min: 10 },
                { key: "carbs", label: "Carbs", unit: "g", min: 10 },
                { key: "fat", label: "Fat", unit: "g", min: 10 },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {field.label} ({field.unit})
                  </label>
                  <input
                    type="number"
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field.key]: Number(e.target.value) })}
                    min={field.min}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Fiber (g) — Optional
                </label>
                <input
                  type="number"
                  value={form.fiber}
                  onChange={(e) => setForm({ ...form, fiber: Number(e.target.value) })}
                  min={0}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Water (L) — Optional
                </label>
                <input
                  type="number"
                  value={form.water}
                  onChange={(e) => setForm({ ...form, water: Number(e.target.value) })}
                  min={0}
                  step={0.1}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Live macro split */}
            <MacroBreakdown
              protein={form.protein}
              carbs={form.carbs}
              fat={form.fat}
              goalProtein={form.protein}
              goalCarbs={form.carbs}
              goalFat={form.fat}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Goals saved successfully!
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Goals"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
