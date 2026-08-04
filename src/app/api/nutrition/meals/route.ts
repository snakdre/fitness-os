import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getMeals, createMeal } from "@/services/nutrition.service"
import { createMealSchema } from "@/lib/validations/nutrition"
import { parseISO, subDays } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")

    const to = toParam ? parseISO(toParam) : new Date()
    const from = fromParam ? parseISO(fromParam) : subDays(to, 7)

    const meals = await getMeals(session.user.id, from, to)

    return NextResponse.json({ data: meals })
  } catch (error) {
    console.error("[GET /api/nutrition/meals]", error)
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
    const result = createMealSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }

    const meal = await createMeal(session.user.id, result.data)

    return NextResponse.json({ data: meal }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/nutrition/meals]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
