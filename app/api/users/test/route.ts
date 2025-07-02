import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../../generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, firstName, lastName } = body

    // Try to find existing test user
    let user = await prisma.user.findUnique({
      where: { email }
    })

    // If user doesn't exist, create it
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          first_name: firstName,
          last_name: lastName
        }
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('API: Error creating/finding test user:', error)
    return NextResponse.json(
      { error: 'Failed to create/find test user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 