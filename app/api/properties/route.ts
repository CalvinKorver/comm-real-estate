import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/properties - Get all properties or a single property by ID
export async function GET(request: Request) {
  try {
    console.log('API: Fetching properties from database')
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Get single property
      const property = await prisma.property.findUnique({
        where: { id }
      })

      if (!property) {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(property)
    }

    // Get all properties
    const properties = await prisma.property.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    console.log('API: Successfully fetched properties:', properties.length)
    return NextResponse.json(properties)
  } catch (error) {
    console.error('API: Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/properties - Create a new property
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      street_address,
      city,
      zip_code,
      net_operating_income,
      price,
      return_on_investment,
      owners,
      number_of_units,
      square_feet
    } = body

    // Validate required fields
    if (!street_address || !city || !zip_code || !price || !owners) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the property
    const property = await prisma.property.create({
      data: {
        street_address,
        city,
        zip_code,
        net_operating_income,
        price,
        return_on_investment,
        number_of_units,
        square_feet
      }
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('API: Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 