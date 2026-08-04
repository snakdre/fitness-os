import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { createWorkoutSchema } from "@/lib/validations/workout"
import { createWorkout, getWorkouts } from "@/services/workout.service"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") ?? undefined
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20
  const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0

  try {
    const result = await getWorkouts(session.user.id, { status, from, to, limit, offset })
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error("[GET /api/workouts]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const result = createWorkoutSchema.safeParse(body)
  if (!result.success)
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })

  try {
    const workout = await createWorkout(session.user.id, result.data)
    return NextResponse.json({ data: workout }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/workouts]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
