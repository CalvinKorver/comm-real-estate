// app/api/user/profile/route.ts
import { NextResponse } from "next/server"
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

export async function PUT(request: Request) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions)

    // Use type assertion to treat the user as an ExtendedUser
    const user = session?.user as ExtendedUser | undefined

    if (!user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to update your profile" },
        { status: 401 }
      )
    }

    const userId = user.id
    const { firstName, lastName, email } = await request.json()

    // Basic input validation
    if (!firstName && !lastName && !email) {
      return NextResponse.json(
        { error: "No fields to update provided" },
        { status: 400 }
      )
    }

    // Check if email is changing and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email },
      })

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: "Email is already taken" },
          { status: 400 }
        )
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        first_name: firstName,
        last_name: lastName,
        email: email || undefined, // Only update if provided
      },
    })

    // Remove sensitive data before returning
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
