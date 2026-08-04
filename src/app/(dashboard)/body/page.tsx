"use client"

import { useEffect, useState } from "react"
import { WeightChart } from "@/components/body/weight-chart"
import { MeasurementForm } from "@/components/body/measurement-form"
import { MeasurementsTable } from "@/components/body/measurements-table"
import { Plus, TrendingDown, TrendingUp, Minus, Scale } from "lucide-react"
import { cn } from "@/lib/utils"

interface Measurement {
  id: string
  date: string
  weight?: number | null
  bodyFat?: number | null
  chest?: number | null
  waist?: number | null
  hips?: number | null
  biceps?: number | null
  thighs?: number | null
  calves?: number | null
  shoulders?: number | null
  neck?: number | null
  notes?: string | null
}

interface ProgressData {
  current: Measurement | null
  starting: Measurement | null
  trend: "gaining" | "losing" | "stable"
  chartData: Array<{ date: string; weight: number | null; bodyFat?: number | null }>
  weightChange: number
}

export default function BodyPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch("/api/body")
      if (res.ok) {
        const json = await res.json()
        setMeasurements(json.data ?? [])

        // Build progress from measurements
        const data = json.data ?? []
        if (data.length > 0) {
          const sorted = [...data].sort(
            (a: Measurement, b: Measurement) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          const starting = sorted[0]
          const current = sorted[sorted.length - 1]

          let trend: "gaining" | "losing" | "stable" = "stable"
          if (sorted.length >= 3) {
            const recent = sorted.slice(-3)
            const weights = recent.map((m: Measurement) => m.weight).filter(Boolean) as number[]
            if (weights.length >= 2) {
              const diff = weights[weights.length - 1] - weights[0]
              if (diff > 0.5) trend = "gaining"
              else if (diff < -0.5) trend = "losing"
            }
          }

          const startWeight = starting.weight ?? 0
          const currentWeight = current.weight ?? 0
          const weightChange = parseFloat((currentWeight - startWeight).toFixed(1))

          setProgress({
            current,
            starting,
            trend,
            chartData: sorted.map((m: Measurement) => ({
              date: m.date.split("T")[0],
              weight: m.weight ?? null,
              bodyFat: m.bodyFat ?? null,
            })),
            weightChange,
          })
        } else {
          setProgress(null)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleDelete(id: string) {
    const res = await fetch(`/api/body/${id}`, { method: "DELETE" })
    if (res.ok) {
      await loadData()
    }
  }

  function handleAdded() {
    setShowForm(false)
    loadData()
  }

  const TrendIcon =
    progress?.trend === "losing"
      ? TrendingDown
      : progress?.trend === "gaining"
        ? TrendingUp
        : Minus

  const trendColor =
    progress?.trend === "losing"
      ? "text-green-400"
      : progress?.trend === "gaining"
        ? "text-red-400"
        : "text-muted-foreground"

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Body Measurements</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Measurement
        </button>
      </div>

      {showForm && (
        <MeasurementForm
          onAdded={handleAdded}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Stats cards */}
      {progress && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-surface rounded-xl border border-border p-4">
            <Scale className="w-4 h-4 text-orange-400 mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {progress.current?.weight != null ? `${progress.current.weight} kg` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Current weight</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <TrendIcon className={cn("w-4 h-4 mb-2", trendColor)} />
            <p className={cn("text-2xl font-bold", trendColor)}>
              {progress.weightChange > 0 ? "+" : ""}
              {progress.weightChange} kg
            </p>
            <p className="text-xs text-muted-foreground">Since start</p>
          </div>
          {progress.current?.bodyFat != null && (
            <div className="bg-surface rounded-xl border border-border p-4">
              <p className="text-2xl font-bold text-foreground">{progress.current.bodyFat}%</p>
              <p className="text-xs text-muted-foreground">Body fat</p>
            </div>
          )}
        </div>
      )}

      {/* Weight Trend Chart */}
      {progress && progress.chartData.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Weight Trend</h2>
          <WeightChart data={progress.chartData} />
        </div>
      )}

      {/* Measurements History */}
      <div className="bg-surface rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold text-foreground mb-4">History</h2>
        <MeasurementsTable measurements={measurements} onDelete={handleDelete} />
      </div>
    </div>
  )
}
