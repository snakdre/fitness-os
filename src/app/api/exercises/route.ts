import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { createExerciseSchema } from "@/lib/validations/workout"
import { getExercises, createCustomExercise } from "@/services/workout.service"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category") ?? undefined
  const search = searchParams.get("search") ?? undefined

  try {
    const exercises = await getExercises({ category, search, userId: session.user.id })
    return NextResponse.json({ data: exercises })
  } catch (error) {
    console.error("[GET /api/exercises]", error)
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

  const result = createExerciseSchema.safeParse(body)
  if (!result.success)
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })

  try {
    const exercise = await createCustomExercise(session.user.id, result.data)
    return NextResponse.json({ data: exercise }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/exercises]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
