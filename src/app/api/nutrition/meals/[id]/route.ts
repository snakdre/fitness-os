import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getMealById, deleteMeal } from "@/services/nutrition.service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const meal = await getMealById(id, session.user.id)
    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 })
    }

    return NextResponse.json({ data: meal })
  } catch (error) {
    console.error("[GET /api/nutrition/meals/[id]]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await deleteMeal(id, session.user.id)

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    if (error instanceof Error && error.message === "Meal not found") {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 })
    }
    console.error("[DELETE /api/nutrition/meals/[id]]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
