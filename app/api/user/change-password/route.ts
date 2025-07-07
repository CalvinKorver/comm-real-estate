// app/api/user/change-password/route.ts
import { NextResponse } from "next/server"
import { compare, hash } from "bcrypt"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/shared/auth"
import { prisma } from "@/lib/shared/prisma"

// Add a type for the extended user
interface ExtendedUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export async function POST(request: Request) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions)

    // Use type assertion to treat the user as an ExtendedUser
    const user = session?.user as ExtendedUser | undefined

    if (!user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to change your password" },
        { status: 401 }
      )
    }

    const userId = user.id
    const { currentPassword, newPassword } = await request.json()

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Get the user with their current password
    const userWithPassword = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    })

    if (!userWithPassword || !userWithPassword.password) {
      return NextResponse.json(
        { error: "User not found or no password set" },
        { status: 404 }
      )
    }

    // Verify the current password
    const isPasswordValid = await compare(
      currentPassword,
      userWithPassword.password
    )
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10)

    // Update the password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    )
  }
}
