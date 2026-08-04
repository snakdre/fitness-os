import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Edit, Trash2, CheckCircle2, Clock, Dumbbell } from "lucide-react"
import { getWorkout } from "@/services/workout.service"
import { WorkoutExecutionClient } from "./workout-execution-client"

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params
  const workout = await getWorkout(id, session.user.id)
  if (!workout) notFound()

  const isActive =
    workout.status === "PLANNED" || workout.status === "IN_PROGRESS"

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/workouts"
            className="mt-1 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{workout.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {format(new Date(workout.date), "EEEE, MMMM d, yyyy · h:mm a")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/workouts/${workout.id}/edit`}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Edit workout"
          >
            <Edit className="w-5 h-5 text-gray-500" />
          </Link>
        </div>
      </div>

      {/* Status & Metadata */}
      <div className="flex flex-wrap gap-3">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
            workout.status === "COMPLETED"
              ? "bg-green-100 text-green-700"
              : workout.status === "IN_PROGRESS"
              ? "bg-yellow-100 text-yellow-700"
              : workout.status === "SKIPPED"
              ? "bg-gray-100 text-gray-500"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {workout.status === "COMPLETED" && <CheckCircle2 className="w-3.5 h-3.5" />}
          {workout.status.replace("_", " ")}
        </span>
        {workout.duration && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
            <Clock className="w-3.5 h-3.5" />
            {workout.duration} min
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
          <Dumbbell className="w-3.5 h-3.5" />
          {workout.exercises.length} exercise{workout.exercises.length !== 1 ? "s" : ""}
        </span>
        {workout.totalVolume != null && workout.totalVolume > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
            {workout.totalVolume.toLocaleString()} kg total volume
          </span>
        )}
      </div>

      {workout.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          {workout.notes}
        </div>
      )}

      {/* Workout Execution */}
      <WorkoutExecutionClient
        workout={workout}
        isActive={isActive}
      />
    </div>
  )
}
