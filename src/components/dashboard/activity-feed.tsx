import { formatDistanceToNow } from "date-fns"
import { Dumbbell, Utensils, Activity, Bot, Target, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityEvent {
  id: string
  event: string
  timestamp: Date
  properties?: Record<string, unknown>
}

interface ActivityFeedProps {
  events: ActivityEvent[]
  className?: string
}

function getEventConfig(event: string) {
  switch (event) {
    case "WorkoutCompleted":
      return { icon: Dumbbell, color: "text-blue-400", bg: "bg-blue-500/10", label: "Workout completed" }
    case "MealLogged":
      return { icon: Utensils, color: "text-green-400", bg: "bg-green-500/10", label: "Meal logged" }
    case "BodyMeasurementAdded":
      return { icon: Activity, color: "text-purple-400", bg: "bg-purple-500/10", label: "Measurement logged" }
    case "AIConversationStarted":
      return { icon: Bot, color: "text-orange-400", bg: "bg-orange-500/10", label: "Chatted with AI Coach" }
    case "GoalCreated":
      return { icon: Target, color: "text-yellow-400", bg: "bg-yellow-500/10", label: "New goal created" }
    case "ShoppingListGenerated":
      return { icon: ShoppingCart, color: "text-teal-400", bg: "bg-teal-500/10", label: "Shopping list generated" }
    default:
      return { icon: Activity, color: "text-muted-foreground", bg: "bg-surface-2", label: event }
  }
}

export function ActivityFeed({ events, className }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <div className={cn("bg-surface rounded-xl border border-border p-6", className)}>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
        <p className="text-sm text-muted-foreground text-center py-4">
          No activity yet. Start logging your workouts and meals!
        </p>
      </div>
    )
  }

  return (
    <div className={cn("bg-surface rounded-xl border border-border p-4", className)}>
      <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
      <div className="space-y-3">
        {events.map((event) => {
          const config = getEventConfig(event.event)
          const Icon = config.icon
          return (
            <div key={event.id} className="flex items-center gap-3">
              <div className={cn("p-1.5 rounded-lg", config.bg, config.color)}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{config.label}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
