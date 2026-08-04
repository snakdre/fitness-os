"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Save, Loader2, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Workout {
  id: string
  name: string
  date: Date | string
  notes?: string | null
  isTemplate: boolean
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"
  duration?: number | null
  caloriesBurned?: number | null
}

interface EditWorkoutClientProps {
  workout: Workout
}

export function EditWorkoutClient({ workout }: EditWorkoutClientProps) {
  const router = useRouter()
  const [name, setName] = useState(workout.name)
  const [date, setDate] = useState(
    format(new Date(workout.date), "yyyy-MM-dd'T'HH:mm")
  )
  const [notes, setNotes] = useState(workout.notes ?? "")
  const [isTemplate, setIsTemplate] = useState(workout.isTemplate)
  const [status, setStatus] = useState(workout.status)
  const [duration, setDuration] = useState<string>(workout.duration?.toString() ?? "")
  const [caloriesBurned, setCaloriesBurned] = useState<string>(
    workout.caloriesBurned?.toString() ?? ""
  )

  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Workout name is required")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch(`/api/workouts/${workout.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          date: new Date(date).toISOString(),
          notes: notes.trim() || undefined,
          isTemplate,
          status,
          duration: duration ? parseInt(duration) : undefined,
          caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error?.message ?? "Failed to update workout")
        return
      }
      router.push(`/workouts/${workout.id}`)
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this workout? This cannot be undone.")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/workouts/${workout.id}`, { method: "DELETE" })
      if (res.ok) {
        router.push("/workouts")
        router.refresh()
      }
    } catch {
      setError("Failed to delete workout")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/workouts/${workout.id}`}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Workout</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Workout Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white"
          >
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="SKIPPED">Skipped</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 60"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Calories Burned
            </label>
            <input
              type="number"
              min="0"
              value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(e.target.value)}
              placeholder="e.g. 400"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
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

      <div className="flex gap-3">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Delete
        </button>
        <div className="flex-1" />
        <Link
          href={`/workouts/${workout.id}`}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={submitting}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-foreground text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  )
}
