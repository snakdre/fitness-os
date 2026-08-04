import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { addExerciseSchema } from "@/lib/validations/workout"
import { addExerciseToWorkout } from "@/services/workout.service"

export async function POST(
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

  const result = addExerciseSchema.safeParse(body)
  if (!result.success)
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })

  try {
    const workoutExercise = await addExerciseToWorkout(id, session.user.id, result.data)
    if (!workoutExercise)
      return NextResponse.json(
        { error: "Workout not found or exercise does not exist" },
        { status: 404 }
      )
    return NextResponse.json({ data: workoutExercise }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/workouts/[id]/exercises]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
