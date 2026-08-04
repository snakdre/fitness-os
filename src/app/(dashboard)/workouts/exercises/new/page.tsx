"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, Plus, X } from "lucide-react"

const CATEGORIES = ["STRENGTH", "CARDIO", "FLEXIBILITY", "BALANCE", "SPORTS", "OTHER"] as const
const COMMON_MUSCLE_GROUPS = [
  "chest", "back", "shoulders", "biceps", "triceps",
  "quadriceps", "hamstrings", "glutes", "calves", "core",
  "abs", "legs", "full_body", "forearms",
]
const COMMON_EQUIPMENT = [
  "barbell", "dumbbell", "kettlebell", "bench", "cable",
  "machine", "resistance_band", "pull_up_bar", "bodyweight",
  "treadmill", "bike", "rowing_machine", "mat",
]

type Category = typeof CATEGORIES[number]

export default function NewCustomExercisePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [category, setCategory] = useState<Category>("STRENGTH")
  const [muscleGroups, setMuscleGroups] = useState<string[]>([])
  const [equipment, setEquipment] = useState<string[]>([])
  const [instructions, setInstructions] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [customMuscle, setCustomMuscle] = useState("")
  const [customEquipment, setCustomEquipment] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const toggleMuscle = (mg: string) => {
    setMuscleGroups((prev) =>
      prev.includes(mg) ? prev.filter((m) => m !== mg) : [...prev, mg]
    )
  }

  const toggleEquipment = (eq: string) => {
    setEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    )
  }

  const addCustomMuscle = () => {
    const v = customMuscle.trim().toLowerCase().replace(/\s+/g, "_")
    if (v && !muscleGroups.includes(v)) {
      setMuscleGroups((prev) => [...prev, v])
    }
    setCustomMuscle("")
  }

  const addCustomEquipment = () => {
    const v = customEquipment.trim().toLowerCase().replace(/\s+/g, "_")
    if (v && !equipment.includes(v)) {
      setEquipment((prev) => [...prev, v])
    }
    setCustomEquipment("")
  }

  const handleSubmit = async () => {
    if (!name.trim()) return setError("Name is required")
    if (muscleGroups.length === 0) return setError("Select at least one muscle group")

    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          muscleGroups,
          equipment,
          instructions: instructions.trim() || undefined,
          videoUrl: videoUrl.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error?.message ?? "Failed to create exercise")
        return
      }
      router.push("/workouts/exercises")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/workouts/exercises"
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Custom Exercise</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Exercise Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bulgarian Split Squat"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                  category === cat
                    ? "bg-indigo-600 text-foreground"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Muscle Groups <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {COMMON_MUSCLE_GROUPS.map((mg) => (
              <button
                key={mg}
                onClick={() => toggleMuscle(mg)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                  muscleGroups.includes(mg)
                    ? "bg-indigo-600 text-foreground"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {mg.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customMuscle}
              onChange={(e) => setCustomMuscle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomMuscle()}
              placeholder="Add custom muscle group..."
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
            <button
              onClick={addCustomMuscle}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {muscleGroups.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {muscleGroups.map((mg) => (
                <span
                  key={mg}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700"
                >
                  {mg.replace(/_/g, " ")}
                  <button onClick={() => toggleMuscle(mg)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Equipment
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {COMMON_EQUIPMENT.map((eq) => (
              <button
                key={eq}
                onClick={() => toggleEquipment(eq)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                  equipment.includes(eq)
                    ? "bg-indigo-600 text-foreground"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {eq.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customEquipment}
              onChange={(e) => setCustomEquipment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomEquipment()}
              placeholder="Add custom equipment..."
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
            <button
              onClick={addCustomEquipment}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Instructions
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Step-by-step instructions for performing this exercise..."
            rows={4}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Video URL (optional)
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-3 pb-8">
        <Link
          href="/workouts/exercises"
          className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors text-center"
        >
          Cancel
        </Link>
        <button
          onClick={handleSubmit}
          disabled={submitting || !name.trim() || muscleGroups.length === 0}
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-foreground text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Create Exercise
        </button>
      </div>
    </div>
  )
}
