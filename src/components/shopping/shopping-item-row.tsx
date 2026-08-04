"use client"

import { cn } from "@/lib/utils"

const categoryColors: Record<string, string> = {
  protein: "bg-red-500/10 text-red-400",
  produce: "bg-green-500/10 text-green-400",
  dairy: "bg-blue-500/10 text-blue-400",
  grains: "bg-yellow-500/10 text-yellow-400",
  fats: "bg-purple-500/10 text-purple-400",
  supplements: "bg-orange-500/10 text-orange-400",
  other: "bg-zinc-700 text-muted-foreground",
}

interface ShoppingItemRowProps {
  item: {
    id: string
    name: string
    quantity?: number | null
    unit?: string | null
    category?: string | null
    isPurchased: boolean
    estimatedCost?: number | null
  }
  onToggle: (id: string, isPurchased: boolean) => void
}

export function ShoppingItemRow({ item, onToggle }: ShoppingItemRowProps) {
  const colorClass = categoryColors[item.category ?? "other"] ?? categoryColors.other

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors cursor-pointer",
        item.isPurchased ? "opacity-50" : "hover:bg-surface-2/50"
      )}
      onClick={() => onToggle(item.id, !item.isPurchased)}
    >
      {/* Checkbox */}
      <div
        className={cn(
          "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
          item.isPurchased
            ? "bg-green-500 border-green-500"
            : "border-zinc-600 bg-transparent"
        )}
      >
        {item.isPurchased && (
          <svg className="w-2.5 h-2.5 text-foreground" fill="none" viewBox="0 0 10 10">
            <path
              d="M1.5 5L4 7.5L8.5 2.5"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Name and details */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "text-sm",
            item.isPurchased ? "line-through text-muted-foreground" : "text-foreground"
          )}
        >
          {item.name}
        </span>
        {(item.quantity || item.unit) && (
          <span className="text-xs text-muted-foreground ml-1.5">
            {item.quantity} {item.unit}
          </span>
        )}
      </div>

      {/* Category badge */}
      {item.category && (
        <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0", colorClass)}>
          {item.category}
        </span>
      )}

      {/* Cost */}
      {item.estimatedCost != null && (
        <span className="text-xs text-muted-foreground shrink-0">
          ${item.estimatedCost.toFixed(2)}
        </span>
      )}
    </div>
  )
}
