import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateWorkoutSchema } from "@/lib/validations/workout"
import {
  getWorkout,
  updateWorkout,
  deleteWorkout,
} from "@/services/workout.service"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    const workout = await getWorkout(id, session.user.id)
    if (!workout)
      return NextResponse.json({ error: "Workout not found" }, { status: 404 })
    return NextResponse.json({ data: workout })
  } catch (error) {
    console.error("[GET /api/workouts/[id]]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const result = updateWorkoutSchema.safeParse(body)
  if (!result.success)
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })

  try {
    const workout = await updateWorkout(id, session.user.id, result.data)
    if (!workout)
      return NextResponse.json({ error: "Workout not found" }, { status: 404 })
    return NextResponse.json({ data: workout })
  } catch (error) {
    console.error("[PUT /api/workouts/[id]]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    const deleted = await deleteWorkout(id, session.user.id)
    if (!deleted)
      return NextResponse.json({ error: "Workout not found" }, { status: 404 })
    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    console.error("[DELETE /api/workouts/[id]]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
