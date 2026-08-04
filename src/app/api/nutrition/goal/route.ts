import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getNutritionGoal, setNutritionGoal } from "@/services/nutrition.service"
import { setNutritionGoalSchema } from "@/lib/validations/nutrition"

export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goal = await getNutritionGoal(session.user.id)

    return NextResponse.json({ data: goal })
  } catch (error) {
    console.error("[GET /api/nutrition/goal]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const result = setNutritionGoalSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }

    const goal = await setNutritionGoal(session.user.id, result.data)

    return NextResponse.json({ data: goal })
  } catch (error) {
    console.error("[POST /api/nutrition/goal]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
