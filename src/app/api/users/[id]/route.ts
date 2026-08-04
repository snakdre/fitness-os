import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }

  const { id } = await params

  // Only admins and coaches can view other users
  const isOwnProfile = session.user.id === id
  const isAdminOrCoach =
    session.user.role === "ADMIN" || session.user.role === "COACH"

  if (!isOwnProfile && !isAdminOrCoach) {
    return NextResponse.json(
      { error: "You do not have permission to view this profile" },
      { status: 403 }
    )
  }

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: isAdminOrCoach || isOwnProfile,
      image: true,
      role: true,
      createdAt: true,
      profile: {
        select: {
          age: true,
          gender: true,
          height: true,
          weight: true,
          activityLevel: true,
          bio: true,
          avatarUrl: true,
          fitnessLevel: true,
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({ data: user })
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }

  const { id } = await params

  // Only admins can delete users, or users can delete their own account
  const isOwnAccount = session.user.id === id
  const isAdmin = session.user.role === "ADMIN"

  if (!isOwnAccount && !isAdmin) {
    return NextResponse.json(
      { error: "You do not have permission to delete this account" },
      { status: 403 }
    )
  }

  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Prevent deleting admin accounts unless you are that admin
  if (user.role === "ADMIN" && !isOwnAccount) {
    return NextResponse.json(
      { error: "Cannot delete admin accounts" },
      { status: 403 }
    )
  }

  await db.user.delete({ where: { id } })

  return NextResponse.json({ data: { message: "Account deleted successfully" } })
}
