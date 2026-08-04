import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { calculateFitnessScore } from "@/lib/fitness-score"
import { FitnessScoreCard } from "@/components/dashboard/fitness-score-card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { GoalProgressCard } from "@/components/dashboard/goal-progress-card"
import { Dumbbell, Flame, Zap, Bot } from "lucide-react"
import Link from "next/link"

async function getDashboardData(userId: string) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const fourteenDaysAgo = new Date(now)
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  const [
    user,
    workoutsThisMonth,
    workoutsThisWeek,
    mealsThisMonth,
    activeGoals,
    recentEvents,
  ] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      include: { profile: true, nutritionGoal: true },
    }),
    db.workout.count({ where: { userId, date: { gte: thirtyDaysAgo }, status: "COMPLETED" } }),
    db.workout.count({ where: { userId, date: { gte: sevenDaysAgo }, status: "COMPLETED" } }),
    db.meal.count({ where: { userId, date: { gte: thirtyDaysAgo } } }),
    db.goal.findMany({
      where: { userId, status: "ACTIVE" },
      take: 4,
    }),
    db.analyticsEvent.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: 5,
    }),
  ])

  // Calculate nutrition days (distinct days with meals)
  const mealsForDays = await db.meal.findMany({
    where: { userId, date: { gte: thirtyDaysAgo } },
    select: { date: true },
  })
  const nutritionDays = new Set(
    mealsForDays.map((m) => m.date.toISOString().split("T")[0])
  ).size

  // Recovery days: rest days in last 14 days
  const workoutDaysLast14 = await db.workout.findMany({
    where: { userId, date: { gte: fourteenDaysAgo }, status: "COMPLETED" },
    select: { date: true },
  })
  const workoutDaySet = new Set(
    workoutDaysLast14.map((w) => w.date.toISOString().split("T")[0])
  )
  const recoveryDays = 14 - workoutDaySet.size

  // Goal progress average
  const goalProgressValues = activeGoals.map((g) => {
    if (!g.startWeight || !g.targetWeight || !g.currentWeight) return 0
    const totalChange = Math.abs(g.targetWeight - g.startWeight)
    if (totalChange === 0) return 100
    const currentChange = Math.abs(g.currentWeight - g.startWeight)
    return Math.min(100, (currentChange / totalChange) * 100)
  })
  const avgGoalProgress =
    goalProgressValues.length > 0
      ? goalProgressValues.reduce((a, b) => a + b, 0) / goalProgressValues.length
      : 0

  const fitnessScore = calculateFitnessScore({
    trainingConsistency: workoutsThisMonth,
    nutritionAdherence: nutritionDays,
    recoveryDays,
    goalProgress: avgGoalProgress,
  })

  // Today's calories (sum from MealItems)
  const todayMealItems = await db.mealItem.findMany({
    where: { meal: { userId, date: { gte: todayStart } } },
    select: { calories: true },
  })
  const todayCalories = Math.round(
    todayMealItems.reduce((sum, m) => sum + m.calories, 0)
  )
  const calorieGoal = (user?.nutritionGoal as { calories?: number } | null)?.calories ?? 2000

  return {
    user,
    fitnessScore,
    workoutsThisWeek,
    todayCalories,
    calorieGoal,
    activeGoals,
    recentEvents: recentEvents.map((e) => ({
      id: e.id,
      event: e.event,
      timestamp: e.timestamp,
      properties: e.properties as Record<string, unknown> | undefined,
    })),
  }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const data = await getDashboardData(session.user.id)
  const firstName = session.user.name?.split(" ")[0] ?? "there"
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  const calorieProgress = Math.min(100, Math.round((data.todayCalories / data.calorieGoal) * 100))

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, {firstName}!
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Link
          href="/ai-coach"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:block">AI Coach</span>
        </Link>
      </div>

      {/* Fitness Score + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fitness Score */}
        <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <FitnessScoreCard score={data.fitnessScore} />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Your overall fitness performance</p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on training, nutrition, recovery & goals
            </p>
          </div>
        </div>

        <StatsCard
          icon={Dumbbell}
          value={data.workoutsThisWeek}
          label="Workouts this week"
          iconColor="text-blue-400"
        />
        <StatsCard
          icon={Flame}
          value={`${data.todayCalories} / ${data.calorieGoal}`}
          label="Calories today"
          iconColor="text-orange-400"
        />
        <StatsCard
          icon={Zap}
          value={`${calorieProgress}%`}
          label="Nutrition goal"
          iconColor="text-green-400"
        />
      </div>

      {/* Today's Calorie Progress Bar */}
      <div className="bg-surface rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground">Today&apos;s Nutrition</p>
          <p className="text-sm text-muted-foreground">
            {data.todayCalories} / {data.calorieGoal} kcal
          </p>
        </div>
        <div className="w-full bg-surface-2 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
            style={{ width: `${calorieProgress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {data.calorieGoal - data.todayCalories > 0
            ? `${data.calorieGoal - data.todayCalories} kcal remaining`
            : "Daily goal reached!"}
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <QuickActions />
      </div>

      {/* Goals + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Goals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Active Goals
            </h2>
            <Link href="/profile#goals" className="text-xs text-orange-400 hover:text-orange-300">
              Manage goals
            </Link>
          </div>
          {data.activeGoals.length > 0 ? (
            <div className="space-y-3">
              {data.activeGoals.map((goal) => (
                <GoalProgressCard key={goal.id} goal={goal} />
              ))}
            </div>
          ) : (
            <div className="bg-surface rounded-xl border border-border p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">No active goals yet</p>
              <Link
                href="/profile#goals"
                className="text-sm text-orange-400 hover:text-orange-300 font-medium"
              >
                Set your first goal
              </Link>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <ActivityFeed events={data.recentEvents} />
      </div>
    </div>
  )
}
