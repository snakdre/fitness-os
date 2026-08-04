"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Dumbbell, Clock, ChevronRight, CheckCircle2, Circle, Loader2, SkipForward } from "lucide-react"

type WorkoutStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"

interface WorkoutCardProps {
  id: string
  name: string
  date: string | Date
  exerciseCount: number
  status: WorkoutStatus
  duration?: number | null
  totalVolume?: number | null
  notes?: string | null
}

const statusConfig: Record<
  WorkoutStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  PLANNED: {
    label: "Planned",
    className: "bg-blue-100 text-blue-700",
    icon: <Circle className="w-3 h-3" />,
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-yellow-100 text-yellow-700",
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-100 text-green-700",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  SKIPPED: {
    label: "Skipped",
    className: "bg-gray-100 text-gray-500",
    icon: <SkipForward className="w-3 h-3" />,
  },
}

export function WorkoutCard({
  id,
  name,
  date,
  exerciseCount,
  status,
  duration,
  totalVolume,
  notes,
}: WorkoutCardProps) {
  const config = statusConfig[status]
  const parsedDate = typeof date === "string" ? new Date(date) : date

  return (
    <Link
      href={`/workouts/${id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
              {name}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {format(parsedDate, "EEEE, MMM d, yyyy")}
            </p>
          </div>
        </div>
        <ChevronRight className="flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors mt-0.5" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
        >
          {config.icon}
          {config.label}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
          <Dumbbell className="w-3 h-3" />
          {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
        </span>
        {duration != null && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {duration} min
          </span>
        )}
        {totalVolume != null && totalVolume > 0 && (
          <span className="text-xs text-gray-500">
            {totalVolume.toLocaleString()} kg volume
          </span>
        )}
      </div>

      {notes && (
        <p className="mt-2 text-xs text-gray-400 truncate">{notes}</p>
      )}
    </Link>
  )
}
