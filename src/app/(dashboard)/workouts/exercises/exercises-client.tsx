"use client"

import { useState, useMemo } from "react"
import { ExerciseSearch } from "@/components/workouts/exercise-search"
import { ExerciseCard } from "@/components/workouts/exercise-card"
import { MuscleGroupChart } from "@/components/workouts/muscle-group-chart"

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

interface ExercisesClientProps {
  exercises: Exercise[]
  topMuscleGroups: { name: string; count: number }[]
  initialSearch?: string
  initialCategory?: ExerciseCategory
}

export function ExercisesClient({
  exercises,
  topMuscleGroups,
  initialSearch,
  initialCategory,
}: ExercisesClientProps) {
  const [search, setSearch] = useState(initialSearch ?? "")
  const [category, setCategory] = useState<ExerciseCategory | undefined>(initialCategory)
  const [muscleGroup, setMuscleGroup] = useState<string | undefined>(undefined)

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch =
        !search ||
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.muscleGroups.some((m) => m.toLowerCase().includes(search.toLowerCase()))
      const matchesCategory = !category || ex.category === category
      const matchesMuscle =
        !muscleGroup || ex.muscleGroups.includes(muscleGroup)
      return matchesSearch && matchesCategory && matchesMuscle
    })
  }, [exercises, search, category, muscleGroup])

  const chartData = topMuscleGroups.map((mg) => ({
    muscleGroup: mg.name,
    count: mg.count,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar with chart */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Muscle Distribution
          </h3>
          <MuscleGroupChart data={chartData} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Top Muscle Groups
          </h3>
          <div className="space-y-1.5">
            {topMuscleGroups.map((mg) => (
              <button
                key={mg.name}
                onClick={() =>
                  setMuscleGroup(muscleGroup === mg.name ? undefined : mg.name)
                }
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors capitalize ${
                  muscleGroup === mg.name
                    ? "bg-indigo-100 text-indigo-700"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <span>{mg.name.replace(/_/g, " ")}</span>
                <span className="font-semibold">{mg.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main list */}
      <div className="lg:col-span-3 space-y-4">
        <ExerciseSearch
          onSearch={setSearch}
          onCategoryChange={setCategory}
          onMuscleGroupChange={setMuscleGroup}
          initialSearch={initialSearch}
          initialCategory={initialCategory ?? "ALL"}
        />

        <p className="text-sm text-gray-500">
          Showing <strong>{filtered.length}</strong> exercise{filtered.length !== 1 ? "s" : ""}
          {muscleGroup && (
            <span>
              {" "}
              targeting <strong className="capitalize">{muscleGroup.replace(/_/g, " ")}</strong>
            </span>
          )}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No exercises found</p>
            <p className="text-xs mt-1">Try a different search term or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((ex) => (
              <ExerciseCard key={ex.id} {...ex} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
