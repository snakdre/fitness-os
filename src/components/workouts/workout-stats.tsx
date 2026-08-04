"use client"

import { Flame, Dumbbell, Clock, TrendingUp, Trophy } from "lucide-react"

interface WorkoutStatsProps {
  totalWorkouts: number
  thisWeek: number
  streak: number
  avgDuration: number
  totalVolume: number
}

interface StatCardProps {
  label: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
}

function StatCard({ label, value, subtitle, icon, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
    </div>
  )
}

export function WorkoutStats({
  totalWorkouts,
  thisWeek,
  streak,
  avgDuration,
  totalVolume,
}: WorkoutStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard
        label="Total Workouts"
        value={totalWorkouts}
        subtitle="all time"
        icon={<Dumbbell className="w-5 h-5" />}
        iconBg="bg-indigo-50"
        iconColor="text-indigo-600"
      />
      <StatCard
        label="This Week"
        value={thisWeek}
        subtitle="workouts"
        icon={<TrendingUp className="w-5 h-5" />}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
      />
      <StatCard
        label="Current Streak"
        value={`${streak} day${streak !== 1 ? "s" : ""}`}
        subtitle="keep going!"
        icon={<Flame className="w-5 h-5" />}
        iconBg="bg-orange-50"
        iconColor="text-orange-500"
      />
      <StatCard
        label="Avg Duration"
        value={avgDuration > 0 ? `${avgDuration} min` : "—"}
        subtitle="per workout"
        icon={<Clock className="w-5 h-5" />}
        iconBg="bg-purple-50"
        iconColor="text-purple-600"
      />
      <StatCard
        label="Total Volume"
        value={
          totalVolume > 0
            ? totalVolume >= 1000
              ? `${(totalVolume / 1000).toFixed(1)}t`
              : `${totalVolume.toLocaleString()} kg`
            : "—"
        }
        subtitle="weight lifted"
        icon={<Trophy className="w-5 h-5" />}
        iconBg="bg-yellow-50"
        iconColor="text-yellow-600"
      />
    </div>
  )
}
