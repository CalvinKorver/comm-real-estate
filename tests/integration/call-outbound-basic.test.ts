import { describe, it, expect } from 'vitest'
import { testFetch } from '../utils/test-config'

/**
 * Integration tests for Call Outbound API
 * 
 * Testing Strategy:
 * - Tests actual HTTP requests to /api/call/outbound endpoint
 * - Uses real TelnyxCallService class with actual Next.js server
 * - Focuses on API contract validation rather than mocking dependencies
 * - Validates request/response structure, status codes, and error handling
 */

describe('Call Outbound API Basic Integration', () => {
  const validRequestBody = {
    to: '+1987654321',
    propertyId: 'prop-123',
    propertyName: 'Test Property',
    agentName: 'Test Agent'
  }

  describe('POST /api/call/outbound - Validation Tests', () => {
    it('should return 400 for missing "to" parameter', async () => {
      const invalidBody = { ...validRequestBody, to: '' }

      const response = await testFetch('/api/call/outbound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidBody)
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data).toEqual({
        error: 'Missing required fields',
        details: 'Both "to" and "propertyId" are required'
      })
    })

    it('should return 400 for missing "propertyId" parameter', async () => {
      const invalidBody = { ...validRequestBody, propertyId: '' }

      const response = await testFetch('/api/call/outbound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidBody)
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data).toEqual({
        error: 'Missing required fields',
        details: 'Both "to" and "propertyId" are required'
      })
    })

    it('should return 500 for invalid JSON request body', async () => {
      const response = await testFetch('/api/call/outbound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid json'
      })

      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.error).toBe('Failed to initiate call')
      expect(data.details).toContain('Unexpected token')
    })

    it('should return 500 for missing request body', async () => {
      const response = await testFetch('/api/call/outbound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.error).toBe('Failed to initiate call')
      expect(data.details).toBeDefined()
    })

    it('should handle missing environment variables gracefully', async () => {
      // This test relies on the actual environment configuration
      // In a real deployment, missing env vars would cause a 500 error
      const response = await testFetch('/api/call/outbound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validRequestBody)
      })

      // Since we can't easily mock env vars for Next.js server,
      // we just verify the endpoint responds appropriately
      expect([400, 500]).toContain(response.status)

      const data = await response.json()
      expect(data.error).toBeDefined()
    })

    it('should have correct response structure for API calls', async () => {
      const response = await testFetch('/api/call/outbound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validRequestBody)
      })

      const data = await response.json()
      
      // Verify response structure regardless of success/failure
      if (response.status === 200) {
        expect(data).toHaveProperty('success')
        expect(data).toHaveProperty('callId')
        expect(data.success).toBe(true)
      } else {
        expect(data).toHaveProperty('error')
        expect(typeof data.error).toBe('string')
        // Details field is optional depending on error type
        if (data.details) {
          expect(typeof data.details).toBe('string')
        }
      }
    })

    it('should validate phone number format in request', async () => {
      const invalidPhoneBody = { ...validRequestBody, to: 'invalid-phone' }

      const response = await testFetch('/api/call/outbound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidPhoneBody)
      })

      // API should handle invalid phone formats gracefully
      // Either return validation error or let Telnyx handle it
      expect([400, 500]).toContain(response.status)
      
      const data = await response.json()
      expect(data.error).toBeDefined()
    })

    it('should handle optional fields correctly', async () => {
      const minimalBody = {
        to: '+1987654321',
        propertyId: 'prop-123',
        propertyName: '',  // Optional field
        agentName: ''      // Optional field
      }

      const response = await testFetch('/api/call/outbound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(minimalBody)
      })

      // Should not fail due to empty optional fields
      const data = await response.json()
      
      if (response.status === 400) {
        // If validation fails, it should be for required fields only
        expect(data.details).not.toContain('propertyName')
        expect(data.details).not.toContain('agentName')
      }
    })
  })
})