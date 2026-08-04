import { db } from "@/lib/db"
import type { BodyMeasurementInput } from "@/lib/validations/body"

export async function getBodyMeasurements(userId: string, limit?: number) {
  return db.bodyMeasurement.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    ...(limit ? { take: limit } : {}),
  })
}

export async function addBodyMeasurement(userId: string, data: BodyMeasurementInput) {
  const createData: Record<string, unknown> = { userId, ...data }

  if (data.date) {
    createData.date = new Date(data.date)
  }

  return db.bodyMeasurement.create({
    data: createData as Parameters<typeof db.bodyMeasurement.create>[0]["data"],
  })
}

export async function updateBodyMeasurement(
  id: string,
  userId: string,
  data: Partial<BodyMeasurementInput>
) {
  const measurement = await db.bodyMeasurement.findFirst({ where: { id, userId } })
  if (!measurement) return null

  const updateData: Record<string, unknown> = { ...data }
  if (data.date) {
    updateData.date = new Date(data.date)
  }

  return db.bodyMeasurement.update({ where: { id }, data: updateData })
}

export async function deleteBodyMeasurement(id: string, userId: string) {
  const measurement = await db.bodyMeasurement.findFirst({ where: { id, userId } })
  if (!measurement) return null

  return db.bodyMeasurement.delete({ where: { id } })
}

export async function getBodyProgress(userId: string) {
  const measurements = await db.bodyMeasurement.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    select: {
      id: true,
      date: true,
      weight: true,
      bodyFat: true,
      waist: true,
      chest: true,
      hips: true,
    },
  })

  if (measurements.length === 0) {
    return {
      current: null,
      starting: null,
      trend: "stable" as const,
      chartData: [],
      weightChange: 0,
    }
  }

  const starting = measurements[0]
  const current = measurements[measurements.length - 1]

  // Determine weight trend from last 3 measurements
  let trend: "gaining" | "losing" | "stable" = "stable"
  if (measurements.length >= 3) {
    const recent = measurements.slice(-3)
    const recentWeights = recent.map((m) => m.weight).filter((w) => w !== null) as number[]

    if (recentWeights.length >= 2) {
      const firstRecent = recentWeights[0]
      const lastRecent = recentWeights[recentWeights.length - 1]
      const diff = lastRecent - firstRecent
      if (diff > 0.5) trend = "gaining"
      else if (diff < -0.5) trend = "losing"
    }
  }

  const startingWeight = starting.weight ?? 0
  const currentWeight = current.weight ?? 0
  const weightChange = parseFloat((currentWeight - startingWeight).toFixed(1))

  // Build chart data
  const chartData = measurements.map((m) => ({
    date: m.date.toISOString().split("T")[0],
    weight: m.weight,
    bodyFat: m.bodyFat,
  }))

  return { current, starting, trend, chartData, weightChange }
}
