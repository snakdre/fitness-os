import { cn } from "@/lib/utils"
import { ShoppingCart, Bot, Trash2, CheckCircle } from "lucide-react"
import { format } from "date-fns"

interface ShoppingListItem {
  id: string
  isPurchased: boolean
}

interface ShoppingListCardProps {
  list: {
    id: string
    name: string
    aiGenerated: boolean
    createdAt: string | Date
    items: ShoppingListItem[]
  }
  isSelected?: boolean
  onSelect: () => void
  onDelete: () => void
}

export function ShoppingListCard({
  list,
  isSelected,
  onSelect,
  onDelete,
}: ShoppingListCardProps) {
  const totalItems = list.items.length
  const purchasedItems = list.items.filter((i) => i.isPurchased).length
  const progress = totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0

  return (
    <div
      className={cn(
        "bg-surface rounded-xl border p-4 cursor-pointer transition-colors",
        isSelected ? "border-orange-500/50 bg-orange-500/5" : "border-border hover:border-border-strong"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("p-1.5 rounded-lg", list.aiGenerated ? "bg-orange-500/10 text-orange-400" : "bg-surface-2 text-muted-foreground")}>
            {list.aiGenerated ? <Bot className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{list.name}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(list.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="shrink-0 p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
          aria-label="Delete list"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          {purchasedItems} / {totalItems} items
        </span>
        <span>{progress}%</span>
      </div>

      <div className="w-full bg-surface-2 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full bg-green-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
