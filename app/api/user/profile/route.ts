// app/api/user/profile/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to update your profile' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { firstName, lastName, email } = await request.json();

    // Basic input validation
    if (!firstName && !lastName && !email) {
      return NextResponse.json(
        { error: 'No fields to update provided' },
        { status: 400 }
      );
    }

    // Check if email is changing and if it's already taken
    if (email && email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email }
      });

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: 'Email is already taken' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        email: email || undefined, // Only update if provided
      },
    });

    // Remove sensitive data before returning
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}