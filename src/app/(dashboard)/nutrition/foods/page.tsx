"use client"

import { useState, useEffect, useCallback } from "react"

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
  isCustom: boolean
  isPublic: boolean
}

const defaultForm = {
  name: "",
  brand: "",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sodium: 0,
  sugar: 0,
  servingSize: 100,
  servingUnit: "g",
  barcode: "",
}

export default function FoodLibraryPage() {
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "custom" | "public">("all")

  const loadFoods = useCallback(async (q = "") => {
    setLoading(true)
    try {
      const res = await fetch(`/api/food?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const json = await res.json()
        setFoods(json.data ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => loadFoods(search), 300)
    return () => clearTimeout(timer)
  }, [search, loadFoods])

  function handleEdit(food: FoodItem) {
    setEditingId(food.id)
    setForm({
      name: food.name,
      brand: food.brand ?? "",
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber ?? 0,
      sodium: 0,
      sugar: 0,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      barcode: "",
    })
    setShowForm(true)
    setError(null)
  }

  function resetForm() {
    setForm(defaultForm)
    setEditingId(null)
    setShowForm(false)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const payload = {
        name: form.name,
        brand: form.brand || undefined,
        calories: form.calories,
        protein: form.protein,
        carbs: form.carbs,
        fat: form.fat,
        fiber: form.fiber || undefined,
        sodium: form.sodium || undefined,
        sugar: form.sugar || undefined,
        servingSize: form.servingSize,
        servingUnit: form.servingUnit,
        barcode: form.barcode || undefined,
      }

      const url = editingId ? `/api/food/${editingId}` : "/api/food"
      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(JSON.stringify(json.error) ?? "Failed to save food")
      }

      resetForm()
      loadFoods(search)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this food item?")) return
    const res = await fetch(`/api/food/${id}`, { method: "DELETE" })
    if (res.ok) {
      loadFoods(search)
    }
  }

  const filteredFoods = foods.filter((f) => {
    if (filter === "custom") return f.isCustom
    if (filter === "public") return f.isPublic && !f.isCustom
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Food Library</h1>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm) }}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + New Food
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {editingId ? "Edit Food" : "Create Custom Food"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Chicken Breast"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Generic"
                  />
                </div>
              </div>

              {/* Serving */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Serving Size
                  </label>
                  <input
                    type="number"
                    value={form.servingSize}
                    onChange={(e) => setForm({ ...form, servingSize: Number(e.target.value) })}
                    min={0.1}
                    step={0.1}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={form.servingUnit}
                    onChange={(e) => setForm({ ...form, servingUnit: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="g, ml, oz..."
                  />
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: "calories", label: "Calories", unit: "kcal" },
                  { key: "protein", label: "Protein", unit: "g" },
                  { key: "carbs", label: "Carbs", unit: "g" },
                  { key: "fat", label: "Fat", unit: "g" },
                ].map((macro) => (
                  <div key={macro.key}>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {macro.label} ({macro.unit})
                    </label>
                    <input
                      type="number"
                      value={form[macro.key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [macro.key]: Number(e.target.value) })}
                      min={0}
                      step={0.1}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>

              {/* Optional macros */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "fiber", label: "Fiber (g)" },
                  { key: "sodium", label: "Sodium (mg)" },
                  { key: "sugar", label: "Sugar (g)" },
                ].map((macro) => (
                  <div key={macro.key}>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {macro.label}
                    </label>
                    <input
                      type="number"
                      value={form[macro.key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [macro.key]: Number(e.target.value) })}
                      min={0}
                      step={0.1}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update Food" : "Create Food"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search foods..."
            className="flex-1 px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-1">
            {(["all", "custom", "public"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors capitalize ${
                  filter === f
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Food List */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
          ) : filteredFoods.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              {search ? `No foods found for "${search}"` : "No foods available"}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredFoods.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {food.name}
                      </span>
                      {food.brand && (
                        <span className="text-xs text-gray-400">{food.brand}</span>
                      )}
                      {food.isCustom && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {food.calories} kcal
                      </span>
                      <span>P {food.protein}g</span>
                      <span>C {food.carbs}g</span>
                      <span>F {food.fat}g</span>
                      <span>/ {food.servingSize}{food.servingUnit}</span>
                    </div>
                  </div>
                  {food.isCustom && (
                    <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(food)}
                        className="text-xs px-2 py-1 rounded text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(food.id)}
                        className="text-xs px-2 py-1 rounded text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
