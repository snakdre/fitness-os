"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface SupplementCardProps {
  id: string
  name: string
  brand?: string | null
  dosage: number
  unit: string
  frequency: string
  category?: string | null
  instructions?: string | null
  isActive: boolean
  lastTaken?: Date | null
  onTake: (id: string, dosage: number) => Promise<void>
  onDeactivate?: (id: string) => void
  onDelete?: (id: string) => void
  className?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  protein: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  vitamin: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  mineral: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  creatine: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  preworkout: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  omega: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
}

export function SupplementCard({
  id,
  name,
  brand,
  dosage,
  unit,
  frequency,
  category,
  instructions,
  isActive,
  lastTaken,
  onTake,
  onDeactivate,
  onDelete,
  className,
}: SupplementCardProps) {
  const [taking, setTaking] = useState(false)

  async function handleTake() {
    setTaking(true)
    try {
      await onTake(id, dosage)
    } finally {
      setTaking(false)
    }
  }

  const categoryKey = category?.toLowerCase().replace(/\s+/g, "") ?? ""
  const badgeClass = CATEGORY_COLORS[categoryKey] ?? "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"

  const takenToday = lastTaken
    ? new Date(lastTaken).toDateString() === new Date().toDateString()
    : false

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4",
        !isActive && "opacity-60",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {name}
            </h3>
            {category && (
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize", badgeClass)}>
                {category}
              </span>
            )}
            {takenToday && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                Taken ✓
              </span>
            )}
          </div>
          {brand && (
            <p className="text-xs text-gray-400 mt-0.5">{brand}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span>
              {dosage} {unit}
            </span>
            <span>·</span>
            <span>{frequency}</span>
          </div>
          {instructions && (
            <p className="text-xs text-gray-400 mt-1.5 italic line-clamp-2">{instructions}</p>
          )}
          {lastTaken && !takenToday && (
            <p className="text-xs text-gray-400 mt-1.5">
              Last taken: {new Date(lastTaken).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {isActive && (
            <button
              onClick={handleTake}
              disabled={taking || takenToday}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg font-medium transition-colors",
                takenToday
                  ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 cursor-default"
                  : "bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-60"
              )}
            >
              {taking ? "Logging..." : takenToday ? "Done" : "Take"}
            </button>
          )}
          <div className="flex items-center gap-1">
            {onDeactivate && isActive && (
              <button
                onClick={() => onDeactivate(id)}
                className="text-[10px] text-gray-400 hover:text-orange-500 px-1.5 py-0.5 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
              >
                Pause
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(id)}
                className="text-[10px] text-gray-400 hover:text-red-500 px-1.5 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
