"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { SupplementCard } from "@/components/supplements/supplement-card"
import { SupplementChecklist } from "@/components/supplements/supplement-checklist"

interface Supplement {
  id: string
  name: string
  brand?: string | null
  dosage: number
  unit: string
  frequency: string
  instructions?: string | null
  category?: string | null
  isActive: boolean
  startDate: string
  endDate?: string | null
  logs: Array<{ id: string; takenAt: string; dosage: number }>
}

interface SupplementLog {
  id: string
  supplementId: string
  takenAt: string
  dosage: number
  notes?: string | null
  supplement: { name: string }
}

const defaultForm = {
  name: "",
  brand: "",
  dosage: 1,
  unit: "capsule(s)",
  frequency: "Daily",
  instructions: "",
  startDate: format(new Date(), "yyyy-MM-dd"),
  endDate: "",
  category: "",
}

export default function SupplementsPage() {
  const [supplements, setSupplements] = useState<Supplement[]>([])
  const [todayLogs, setTodayLogs] = useState<SupplementLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"active" | "all">("active")

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [suppRes, logsRes] = await Promise.all([
        fetch("/api/supplements"),
        fetch("/api/supplements/today"),
      ])
      const [suppJson, logsJson] = await Promise.all([suppRes.json(), logsRes.json()])
      setSupplements(suppJson.data ?? [])
      setTodayLogs(logsJson.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleTake(supplementId: string, dosage: number) {
    const res = await fetch("/api/supplements/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplementId, dosage }),
    })
    if (res.ok) {
      await loadData()
    }
  }

  async function handleDeactivate(id: string) {
    const res = await fetch(`/api/supplements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false }),
    })
    if (res.ok) loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this supplement?")) return
    const res = await fetch(`/api/supplements/${id}`, { method: "DELETE" })
    if (res.ok) loadData()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const payload = {
        name: form.name,
        brand: form.brand || undefined,
        dosage: form.dosage,
        unit: form.unit,
        frequency: form.frequency,
        instructions: form.instructions || undefined,
        startDate: `${form.startDate}T00:00:00.000Z`,
        endDate: form.endDate ? `${form.endDate}T00:00:00.000Z` : undefined,
        category: form.category || undefined,
      }

      const res = await fetch("/api/supplements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(JSON.stringify(json.error) ?? "Failed to save supplement")
      }

      setForm(defaultForm)
      setShowForm(false)
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const activeSupplements = supplements.filter((s) => s.isActive)
  const displayedSupplements = activeTab === "active" ? activeSupplements : supplements

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Supplements
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Add Supplement
          </button>
        </div>

        {/* Add Supplement Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              New Supplement
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
                    placeholder="e.g. Creatine Monohydrate"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    placeholder="e.g. Optimum Nutrition"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Dosage *
                  </label>
                  <input
                    type="number"
                    value={form.dosage}
                    onChange={(e) => setForm({ ...form, dosage: Number(e.target.value) })}
                    min={0.1}
                    step={0.1}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Unit *
                  </label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    required
                    placeholder="mg, g, ml, capsule(s)"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    <option value="protein">Protein</option>
                    <option value="vitamin">Vitamin</option>
                    <option value="mineral">Mineral</option>
                    <option value="creatine">Creatine</option>
                    <option value="omega">Omega</option>
                    <option value="preworkout">Pre-Workout</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Frequency *
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Daily</option>
                  <option>Twice daily</option>
                  <option>Three times daily</option>
                  <option>With meals</option>
                  <option>Pre-workout</option>
                  <option>Post-workout</option>
                  <option>Weekly</option>
                  <option>As needed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Instructions
                </label>
                <textarea
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  rows={2}
                  placeholder="e.g. Take with 250ml water"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Add Supplement"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(null) }}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Today's Checklist */}
            <SupplementChecklist
              supplements={activeSupplements}
              todayLogs={todayLogs}
              onTake={handleTake}
            />

            {/* Supplement List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  My Supplements
                </h2>
                <div className="flex items-center gap-1">
                  {(["active", "all"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors capitalize ${
                        activeTab === t
                          ? "bg-blue-500 text-white"
                          : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {t} {t === "active" ? `(${activeSupplements.length})` : `(${supplements.length})`}
                    </button>
                  ))}
                </div>
              </div>

              {displayedSupplements.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                  <p className="text-gray-400 mb-2">No supplements yet</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Add your first supplement →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedSupplements.map((supplement) => {
                    const lastLog = supplement.logs[0]
                    return (
                      <SupplementCard
                        key={supplement.id}
                        id={supplement.id}
                        name={supplement.name}
                        brand={supplement.brand}
                        dosage={supplement.dosage}
                        unit={supplement.unit}
                        frequency={supplement.frequency}
                        category={supplement.category}
                        instructions={supplement.instructions}
                        isActive={supplement.isActive}
                        lastTaken={lastLog ? new Date(lastLog.takenAt) : null}
                        onTake={handleTake}
                        onDeactivate={handleDeactivate}
                        onDelete={handleDelete}
                      />
                    )
                  })}
                </div>
              )}
            </div>

            {/* Today's Log */}
            {todayLogs.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Today&apos;s Log
                </h2>
                <div className="space-y-2">
                  {todayLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between py-1.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {log.supplement.name}
                        </p>
                        <p className="text-xs text-gray-400">{log.dosage} units</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(log.takenAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
