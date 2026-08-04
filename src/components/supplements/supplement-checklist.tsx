"use client"

import { cn } from "@/lib/utils"

interface Supplement {
  id: string
  name: string
  dosage: number
  unit: string
  category?: string | null
}

interface SupplementLog {
  id: string
  supplementId: string
  takenAt: string | Date
  dosage: number
}

interface SupplementChecklistProps {
  supplements: Supplement[]
  todayLogs: SupplementLog[]
  onTake: (supplementId: string, dosage: number) => Promise<void>
  className?: string
}

export function SupplementChecklist({
  supplements,
  todayLogs,
  onTake,
  className,
}: SupplementChecklistProps) {
  const takenIds = new Set(todayLogs.map((log) => log.supplementId))
  const takenCount = supplements.filter((s) => takenIds.has(s.id)).length

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Today&apos;s Supplements
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {takenCount} / {supplements.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 overflow-hidden">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{
            width: supplements.length > 0
              ? `${(takenCount / supplements.length) * 100}%`
              : "0%",
          }}
        />
      </div>

      {supplements.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          No active supplements. Add some to track your intake.
        </p>
      ) : (
        <div className="space-y-2">
          {supplements.map((supplement) => {
            const taken = takenIds.has(supplement.id)
            const log = todayLogs.find((l) => l.supplementId === supplement.id)

            return (
              <div
                key={supplement.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-colors",
                  taken
                    ? "bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30"
                    : "bg-gray-50 dark:bg-gray-800/50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      taken
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300 dark:border-gray-600"
                    )}
                  >
                    {taken && (
                      <span className="text-foreground text-[10px] font-bold">✓</span>
                    )}
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-medium",
                      taken
                        ? "text-green-700 dark:text-green-400"
                        : "text-gray-900 dark:text-gray-100"
                    )}>
                      {supplement.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {supplement.dosage} {supplement.unit}
                      {log && (
                        <span className="ml-1">
                          · taken at {new Date(log.takenAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {!taken && (
                  <button
                    onClick={() => onTake(supplement.id, supplement.dosage)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                  >
                    Take
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
