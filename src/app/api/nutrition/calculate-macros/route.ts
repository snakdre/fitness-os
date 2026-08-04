import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { calculateMacros } from "@/services/nutrition.service"
import { calculateMacrosSchema } from "@/lib/validations/nutrition"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const result = calculateMacrosSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }

    const { weight, height, age, gender, activityLevel, goal } = result.data
    const recommendation = calculateMacros(weight, height, age, gender, activityLevel, goal)

    return NextResponse.json({ data: recommendation })
  } catch (error) {
    console.error("[POST /api/nutrition/calculate-macros]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
