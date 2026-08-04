"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface WeightDataPoint {
  date: string
  weight: number | null
  bodyFat?: number | null
}

interface WeightChartProps {
  data: WeightDataPoint[]
}

export function WeightChart({ data }: WeightChartProps) {
  const filteredData = data.filter((d) => d.weight !== null)

  if (filteredData.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Add at least 2 weight measurements to see your trend
      </div>
    )
  }

  const minWeight = Math.min(...filteredData.map((d) => d.weight!)) - 2
  const maxWeight = Math.max(...filteredData.map((d) => d.weight!)) + 2

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={filteredData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#71717a" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => {
            const date = new Date(v)
            return `${date.getMonth() + 1}/${date.getDate()}`
          }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#71717a" }}
          tickLine={false}
          axisLine={false}
          domain={[minWeight, maxWeight]}
          tickFormatter={(v) => `${v}kg`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#18181b",
            border: "1px solid #3f3f46",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          labelStyle={{ color: "#a1a1aa" }}
          itemStyle={{ color: "#f97316" }}
          formatter={(value) => [`${value} kg`, "Weight"]}
          labelFormatter={(label) => typeof label === "string" ? new Date(label).toLocaleDateString() : String(label)}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#f97316"
          strokeWidth={2}
          dot={{ fill: "#f97316", strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: "#f97316" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
