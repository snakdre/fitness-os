import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getNutritionStats } from "@/services/nutrition.service"

export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await getNutritionStats(session.user.id)

    return NextResponse.json({ data: stats })
  } catch (error) {
    console.error("[GET /api/nutrition/stats]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
