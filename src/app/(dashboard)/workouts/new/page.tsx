"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  Loader2,
  Search,
  X,
} from "lucide-react"
import { ExerciseSearch } from "@/components/workouts/exercise-search"
import { ExerciseCard } from "@/components/workouts/exercise-card"

type ExerciseCategory = "STRENGTH" | "CARDIO" | "FLEXIBILITY" | "BALANCE" | "SPORTS" | "OTHER"

interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  muscleGroups: string[]
  equipment: string[]
  instructions?: string | null
  isCustom: boolean
}

interface SetInput {
  setNumber: number
  reps?: number
  weight?: number
  duration?: number
  distance?: number
  rpe?: number
}

interface ExerciseEntry {
  exerciseId: string
  exercise: Exercise
  order: number
  restTime?: number
  notes?: string
  sets: SetInput[]
}

const defaultSet = (num: number): SetInput => ({ setNumber: num, reps: 10, weight: 0 })

export default function NewWorkoutPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
  const [notes, setNotes] = useState("")
  const [isTemplate, setIsTemplate] = useState(false)
  const [exercises, setExercises] = useState<ExerciseEntry[]>([])

  // Exercise library state
  const [showLibrary, setShowLibrary] = useState(false)
  const [libraryExercises, setLibraryExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [loadingLibrary, setLoadingLibrary] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const loadLibrary = useCallback(async () => {
    if (libraryExercises.length > 0) return
    setLoadingLibrary(true)
    try {
      const res = await fetch("/api/exercises")
      const json = await res.json()
      setLibraryExercises(json.data ?? [])
      setFilteredExercises(json.data ?? [])
    } catch {
      // ignore
    } finally {
      setLoadingLibrary(false)
    }
  }, [libraryExercises.length])

  const handleShowLibrary = () => {
    setShowLibrary(true)
    loadLibrary()
  }

  const handleSearch = useCallback(
    (query: string) => {
      const q = query.toLowerCase()
      setFilteredExercises(
        libraryExercises.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.muscleGroups.some((m) => m.includes(q))
        )
      )
    },
    [libraryExercises]
  )

  const handleCategoryChange = useCallback(
    (cat: ExerciseCategory | undefined) => {
      setFilteredExercises(
        cat ? libraryExercises.filter((e) => e.category === cat) : libraryExercises
      )
    },
    [libraryExercises]
  )

  const addExercise = (exercise: Exercise) => {
    const already = exercises.find((e) => e.exerciseId === exercise.id)
    if (already) return
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: exercise.id,
        exercise,
        order: prev.length,
        sets: [defaultSet(1), defaultSet(2), defaultSet(3)],
      },
    ])
  }

  const removeExercise = (exerciseId: string) => {
    setExercises((prev) => prev.filter((e) => e.exerciseId !== exerciseId))
  }

  const moveExercise = (index: number, direction: "up" | "down") => {
    const next = [...exercises]
    const swapIdx = direction === "up" ? index - 1 : index + 1
    if (swapIdx < 0 || swapIdx >= next.length) return
    ;[next[index], next[swapIdx]] = [next[swapIdx], next[index]]
    next.forEach((e, i) => (e.order = i))
    setExercises(next)
  }

  const addSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((e) =>
        e.exerciseId === exerciseId
          ? { ...e, sets: [...e.sets, defaultSet(e.sets.length + 1)] }
          : e
      )
    )
  }

  const removeSet = (exerciseId: string, setNumber: number) => {
    setExercises((prev) =>
      prev.map((e) =>
        e.exerciseId === exerciseId
          ? {
              ...e,
              sets: e.sets
                .filter((s) => s.setNumber !== setNumber)
                .map((s, i) => ({ ...s, setNumber: i + 1 })),
            }
          : e
      )
    )
  }

  const updateSet = (exerciseId: string, setNumber: number, field: keyof SetInput, value: number) => {
    setExercises((prev) =>
      prev.map((e) =>
        e.exerciseId === exerciseId
          ? {
              ...e,
              sets: e.sets.map((s) =>
                s.setNumber === setNumber ? { ...s, [field]: value } : s
              ),
            }
          : e
      )
    )
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Workout name is required")
      return
    }
    setSubmitting(true)
    setError("")

    try {
      // Create the workout
      const workoutRes = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          date: new Date(date).toISOString(),
          notes: notes.trim() || undefined,
          isTemplate,
        }),
      })

      if (!workoutRes.ok) {
        const err = await workoutRes.json()
        setError(err.error?.message ?? "Failed to create workout")
        return
      }

      const { data: workout } = await workoutRes.json()

      // Add exercises
      for (const entry of exercises) {
        await fetch(`/api/workouts/${workout.id}/exercises`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseId: entry.exerciseId,
            order: entry.order,
            notes: entry.notes,
            restTime: entry.restTime,
            sets: entry.sets.map((s) => ({
              setNumber: s.setNumber,
              reps: s.reps,
              weight: s.weight || undefined,
              duration: s.duration,
              distance: s.distance,
              rpe: s.rpe,
            })),
          }),
        })
      }

      router.push(`/workouts/${workout.id}`)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">New Workout</h1>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Basic info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Workout Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Push Day, Morning Run..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Date &amp; Time
          </label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes for this workout..."
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isTemplate}
            onChange={(e) => setIsTemplate(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Save as template</span>
        </label>
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">Exercises</h2>

        {exercises.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
            <p className="text-sm">No exercises added yet</p>
            <p className="text-xs mt-1">Click &quot;Add Exercise&quot; to get started</p>
          </div>
        )}

        {exercises.map((entry, idx) => (
          <div key={entry.exerciseId} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 w-5 text-center">
                  {idx + 1}
                </span>
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    {entry.exercise.name}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {entry.exercise.muscleGroups.join(", ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveExercise(idx, "up")}
                  disabled={idx === 0}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => moveExercise(idx, "down")}
                  disabled={idx === exercises.length - 1}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => removeExercise(entry.exerciseId)}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sets */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-12 gap-1 px-1 text-xs font-medium text-gray-400">
                <span className="col-span-1 text-center">Set</span>
                <span className="col-span-4 text-center">Weight (kg)</span>
                <span className="col-span-4 text-center">Reps</span>
                <span className="col-span-3"></span>
              </div>
              {entry.sets.map((s) => (
                <div key={s.setNumber} className="grid grid-cols-12 gap-1 items-center">
                  <span className="col-span-1 text-center text-xs text-gray-500 font-medium">
                    {s.setNumber}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={s.weight ?? ""}
                    onChange={(e) =>
                      updateSet(entry.exerciseId, s.setNumber, "weight", parseFloat(e.target.value))
                    }
                    placeholder="0"
                    className="col-span-4 text-center text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                  <input
                    type="number"
                    min="1"
                    value={s.reps ?? ""}
                    onChange={(e) =>
                      updateSet(entry.exerciseId, s.setNumber, "reps", parseInt(e.target.value))
                    }
                    placeholder="10"
                    className="col-span-4 text-center text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeSet(entry.exerciseId, s.setNumber)}
                    disabled={entry.sets.length <= 1}
                    className="col-span-3 flex items-center justify-center w-7 h-7 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 disabled:opacity-30 mx-auto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addSet(entry.exerciseId)}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Set
            </button>
          </div>
        ))}

        <button
          onClick={handleShowLibrary}
          className="w-full py-3 border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-xl text-indigo-600 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Exercise
        </button>
      </div>

      {/* Exercise Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Exercise Library</h3>
              <button
                onClick={() => setShowLibrary(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-100">
              <ExerciseSearch
                onSearch={handleSearch}
                onCategoryChange={handleCategoryChange}
              />
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {loadingLibrary ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : filteredExercises.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">
                  No exercises found
                </p>
              ) : (
                filteredExercises.map((ex) => (
                  <ExerciseCard
                    key={ex.id}
                    {...ex}
                    onAdd={(id) => {
                      addExercise(ex)
                      setShowLibrary(false)
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3 pb-8">
        <button
          onClick={() => router.back()}
          className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !name.trim()}
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-foreground text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Workout
        </button>
      </div>
    </div>
  )
}
