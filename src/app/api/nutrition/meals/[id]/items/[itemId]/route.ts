import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { removeMealItem } from "@/services/nutrition.service"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { itemId } = await params
    await removeMealItem(itemId, session.user.id)

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    if (error instanceof Error && error.message === "Meal item not found") {
      return NextResponse.json({ error: "Meal item not found" }, { status: 404 })
    }
    console.error("[DELETE /api/nutrition/meals/[id]/items/[itemId]]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
