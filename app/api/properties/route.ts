import { NextResponse } from 'next/server'
import { PropertyService } from '@/lib/services/property-service'

// Property-specific subresource endpoints (e.g., notes) should be placed under app/api/properties/[id]/

// GET /api/properties - Get all properties or a single property by ID
export async function GET(request: Request) {
  try {
    console.log('API: Fetching properties from database')
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    if (id) {
      // Get single property
      try {
        const property = await PropertyService.getPropertyById(id)
        return NextResponse.json(property)
      } catch (error) {
        if (error instanceof Error && error.message === 'Property not found') {
          return NextResponse.json(
            { error: 'Property not found' },
            { status: 404 }
          )
        }
        throw error
      }
    }

    // Get properties with pagination and search
    const result = await PropertyService.getProperties({
      page,
      limit,
      search
    })

    console.log(`API: Fetched ${result.properties.length} properties (page ${result.pagination.currentPage}/${result.pagination.totalPages})`)
    
    return NextResponse.json(result)
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
    
    // Transform the request body to match the service interface
    const propertyData = {
      street_address: body.street_address,
      city: body.city,
      zip_code: body.zip_code,
      net_operating_income: body.net_operating_income,
      price: body.price,
      return_on_investment: body.return_on_investment,
      number_of_units: body.number_of_units,
      square_feet: body.square_feet,
      ownerIds: body.owners // Assuming owners is an array of owner IDs
    }

    const property = await PropertyService.createProperty(propertyData)
    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('API: Error creating property:', error)
    
    // Handle validation errors
    if (error instanceof Error && error.message === 'Missing required fields') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create property', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT /api/properties - Update a property
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, note, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // If a note is provided, add it to the property
    if (note) {
      await PropertyService.addNoteToProperty(id, note)
    }

    // Transform the request body to match the service interface
    const propertyData = {
      street_address: updateData.street_address,
      city: updateData.city,
      zip_code: updateData.zip_code,
      net_operating_income: updateData.net_operating_income,
      price: updateData.price,
      return_on_investment: updateData.return_on_investment,
      number_of_units: updateData.number_of_units,
      square_feet: updateData.square_feet,
      ownerIds: updateData.owners // Assuming owners is an array of owner IDs
    }

    const property = await PropertyService.updateProperty(id, propertyData)
    return NextResponse.json(property)
  } catch (error) {
    console.error('API: Error updating property:', error)
    
    // Handle validation errors
    if (error instanceof Error && error.message === 'Property not found') {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update property', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 