import { cn } from "@/lib/utils"

interface MacroBreakdownProps {
  protein: number
  carbs: number
  fat: number
  goalProtein?: number
  goalCarbs?: number
  goalFat?: number
  className?: string
}

interface MacroProgressBarProps {
  label: string
  value: number
  goal?: number
  unit?: string
  color: string
  bgColor: string
}

function MacroProgressBar({
  label,
  value,
  goal,
  unit = "g",
  color,
  bgColor,
}: MacroProgressBarProps) {
  const percentage = goal ? Math.min(Math.round((value / goal) * 100), 100) : 0
  const isOver = goal ? value > goal : false

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span className={cn("font-semibold", isOver ? "text-red-500" : "text-gray-900 dark:text-gray-100")}>
            {Math.round(value)}
            {unit}
          </span>
          {goal && (
            <span className="text-gray-400">
              / {goal}
              {unit} ({percentage}%)
            </span>
          )}
        </div>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: bgColor }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: isOver ? "#ef4444" : color,
          }}
        />
      </div>
    </div>
  )
}

export function MacroBreakdown({
  protein,
  carbs,
  fat,
  goalProtein,
  goalCarbs,
  goalFat,
  className,
}: MacroBreakdownProps) {
  const totalCaloriesFromMacros = protein * 4 + carbs * 4 + fat * 9
  const proteinPct =
    totalCaloriesFromMacros > 0
      ? Math.round((protein * 4 / totalCaloriesFromMacros) * 100)
      : 0
  const carbsPct =
    totalCaloriesFromMacros > 0
      ? Math.round((carbs * 4 / totalCaloriesFromMacros) * 100)
      : 0
  const fatPct =
    totalCaloriesFromMacros > 0
      ? Math.round((fat * 9 / totalCaloriesFromMacros) * 100)
      : 0

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5",
        className
      )}
    >
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
        Macro Breakdown
      </h3>
      <p className="text-xs text-gray-400 mb-4">% of total calories from macros</p>

      {/* Stacked visual bar */}
      <div className="h-3 rounded-full flex overflow-hidden mb-4">
        <div className="h-full transition-all" style={{ width: `${proteinPct}%`, backgroundColor: "#3b82f6" }} />
        <div className="h-full transition-all" style={{ width: `${carbsPct}%`, backgroundColor: "#22c55e" }} />
        <div className="h-full transition-all" style={{ width: `${fatPct}%`, backgroundColor: "#eab308" }} />
      </div>

      <div className="space-y-3">
        <MacroProgressBar
          label="Protein"
          value={protein}
          goal={goalProtein}
          color="#3b82f6"
          bgColor="#dbeafe"
        />
        <MacroProgressBar
          label="Carbohydrates"
          value={carbs}
          goal={goalCarbs}
          color="#22c55e"
          bgColor="#dcfce7"
        />
        <MacroProgressBar
          label="Fat"
          value={fat}
          goal={goalFat}
          color="#eab308"
          bgColor="#fef9c3"
        />
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
        <span><span className="font-medium text-blue-500">{proteinPct}%</span> Protein</span>
        <span><span className="font-medium text-green-500">{carbsPct}%</span> Carbs</span>
        <span><span className="font-medium text-yellow-500">{fatPct}%</span> Fat</span>
      </div>
    </div>
  )
}
