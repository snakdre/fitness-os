import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateExerciseSetSchema } from "@/lib/validations/workout"
import { updateExerciseSet } from "@/services/workout.service"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; setId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { setId } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const result = updateExerciseSetSchema.safeParse(body)
  if (!result.success)
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })

  try {
    const set = await updateExerciseSet(setId, session.user.id, result.data)
    if (!set)
      return NextResponse.json({ error: "Set not found" }, { status: 404 })
    return NextResponse.json({ data: set })
  } catch (error) {
    console.error("[PATCH /api/workouts/[id]/sets/[setId]]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
