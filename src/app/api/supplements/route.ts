import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSupplements, createSupplement } from "@/services/supplement.service"
import { createSupplementSchema } from "@/lib/validations/supplement"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("activeOnly") === "true"

    const supplements = await getSupplements(session.user.id, activeOnly)

    return NextResponse.json({ data: supplements })
  } catch (error) {
    console.error("[GET /api/supplements]", error)
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
    const result = createSupplementSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }

    const supplement = await createSupplement(session.user.id, result.data)

    return NextResponse.json({ data: supplement }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/supplements]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
