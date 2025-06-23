import { prisma } from '@/lib/shared/prisma'

export interface PropertySearchParams {
  id?: string
  page?: number
  limit?: number
  search?: string
}

export interface PropertyCreateInput {
  street_address: string
  city: string
  zip_code: number
  net_operating_income: number
  price: number
  return_on_investment: number
  number_of_units: number
  square_feet: number
  ownerIds?: string[] // Array of owner IDs to connect
}

export interface PaginationResult {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PropertiesResponse {
  properties: any[]
  pagination: PaginationResult
}

export class PropertyService {
  /**
   * Get a single property by ID
   */
  static async getPropertyById(id: string) {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owners: {
          include: {
            contacts: true
          }
        },
        coordinates: true
      }
    })

    if (!property) {
      throw new Error('Property not found')
    }

    return property
  }

  /**
   * Get properties with pagination and search
   */
  static async getProperties(params: PropertySearchParams): Promise<PropertiesResponse> {
    const { page = 1, limit = 10, search = '' } = params

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build where clause for search
    let whereClause: any = {}
    
    if (search) {
      whereClause = {
        OR: [
          { street_address: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { owners: { some: { firstName: { contains: search, mode: 'insensitive' } } } },
          { owners: { some: { lastName: { contains: search, mode: 'insensitive' } } } },
        ]
      }
      
      // Handle zip code search separately to avoid type issues
      const zipCode = parseInt(search)
      if (!isNaN(zipCode)) {
        whereClause.OR.push({ zip_code: zipCode })
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.property.count({
      where: whereClause
    })

    // Get paginated properties
    const properties = await prisma.property.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        owners: {
          include: {
            contacts: true
          }
        },
        coordinates: true
      },
      skip,
      take: limit
    })

    const totalPages = Math.ceil(totalCount / limit)

    return {
      properties,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    }
  }

  /**
   * Create a new property
   */
  static async createProperty(data: PropertyCreateInput) {
    // Validate required fields
    if (!data.street_address || !data.city || !data.zip_code || !data.price) {
      throw new Error('Missing required fields')
    }

    // Prepare the data for Prisma
    const propertyData: any = {
      street_address: data.street_address,
      city: data.city,
      zip_code: data.zip_code,
      net_operating_income: data.net_operating_income,
      price: data.price,
      return_on_investment: data.return_on_investment,
      number_of_units: data.number_of_units,
      square_feet: data.square_feet
    }

    // Connect owners if provided
    if (data.ownerIds && data.ownerIds.length > 0) {
      propertyData.owners = {
        connect: data.ownerIds.map(id => ({ id }))
      }
    }

    // Create the property
    const property = await prisma.property.create({
      data: propertyData,
      include: {
        owners: {
          include: {
            contacts: true
          }
        },
        coordinates: true
      }
    })

    return property
  }
} 