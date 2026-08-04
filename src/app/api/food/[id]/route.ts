import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem,
} from "@/services/nutrition.service"
import { updateFoodItemSchema } from "@/lib/validations/nutrition"

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
    const item = await getFoodItemById(id)
    if (!item) {
      return NextResponse.json({ error: "Food item not found" }, { status: 404 })
    }

    // Only return if public or owned by user
    if (!item.isPublic && item.createdById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ data: item })
  } catch (error) {
    console.error("[GET /api/food/[id]]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
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
    const result = updateFoodItemSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }

    const item = await updateFoodItem(id, session.user.id, result.data)

    return NextResponse.json({ data: item })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Food item not found or not owned by user"
    ) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error("[PUT /api/food/[id]]", error)
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
    await deleteFoodItem(id, session.user.id)

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Food item not found or not owned by user"
    ) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error("[DELETE /api/food/[id]]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
