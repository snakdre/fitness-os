import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { completeWorkout } from "@/services/workout.service"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    const workout = await completeWorkout(id, session.user.id)
    if (!workout)
      return NextResponse.json({ error: "Workout not found" }, { status: 404 })
    return NextResponse.json({ data: workout })
  } catch (error) {
    console.error("[POST /api/workouts/[id]/complete]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
