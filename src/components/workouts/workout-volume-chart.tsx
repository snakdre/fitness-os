"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { format, parseISO } from "date-fns"

interface WeeklyVolumeData {
  week: string
  volume: number
}

interface WorkoutVolumeChartProps {
  data: WeeklyVolumeData[]
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="font-medium text-gray-700">
        Week of {label ? format(parseISO(label), "MMM d") : ""}
      </p>
      <p className="text-indigo-600 font-semibold">
        {payload[0].value.toLocaleString()} kg
      </p>
    </div>
  )
}

export function WorkoutVolumeChart({ data }: WorkoutVolumeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <p className="text-sm">No volume data yet</p>
        <p className="text-xs mt-1">Complete workouts to see your progress</p>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    label: d.week,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickFormatter={(v) => {
            try {
              return format(parseISO(v), "MMM d")
            } catch {
              return v
            }
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
          }
          width={40}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f5f3ff" }} />
        <Bar
          dataKey="volume"
          fill="#6366f1"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
