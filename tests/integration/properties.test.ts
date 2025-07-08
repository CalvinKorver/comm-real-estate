import { describe, it, expect, beforeEach } from 'vitest'
import { getTestPrismaClient, seedTestData } from '../setup/test-database'

describe('Properties API Integration Tests', () => {
  const prisma = getTestPrismaClient()
  let testProperty: any

  beforeEach(async () => {
    // Clean up and seed test data
    await prisma.property.deleteMany()
    await prisma.owner.deleteMany()
    await prisma.contact.deleteMany()
    
    const seedData = await seedTestData(prisma)
    testProperty = seedData.testProperty
  })

  describe('GET /api/properties', () => {
    it('should return all properties with pagination', async () => {
      const response = await fetch('http://localhost:3001/api/properties')
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toHaveProperty('properties')
      expect(data).toHaveProperty('pagination')
      expect(Array.isArray(data.properties)).toBe(true)
      expect(data.properties.length).toBeGreaterThan(0)
      
      // Check pagination structure
      expect(data.pagination).toHaveProperty('currentPage')
      expect(data.pagination).toHaveProperty('totalPages')
      expect(data.pagination).toHaveProperty('totalCount')
      expect(data.pagination).toHaveProperty('hasNextPage')
      expect(data.pagination).toHaveProperty('hasPreviousPage')
      
      // Check first property structure
      const property = data.properties[0]
      expect(property).toHaveProperty('id')
      expect(property).toHaveProperty('street_address')
      expect(property).toHaveProperty('city')
      expect(property).toHaveProperty('zip_code')
    })

    it('should return a single property by ID', async () => {
      const response = await fetch(`http://localhost:3001/api/properties?id=${testProperty.id}`)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.id).toBe(testProperty.id)
      expect(data.street_address).toBe(testProperty.street_address)
      expect(data.city).toBe(testProperty.city)
      expect(data.zip_code).toBe(testProperty.zip_code)
    })

    it('should return 404 for non-existent property', async () => {
      const response = await fetch('http://localhost:3001/api/properties?id=non-existent-id')
      
      expect(response.status).toBe(404)
      
      const data = await response.json()
      expect(data.error).toBe('Property not found')
    })

    it('should support pagination parameters', async () => {
      // Create additional properties for pagination testing
      await prisma.property.create({
        data: {
          street_address: '456 Second St',
          city: 'Test City',
          zip_code: 12346,
          state: 'WA',
          net_operating_income: 60000,
          price: 600000,
          return_on_investment: 12,
          number_of_units: 2,
          square_feet: 1800,
        }
      })

      const response = await fetch('http://localhost:3001/api/properties?page=1&limit=1')
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.properties).toHaveLength(1)
      expect(data.pagination.currentPage).toBe(1)
      expect(data.pagination.totalCount).toBeGreaterThanOrEqual(2)
    })

    it('should support search functionality', async () => {
      const response = await fetch(`http://localhost:3001/api/properties?search=${encodeURIComponent('Test Street')}`)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.properties).toHaveLength(1)
      expect(data.properties[0].street_address).toContain('Test Street')
    })

    it('should handle empty search results', async () => {
      const response = await fetch('http://localhost:3001/api/properties?search=NonExistentAddress')
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.properties).toHaveLength(0)
      expect(data.pagination.totalCount).toBe(0)
    })
  })
})