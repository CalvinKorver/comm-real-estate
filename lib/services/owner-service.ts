import { prisma } from '@/lib/shared/prisma'

export interface OwnerSearchParams {
  id?: string
  page?: number
  limit?: number
  search?: string
}

export interface OwnerCreateInput {
  first_name: string
  last_name: string
  full_name?: string
  llc_contact?: string
  street_address?: string
  city?: string
  state?: string
  zip_code?: string
  phone_number?: string
}

export interface OwnerUpdateInput {
  first_name?: string
  last_name?: string
  full_name?: string
  llc_contact?: string
  street_address?: string
  city?: string
  state?: string
  zip_code?: string
  phone_number?: string
}

export interface PaginationResult {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface OwnersResponse {
  owners: any[]
  pagination: PaginationResult
}

export class OwnerService {
  /**
   * Get a single owner by ID
   */
  static async getOwnerById(id: string) {
    const owner = await prisma.owner.findUnique({
      where: { id },
      include: {
        properties: {
          include: {
            coordinates: true
          }
        },
        contacts: true
      }
    })

    if (!owner) {
      throw new Error('Owner not found')
    }

    return owner
  }

  /**
   * Get owners with pagination and search
   */
  static async getOwners(params: OwnerSearchParams): Promise<OwnersResponse> {
    const { page = 1, limit = 10, search = '' } = params

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build where clause for search
    let whereClause: any = {}
    
    if (search) {
      whereClause = {
        OR: [
          { first_name: { contains: search, mode: 'insensitive' } },
          { last_name: { contains: search, mode: 'insensitive' } },
          { full_name: { contains: search, mode: 'insensitive' } },
          { llc_contact: { contains: search, mode: 'insensitive' } },
        ]
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.owner.count({
      where: whereClause
    })

    // Get paginated owners
    const owners = await prisma.owner.findMany({
      where: whereClause,
      orderBy: {
        first_name: 'asc'
      },
      include: {
        properties: {
          include: {
            coordinates: true
          }
        },
        contacts: true
      },
      skip,
      take: limit
    })

    const totalPages = Math.ceil(totalCount / limit)

    return {
      owners,
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
   * Get all owners (for dropdowns, etc.)
   */
  static async getAllOwners() {
    return prisma.owner.findMany({
      orderBy: {
        first_name: 'asc'
      },
      include: {
        contacts: true
      }
    })
  }

  /**
   * Create a new owner
   */
  static async createOwner(data: OwnerCreateInput) {
    // Validate required fields
    if (!data.first_name || !data.last_name) {
      throw new Error('First name and last name are required')
    }

    const owner = await prisma.owner.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        full_name: data.full_name,
        llc_contact: data.llc_contact,
        street_address: data.street_address,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        phone_number: data.phone_number
      },
      include: {
        properties: {
          include: {
            coordinates: true
          }
        },
        contacts: true
      }
    })

    return owner
  }

  /**
   * Update an existing owner
   */
  static async updateOwner(id: string, data: OwnerUpdateInput) {
    // Check if owner exists
    const existingOwner = await prisma.owner.findUnique({
      where: { id }
    })

    if (!existingOwner) {
      throw new Error('Owner not found')
    }

    const owner = await prisma.owner.update({
      where: { id },
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        full_name: data.full_name,
        llc_contact: data.llc_contact,
        street_address: data.street_address,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        phone_number: data.phone_number
      },
      include: {
        properties: {
          include: {
            coordinates: true
          }
        },
        contacts: true
      }
    })

    return owner
  }

  /**
   * Delete an owner
   */
  static async deleteOwner(id: string) {
    // Check if owner exists
    const existingOwner = await prisma.owner.findUnique({
      where: { id }
    })

    if (!existingOwner) {
      throw new Error('Owner not found')
    }

    await prisma.owner.delete({
      where: { id }
    })

    return { success: true }
  }

  /**
   * Get properties owned by a specific owner
   */
  static async getPropertiesByOwner(ownerId: string) {
    const owner = await prisma.owner.findUnique({
      where: { id: ownerId },
      include: {
        properties: {
          include: {
            coordinates: true,
            notes: {
              orderBy: { created_at: 'desc' },
              take: 1
            }
          }
        }
      }
    })

    if (!owner) {
      throw new Error('Owner not found')
    }

    return owner.properties
  }
} 