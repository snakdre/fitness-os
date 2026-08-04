import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          id: true,
          age: true,
          gender: true,
          height: true,
          weight: true,
          activityLevel: true,
          bio: true,
          avatarUrl: true,
          timezone: true,
          fitnessLevel: true,
        },
      },
      subscription: {
        select: {
          plan: true,
          status: true,
          currentPeriodEnd: true,
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({ data: user })
}

export async function PATCH(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  // Only allow updating name and image
  const allowedFields = ["name", "image"] as const
  const updateData: Partial<{ name: string; image: string }> = {}

  if (typeof body === "object" && body !== null) {
    for (const field of allowedFields) {
      if (field in body && typeof (body as Record<string, unknown>)[field] === "string") {
        updateData[field] = (body as Record<string, string>)[field]
      }
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    )
  }

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ data: updated })
}
