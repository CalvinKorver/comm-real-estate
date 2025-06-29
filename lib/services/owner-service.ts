import { prisma } from '@/lib/shared/prisma'

export interface OwnerSearchParams {
  id?: string
  page?: number
  limit?: number
  search?: string
}

export interface OwnerCreateInput {
  firstName: string
  lastName: string
  fullName?: string
  llcContact?: string
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  phoneNumber?: string
}

export interface OwnerUpdateInput {
  firstName?: string
  lastName?: string
  fullName?: string
  llcContact?: string
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  phoneNumber?: string
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
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
          { llcContact: { contains: search, mode: 'insensitive' } },
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
        firstName: 'asc'
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
        firstName: 'asc'
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
    if (!data.firstName || !data.lastName) {
      throw new Error('First name and last name are required')
    }

    const owner = await prisma.owner.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: data.fullName,
        llcContact: data.llcContact,
        streetAddress: data.streetAddress,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phoneNumber: data.phoneNumber
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
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: data.fullName,
        llcContact: data.llcContact,
        streetAddress: data.streetAddress,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phoneNumber: data.phoneNumber
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
              orderBy: { createdAt: 'desc' },
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