import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  trend?: number // positive = up, negative = down, 0 or undefined = stable
  trendLabel?: string
  iconColor?: string
  className?: string
}

export function StatsCard({
  icon: Icon,
  value,
  label,
  trend,
  trendLabel,
  iconColor = "text-orange-400",
  className,
}: StatsCardProps) {
  const hasTrend = trend !== undefined

  return (
    <div
      className={cn(
        "bg-surface rounded-xl border border-border p-4 flex flex-col gap-3",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-2 rounded-lg bg-surface-2", iconColor)}>
          <Icon className="w-4 h-4" />
        </div>
        {hasTrend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend > 0 ? "text-green-400" : trend < 0 ? "text-red-400" : "text-muted-foreground"
            )}
          >
            {trend > 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : trend < 0 ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            {trendLabel ?? `${Math.abs(trend)}%`}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  )
}
