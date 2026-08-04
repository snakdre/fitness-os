import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { addFoodToMeal } from "@/services/nutrition.service"
import { addMealItemSchema } from "@/lib/validations/nutrition"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const result = addMealItemSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }

    const mealItem = await addFoodToMeal(id, session.user.id, result.data)

    return NextResponse.json({ data: mealItem }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Meal not found" || error.message === "Food item not found") {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }
    console.error("[POST /api/nutrition/meals/[id]/items]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
