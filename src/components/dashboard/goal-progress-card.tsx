import { cn } from "@/lib/utils"
import { Target, TrendingDown, TrendingUp, Zap, Activity } from "lucide-react"

interface Goal {
  id: string
  type: string
  description?: string | null
  targetWeight?: number | null
  currentWeight?: number | null
  startWeight?: number | null
  targetDate?: Date | null
  status: string
}

interface GoalProgressCardProps {
  goal: Goal
  className?: string
}

function getGoalIcon(type: string) {
  switch (type) {
    case "WEIGHT_LOSS":
      return TrendingDown
    case "MUSCLE_GAIN":
      return TrendingUp
    case "STRENGTH":
      return Zap
    case "ENDURANCE":
      return Activity
    default:
      return Target
  }
}

function getGoalLabel(type: string) {
  return type.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
}

function calculateProgress(goal: Goal): number {
  if (!goal.startWeight || !goal.targetWeight || !goal.currentWeight) return 0
  const totalChange = Math.abs(goal.targetWeight - goal.startWeight)
  if (totalChange === 0) return 100
  const currentChange = Math.abs(goal.currentWeight - goal.startWeight)
  return Math.min(100, Math.round((currentChange / totalChange) * 100))
}

export function GoalProgressCard({ goal, className }: GoalProgressCardProps) {
  const Icon = getGoalIcon(goal.type)
  const label = getGoalLabel(goal.type)
  const progress = calculateProgress(goal)

  const progressColor =
    progress >= 75
      ? "bg-green-500"
      : progress >= 40
        ? "bg-orange-500"
        : "bg-blue-500"

  return (
    <div
      className={cn(
        "bg-surface rounded-xl border border-border p-4",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-400">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            {goal.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">{goal.description}</p>
            )}
          </div>
        </div>
        <span className="text-sm font-bold text-foreground">{progress}%</span>
      </div>

      <div className="w-full bg-surface-2 rounded-full h-2 overflow-hidden">
        <div
          className={cn("h-2 rounded-full transition-all duration-500", progressColor)}
          style={{ width: `${progress}%` }}
        />
      </div>

      {goal.targetWeight && goal.currentWeight && (
        <div className="flex justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            Current: {goal.currentWeight}kg
          </span>
          <span className="text-xs text-muted-foreground">Target: {goal.targetWeight}kg</span>
        </div>
      )}

      {goal.targetDate && (
        <p className="text-xs text-muted-foreground mt-1">
          Target: {new Date(goal.targetDate).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
