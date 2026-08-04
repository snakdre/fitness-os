import { cn } from "@/lib/utils"

interface NutritionSummaryProps {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  goalCalories?: number
  goalProtein?: number
  goalCarbs?: number
  goalFat?: number
  className?: string
}

interface MacroBarProps {
  label: string
  value: number
  goal?: number
  unit?: string
  color: string
}

function MacroBar({ label, value, goal, unit = "g", color }: MacroBarProps) {
  const percentage = goal ? Math.min((value / goal) * 100, 100) : 0
  const isOver = goal ? value > goal : false

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className={cn("font-semibold", isOver ? "text-red-500" : "text-gray-900 dark:text-gray-100")}>
          {Math.round(value)}
          {unit}
          {goal && (
            <span className="text-xs font-normal text-gray-400 ml-1">
              / {goal}
              {unit}
            </span>
          )}
        </span>
      </div>
      {goal && (
        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", isOver ? "bg-red-400" : "")}
            style={{
              width: `${percentage}%`,
              backgroundColor: isOver ? undefined : color,
            }}
          />
        </div>
      )}
    </div>
  )
}

export function NutritionSummary({
  calories,
  protein,
  carbs,
  fat,
  fiber,
  goalCalories,
  goalProtein,
  goalCarbs,
  goalFat,
  className,
}: NutritionSummaryProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5",
        className
      )}
    >
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Daily Totals
      </h3>
      <div className="space-y-3">
        <MacroBar
          label="Calories"
          value={calories}
          goal={goalCalories}
          unit=" kcal"
          color="#f97316"
        />
        <MacroBar
          label="Protein"
          value={protein}
          goal={goalProtein}
          unit="g"
          color="#3b82f6"
        />
        <MacroBar
          label="Carbohydrates"
          value={carbs}
          goal={goalCarbs}
          unit="g"
          color="#22c55e"
        />
        <MacroBar
          label="Fat"
          value={fat}
          goal={goalFat}
          unit="g"
          color="#eab308"
        />
        {fiber != null && (
          <MacroBar
            label="Fiber"
            value={fiber}
            unit="g"
            color="#8b5cf6"
          />
        )}
      </div>
    </div>
  )
}
