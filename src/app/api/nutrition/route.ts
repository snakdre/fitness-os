import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDailyNutrition } from "@/services/nutrition.service"
import { parseISO } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")
    const date = dateParam ? parseISO(dateParam) : new Date()

    const data = await getDailyNutrition(session.user.id, date)

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[GET /api/nutrition]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
