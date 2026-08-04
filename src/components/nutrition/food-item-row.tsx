import { cn } from "@/lib/utils"

interface FoodItemRowProps {
  name: string
  brand?: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
  quantity?: number
  servingSize?: number
  servingUnit?: string
  onRemove?: () => void
  className?: string
}

export function FoodItemRow({
  name,
  brand,
  calories,
  protein,
  carbs,
  fat,
  quantity,
  servingSize,
  servingUnit = "g",
  onRemove,
  className,
}: FoodItemRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 group",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {name}
          </span>
          {brand && (
            <span className="text-xs text-gray-400 dark:text-gray-500 truncate">{brand}</span>
          )}
        </div>
        {quantity != null && servingSize != null && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {quantity} × {servingSize}
            {servingUnit}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 ml-3 shrink-0">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {Math.round(calories)} kcal
          </span>
          <span className="hidden sm:inline">P: {Math.round(protein)}g</span>
          <span className="hidden sm:inline">C: {Math.round(carbs)}g</span>
          <span className="hidden sm:inline">F: {Math.round(fat)}g</span>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
            aria-label="Remove item"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
