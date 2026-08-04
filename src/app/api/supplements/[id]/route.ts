import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  getSupplementById,
  updateSupplement,
  deleteSupplement,
} from "@/services/supplement.service"
import { updateSupplementSchema } from "@/lib/validations/supplement"

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
    const supplement = await getSupplementById(id, session.user.id)
    if (!supplement) {
      return NextResponse.json({ error: "Supplement not found" }, { status: 404 })
    }

    return NextResponse.json({ data: supplement })
  } catch (error) {
    console.error("[GET /api/supplements/[id]]", error)
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
    const result = updateSupplementSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }

    const supplement = await updateSupplement(id, session.user.id, result.data)

    return NextResponse.json({ data: supplement })
  } catch (error) {
    if (error instanceof Error && error.message === "Supplement not found") {
      return NextResponse.json({ error: "Supplement not found" }, { status: 404 })
    }
    console.error("[PUT /api/supplements/[id]]", error)
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
    await deleteSupplement(id, session.user.id)

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    if (error instanceof Error && error.message === "Supplement not found") {
      return NextResponse.json({ error: "Supplement not found" }, { status: 404 })
    }
    console.error("[DELETE /api/supplements/[id]]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
