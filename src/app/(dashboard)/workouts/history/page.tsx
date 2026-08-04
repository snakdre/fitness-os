import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
} from "date-fns"
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, SkipForward } from "lucide-react"
import { getWorkouts } from "@/services/workout.service"

type WorkoutStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"

interface WorkoutDay {
  id: string
  name: string
  status: WorkoutStatus
}

export default async function WorkoutHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { month, year } = await searchParams
  const now = new Date()
  const targetMonth = month ? parseInt(month) - 1 : now.getMonth()
  const targetYear = year ? parseInt(year) : now.getFullYear()
  const currentDate = new Date(targetYear, targetMonth, 1)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)

  const { workouts } = await getWorkouts(session.user.id, {
    from: monthStart,
    to: monthEnd,
    limit: 100,
  })

  // Build a map: date string → workouts
  const workoutsByDay: Record<string, WorkoutDay[]> = {}
  for (const w of workouts) {
    const key = format(new Date(w.date), "yyyy-MM-dd")
    if (!workoutsByDay[key]) workoutsByDay[key] = []
    workoutsByDay[key].push({ id: w.id, name: w.name, status: w.status })
  }

  // Build calendar grid
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const allDays = eachDayOfInterval({ start: calStart, end: calEnd })

  const prevMonth = subMonths(currentDate, 1)
  const nextMonth = addMonths(currentDate, 1)

  const prevHref = `/workouts/history?month=${prevMonth.getMonth() + 1}&year=${prevMonth.getFullYear()}`
  const nextHref = `/workouts/history?month=${nextMonth.getMonth() + 1}&year=${nextMonth.getFullYear()}`

  const completedCount = workouts.filter((w) => w.status === "COMPLETED").length
  const skippedCount = workouts.filter((w) => w.status === "SKIPPED").length

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workout History</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {completedCount} completed · {skippedCount} skipped in{" "}
            {format(currentDate, "MMMM yyyy")}
          </p>
        </div>
        <Link
          href="/workouts"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Back to Workouts
        </Link>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link
            href={prevHref}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <h2 className="text-base font-semibold text-gray-900">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Link
            href={nextHref}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </Link>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-semibold text-gray-400"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-50">
          {allDays.map((day) => {
            const key = format(day, "yyyy-MM-dd")
            const dayWorkouts = workoutsByDay[key] ?? []
            const isCurrentMonth = day.getMonth() === targetMonth
            const isToday = isSameDay(day, now)
            const hasCompleted = dayWorkouts.some((w) => w.status === "COMPLETED")
            const hasSkipped = dayWorkouts.some((w) => w.status === "SKIPPED")

            return (
              <div
                key={key}
                className={`min-h-[64px] p-1.5 ${
                  !isCurrentMonth ? "bg-gray-50" : ""
                } ${isToday ? "bg-indigo-50" : ""}`}
              >
                <span
                  className={`text-xs font-medium block text-right ${
                    isToday
                      ? "text-indigo-600"
                      : isCurrentMonth
                      ? "text-gray-700"
                      : "text-gray-300"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {dayWorkouts.slice(0, 2).map((w) => (
                    <Link
                      key={w.id}
                      href={`/workouts/${w.id}`}
                      className={`block truncate text-xs px-1 py-0.5 rounded font-medium transition-opacity hover:opacity-80 ${
                        w.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : w.status === "SKIPPED"
                          ? "bg-gray-100 text-gray-400"
                          : w.status === "IN_PROGRESS"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                      title={w.name}
                    >
                      {w.name}
                    </Link>
                  ))}
                  {dayWorkouts.length > 2 && (
                    <span className="text-xs text-gray-400 pl-1">
                      +{dayWorkouts.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { color: "bg-green-100 text-green-700", label: "Completed" },
          { color: "bg-blue-100 text-blue-700", label: "Planned" },
          { color: "bg-yellow-100 text-yellow-700", label: "In Progress" },
          { color: "bg-gray-100 text-gray-400", label: "Skipped" },
        ].map((item) => (
          <span
            key={item.label}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${item.color}`}
          >
            {item.label}
          </span>
        ))}
      </div>

      {/* Month workout list */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          All Workouts — {format(currentDate, "MMMM yyyy")}
        </h2>
        {workouts.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            No workouts recorded this month
          </p>
        ) : (
          <div className="space-y-2">
            {workouts.map((w) => (
              <Link
                key={w.id}
                href={`/workouts/${w.id}`}
                className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-indigo-300 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {w.status === "COMPLETED" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : w.status === "SKIPPED" ? (
                    <SkipForward className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-blue-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {w.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(w.date), "EEE, MMM d · h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {w.duration && <span>{w.duration} min</span>}
                  {w.totalVolume && w.totalVolume > 0 && (
                    <span>{w.totalVolume.toLocaleString()} kg</span>
                  )}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
