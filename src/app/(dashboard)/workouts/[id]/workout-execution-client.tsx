"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2, Timer, ChevronDown, ChevronUp } from "lucide-react"
import { SetTracker } from "@/components/workouts/set-tracker"

interface ExerciseSet {
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

interface WorkoutExercise {
  id: string
  order: number
  restTime?: number | null
  notes?: string | null
  exercise: {
    id: string
    name: string
    category: string
    muscleGroups: string[]
  }
  sets: ExerciseSet[]
}

interface Workout {
  id: string
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"
  exercises: WorkoutExercise[]
}

interface WorkoutExecutionClientProps {
  workout: Workout
  isActive: boolean
}

function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (remaining <= 0) {
      onDone()
      return
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining, onDone])

  const minutes = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-sm text-indigo-700 font-medium">
      <Timer className="w-4 h-4" />
      Rest: {minutes}:{secs.toString().padStart(2, "0")}
    </div>
  )
}

export function WorkoutExecutionClient({ workout, isActive }: WorkoutExecutionClientProps) {
  const router = useRouter()
  const [sets, setSets] = useState<Record<string, ExerciseSet[]>>(
    Object.fromEntries(workout.exercises.map((we) => [we.id, we.sets]))
  )
  const [restTimer, setRestTimer] = useState<{ exerciseId: string; seconds: number } | null>(null)
  const [completing, setCompleting] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const totalSets = Object.values(sets).flat().length
  const completedSets = Object.values(sets).flat().filter((s) => s.isCompleted).length
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  const handleSetUpdate = useCallback(
    async (
      workoutExerciseId: string,
      setId: string,
      data: Partial<ExerciseSet>
    ) => {
      // Optimistic update
      setSets((prev) => ({
        ...prev,
        [workoutExerciseId]: prev[workoutExerciseId].map((s) =>
          s.id === setId ? { ...s, ...data } : s
        ),
      }))

      try {
        await fetch(`/api/workouts/${workout.id}/sets/${setId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
      } catch {
        // revert on error would go here in a full app
      }

      // If marking complete, start rest timer
      const we = workout.exercises.find((e) => e.id === workoutExerciseId)
      if (data.isCompleted && we?.restTime) {
        setRestTimer({ exerciseId: workoutExerciseId, seconds: we.restTime })
      }
    },
    [workout.id, workout.exercises]
  )

  const handleComplete = async () => {
    setCompleting(true)
    try {
      const res = await fetch(`/api/workouts/${workout.id}/complete`, {
        method: "POST",
      })
      if (res.ok) {
        router.refresh()
      }
    } catch {
      // ignore
    } finally {
      setCompleting(false)
    }
  }

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      {isActive && totalSets > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Workout Progress
            </span>
            <span className="text-sm font-bold text-indigo-600">
              {completedSets}/{totalSets} sets
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Rest timer */}
      {restTimer && (
        <RestTimer
          seconds={restTimer.seconds}
          onDone={() => setRestTimer(null)}
        />
      )}

      {/* Exercises */}
      {workout.exercises.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
          <p className="text-sm">No exercises in this workout</p>
          <p className="text-xs mt-1">
            <a href={`/workouts/${workout.id}/edit`} className="text-indigo-600 hover:underline">
              Add exercises
            </a>{" "}
            to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {workout.exercises.map((we, idx) => (
            <div key={we.id} className="space-y-2">
              <button
                onClick={() => toggleCollapse(we.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {idx + 1}. {we.exercise.muscleGroups.slice(0, 2).join(" · ")}
                </span>
                {collapsed[we.id] ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {!collapsed[we.id] && (
                <SetTracker
                  workoutExerciseId={we.id}
                  exerciseName={we.exercise.name}
                  sets={sets[we.id] ?? []}
                  onSetUpdate={
                    isActive
                      ? (setId, data) => handleSetUpdate(we.id, setId, data)
                      : undefined
                  }
                />
              )}

              {we.notes && (
                <p className="text-xs text-gray-400 px-1">{we.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Complete Button */}
      {isActive && (
        <button
          onClick={handleComplete}
          disabled={completing}
          className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {completing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          Complete Workout
        </button>
      )}

      {workout.status === "COMPLETED" && (
        <div className="flex items-center justify-center gap-2 py-4 text-green-600">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold">Workout Completed!</span>
        </div>
      )}
    </div>
  )
}
