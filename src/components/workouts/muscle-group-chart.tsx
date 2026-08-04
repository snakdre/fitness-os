"use client"

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

interface MuscleGroupData {
  muscleGroup: string
  count: number
}

interface MuscleGroupChartProps {
  data: MuscleGroupData[]
}

function formatLabel(mg: string) {
  return mg
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")
}

export function MuscleGroupChart({ data }: MuscleGroupChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <p className="text-sm">No muscle data yet</p>
        <p className="text-xs mt-1">Add exercises to see distribution</p>
      </div>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const chartData = data.map((d) => ({
    subject: formatLabel(d.muscleGroup),
    value: d.count,
    fullMark: maxCount,
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 10, fill: "#6b7280" }}
        />
        <Radar
          dataKey="value"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [value, "Sets"]}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "12px",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
