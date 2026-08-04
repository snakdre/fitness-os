import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { getExercises } from "@/services/workout.service"
import { ExercisesClient } from "./exercises-client"

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { category, search } = await searchParams
  const validCategories = ["STRENGTH", "CARDIO", "FLEXIBILITY", "BALANCE", "SPORTS", "OTHER"]
  const categoryFilter =
    category && validCategories.includes(category) ? category : undefined

  const exercises = await getExercises({
    category: categoryFilter,
    search: search ?? undefined,
    userId: session.user.id,
  })

  // Build muscle group stats for sidebar
  const muscleGroupCounts: Record<string, number> = {}
  for (const ex of exercises) {
    for (const mg of ex.muscleGroups) {
      muscleGroupCounts[mg] = (muscleGroupCounts[mg] ?? 0) + 1
    }
  }
  const topMuscleGroups = Object.entries(muscleGroupCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exercise Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {exercises.length} exercise{exercises.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <Link
          href="/workouts/exercises/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-foreground text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Custom Exercise
        </Link>
      </div>

      <ExercisesClient
        exercises={exercises}
        topMuscleGroups={topMuscleGroups}
        initialSearch={search ?? ""}
        initialCategory={
          (category as "STRENGTH" | "CARDIO" | "FLEXIBILITY" | "BALANCE" | "SPORTS" | "OTHER" | undefined) ?? undefined
        }
      />
    </div>
  )
}
