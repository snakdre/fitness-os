import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { getWorkoutStats } from "@/services/workout.service"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const stats = await getWorkoutStats(session.user.id)
    return NextResponse.json({ data: stats })
  } catch (error) {
    console.error("[GET /api/workouts/stats]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
