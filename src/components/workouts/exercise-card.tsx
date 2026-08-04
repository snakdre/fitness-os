"use client"

import { Dumbbell, Activity, Zap, RefreshCw, Trophy, MoreHorizontal, Plus } from "lucide-react"

type ExerciseCategory = "STRENGTH" | "CARDIO" | "FLEXIBILITY" | "BALANCE" | "SPORTS" | "OTHER"

interface ExerciseCardProps {
  id: string
  name: string
  category: ExerciseCategory
  muscleGroups: string[]
  equipment: string[]
  instructions?: string | null
  isCustom?: boolean
  onAdd?: (id: string) => void
  selectable?: boolean
  selected?: boolean
  onSelect?: (id: string) => void
}

const categoryConfig: Record<
  ExerciseCategory,
  { label: string; className: string; icon: React.ReactNode }
> = {
  STRENGTH: {
    label: "Strength",
    className: "bg-red-100 text-red-700",
    icon: <Dumbbell className="w-3 h-3" />,
  },
  CARDIO: {
    label: "Cardio",
    className: "bg-orange-100 text-orange-700",
    icon: <Activity className="w-3 h-3" />,
  },
  FLEXIBILITY: {
    label: "Flexibility",
    className: "bg-green-100 text-green-700",
    icon: <RefreshCw className="w-3 h-3" />,
  },
  BALANCE: {
    label: "Balance",
    className: "bg-blue-100 text-blue-700",
    icon: <Zap className="w-3 h-3" />,
  },
  SPORTS: {
    label: "Sports",
    className: "bg-purple-100 text-purple-700",
    icon: <Trophy className="w-3 h-3" />,
  },
  OTHER: {
    label: "Other",
    className: "bg-gray-100 text-gray-600",
    icon: <MoreHorizontal className="w-3 h-3" />,
  },
}

export function ExerciseCard({
  id,
  name,
  category,
  muscleGroups,
  equipment,
  instructions,
  isCustom,
  onAdd,
  selectable,
  selected,
  onSelect,
}: ExerciseCardProps) {
  const config = categoryConfig[category]

  const handleClick = () => {
    if (selectable && onSelect) onSelect(id)
  }

  return (
    <div
      className={`bg-white rounded-xl border p-4 transition-all ${
        selectable
          ? "cursor-pointer hover:border-indigo-300 hover:shadow-sm"
          : "border-gray-200"
      } ${selected ? "border-indigo-500 ring-2 ring-indigo-200" : "border-gray-200"}`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
            {isCustom && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium">
                Custom
              </span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
            >
              {config.icon}
              {config.label}
            </span>
            {muscleGroups.slice(0, 3).map((mg) => (
              <span
                key={mg}
                className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 capitalize"
              >
                {mg.replace(/_/g, " ")}
              </span>
            ))}
            {muscleGroups.length > 3 && (
              <span className="text-xs text-gray-400">
                +{muscleGroups.length - 3} more
              </span>
            )}
          </div>
          {equipment.length > 0 && (
            <p className="mt-1 text-xs text-gray-400 capitalize">
              {equipment.join(" · ")}
            </p>
          )}
          {instructions && (
            <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{instructions}</p>
          )}
        </div>
        {onAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAdd(id)
            }}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center transition-colors"
            aria-label={`Add ${name}`}
          >
            <Plus className="w-4 h-4 text-indigo-600" />
          </button>
        )}
      </div>
    </div>
  )
}
