"use client"

import { useState, useTransition } from "react"
import { Check, Loader2 } from "lucide-react"

interface Set {
  id: string
  setNumber: number
  reps?: number | null
  weight?: number | null
  duration?: number | null
  distance?: number | null
  isCompleted: boolean
  rpe?: number | null
  notes?: string | null
}

interface SetTrackerProps {
  workoutExerciseId: string
  exerciseName: string
  sets: Set[]
  onSetUpdate?: (setId: string, data: Partial<Set>) => Promise<void>
}

function SetRow({
  set,
  onUpdate,
}: {
  set: Set
  onUpdate: (data: Partial<Set>) => Promise<void>
}) {
  const [reps, setReps] = useState<string>(set.reps?.toString() ?? "")
  const [weight, setWeight] = useState<string>(set.weight?.toString() ?? "")
  const [isPending, startTransition] = useTransition()

  const handleComplete = () => {
    startTransition(async () => {
      const repsNum = reps ? parseInt(reps) : undefined
      const weightNum = weight ? parseFloat(weight) : undefined
      await onUpdate({
        isCompleted: !set.isCompleted,
        reps: repsNum,
        weight: weightNum,
      })
    })
  }

  const handleBlurReps = () => {
    if (reps !== (set.reps?.toString() ?? "")) {
      startTransition(async () => {
        await onUpdate({ reps: reps ? parseInt(reps) : undefined })
      })
    }
  }

  const handleBlurWeight = () => {
    if (weight !== (set.weight?.toString() ?? "")) {
      startTransition(async () => {
        await onUpdate({ weight: weight ? parseFloat(weight) : undefined })
      })
    }
  }

  return (
    <div
      className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
        set.isCompleted ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <span className="w-6 text-center text-sm font-medium text-gray-500">
        {set.setNumber}
      </span>

      <div className="flex items-center gap-2 flex-1">
        {set.duration != null ? (
          <span className="text-sm text-gray-600">{set.duration}s</span>
        ) : (
          <>
            <input
              type="number"
              min="0"
              placeholder="kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onBlur={handleBlurWeight}
              className="w-16 text-center text-sm border border-gray-200 rounded-md px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white"
              aria-label="Weight (kg)"
            />
            <span className="text-gray-400 text-xs">×</span>
            <input
              type="number"
              min="0"
              placeholder="reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              onBlur={handleBlurReps}
              className="w-16 text-center text-sm border border-gray-200 rounded-md px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white"
              aria-label="Reps"
            />
          </>
        )}
        {set.distance != null && (
          <span className="text-sm text-gray-600 ml-1">{set.distance} km</span>
        )}
      </div>

      <button
        onClick={handleComplete}
        disabled={isPending}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          set.isCompleted
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "bg-white border-2 border-gray-300 hover:border-green-400 text-transparent hover:text-green-400"
        }`}
        aria-label={set.isCompleted ? "Mark incomplete" : "Mark complete"}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        ) : (
          <Check className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}

export function SetTracker({
  exerciseName,
  sets,
  onSetUpdate,
}: SetTrackerProps) {
  const completedCount = sets.filter((s) => s.isCompleted).length

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h4 className="font-semibold text-gray-900 text-sm">{exerciseName}</h4>
        <span className="text-xs text-gray-500">
          {completedCount}/{sets.length} sets
        </span>
      </div>

      <div className="px-2 py-2 space-y-1">
        <div className="flex items-center gap-3 px-3 py-1">
          <span className="w-6 text-center text-xs font-medium text-gray-400">Set</span>
          <span className="flex-1 text-xs font-medium text-gray-400 text-center">Weight × Reps</span>
          <span className="w-8 text-center text-xs font-medium text-gray-400">Done</span>
        </div>
        {sets.map((set) => (
          <SetRow
            key={set.id}
            set={set}
            onUpdate={
              onSetUpdate
                ? (data) => onSetUpdate(set.id, data)
                : async () => {}
            }
          />
        ))}
      </div>

      {sets.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / sets.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
