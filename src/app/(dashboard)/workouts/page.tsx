import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { getWorkouts, getWorkoutStats } from "@/services/workout.service"
import { WorkoutCard } from "@/components/workouts/workout-card"
import { WorkoutStats } from "@/components/workouts/workout-stats"

export default async function WorkoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { status } = await searchParams
  const validStatuses = ["PLANNED", "IN_PROGRESS", "COMPLETED", "SKIPPED"]
  const statusFilter = status && validStatuses.includes(status) ? status : undefined

  const [{ workouts, total }, stats] = await Promise.all([
    getWorkouts(session.user.id, { status: statusFilter, limit: 20 }),
    getWorkoutStats(session.user.id),
  ])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(today)
  todayEnd.setHours(23, 59, 59, 999)

  const todayWorkouts = workouts.filter((w) => {
    const d = new Date(w.date)
    return d >= today && d <= todayEnd
  })
  const recentWorkouts = workouts.filter((w) => {
    const d = new Date(w.date)
    return !(d >= today && d <= todayEnd)
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workouts</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your training sessions</p>
        </div>
        <Link
          href="/workouts/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-foreground text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Workout
        </Link>
      </div>

      {/* Stats */}
      <WorkoutStats
        totalWorkouts={stats.totalWorkouts}
        thisWeek={stats.thisWeek}
        streak={stats.streak}
        avgDuration={stats.avgDuration}
        totalVolume={stats.totalVolume}
      />

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "All", value: undefined },
          { label: "Planned", value: "PLANNED" },
          { label: "In Progress", value: "IN_PROGRESS" },
          { label: "Completed", value: "COMPLETED" },
          { label: "Skipped", value: "SKIPPED" },
        ].map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/workouts?status=${tab.value}` : "/workouts"}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? "bg-indigo-600 text-foreground"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Today's workouts */}
      {todayWorkouts.length > 0 && !statusFilter && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Today
          </h2>
          <div className="space-y-3">
            {todayWorkouts.map((w) => (
              <WorkoutCard
                key={w.id}
                id={w.id}
                name={w.name}
                date={w.date}
                exerciseCount={w._count.exercises}
                status={w.status}
                duration={w.duration}
                totalVolume={w.totalVolume}
                notes={w.notes}
              />
            ))}
          </div>
        </section>
      )}

      {/* Workout list */}
      <section>
        {!statusFilter && recentWorkouts.length > 0 && (
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Recent
          </h2>
        )}
        {workouts.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500 font-medium">No workouts found</p>
            <p className="text-sm text-gray-400 mt-1">
              {statusFilter
                ? "Try a different filter or create a new workout"
                : "Start by creating your first workout"}
            </p>
            <Link
              href="/workouts/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-foreground text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Workout
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(statusFilter ? workouts : recentWorkouts).map((w) => (
              <WorkoutCard
                key={w.id}
                id={w.id}
                name={w.name}
                date={w.date}
                exerciseCount={w._count.exercises}
                status={w.status}
                duration={w.duration}
                totalVolume={w.totalVolume}
                notes={w.notes}
              />
            ))}
          </div>
        )}
        {total > 20 && (
          <p className="text-center text-sm text-gray-400 mt-4">
            Showing 20 of {total} workouts.{" "}
            <Link href="/workouts/history" className="text-indigo-600 hover:underline">
              View all history
            </Link>
          </p>
        )}
      </section>
    </div>
  )
}
