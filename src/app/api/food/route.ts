import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { searchFoodItems, createFoodItem } from "@/services/nutrition.service"
import { createFoodItemSchema } from "@/lib/validations/nutrition"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") ?? ""

    const items = await searchFoodItems(query, session.user.id)

    return NextResponse.json({ data: items })
  } catch (error) {
    console.error("[GET /api/food]", error)
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
    const result = createFoodItemSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }

    const item = await createFoodItem(session.user.id, result.data)

    return NextResponse.json({ data: item }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/food]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
