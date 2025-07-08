import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TelnyxCallService } from '@/lib/services/telnyx-call-service'
import { ITelnyxServiceClient, TelnyxCallResponse } from '@/lib/services/telnyx-service-client'
import { CallInitiationParams, CallServiceConfig } from '@/lib/services/call-service'

/**
 * Unit tests for TelnyxCallService
 * 
 * Testing Strategy:
 * - Uses interface-level mocking of ITelnyxServiceClient
 * - Tests business logic, validation, and error handling in isolation
 * - Mocks are injected via constructor for predictable behavior
 */

const mockTelnyxClient: ITelnyxServiceClient = {
  createCall: vi.fn()
}

describe('TelnyxCallService', () => {
  let service: TelnyxCallService
  let config: CallServiceConfig

  beforeEach(() => {
    vi.clearAllMocks()
    config = {
      apiKey: 'test-api-key',
      phoneNumber: '+1234567890',
      appId: 'test-app-id'
    }
    service = new TelnyxCallService(config, mockTelnyxClient)
  })

  describe('constructor', () => {
    it('should create instance with provided config and client', () => {
      const instance = new TelnyxCallService(config, mockTelnyxClient)
      expect(instance).toBeInstanceOf(TelnyxCallService)
    })

    it('should create instance with default client when not provided', () => {
      const instance = new TelnyxCallService(config)
      expect(instance).toBeInstanceOf(TelnyxCallService)
    })
  })

  describe('initiateCall', () => {
    const validParams: CallInitiationParams = {
      to: '+1987654321',
      propertyId: 'prop-123',
      propertyName: 'Test Property',
      agentName: 'Test Agent'
    }

    it('should successfully initiate a call with valid parameters', async () => {
      const mockResponse: TelnyxCallResponse = {
        data: {
          call_control_id: 'call-control-123',
          call_leg_id: 'call-leg-123'
        }
      }

      vi.mocked(mockTelnyxClient.createCall).mockResolvedValue(mockResponse)

      const result = await service.initiateCall(validParams)

      expect(result).toEqual({
        success: true,
        callId: 'call-control-123',
        callLegId: 'call-leg-123'
      })

      expect(mockTelnyxClient.createCall).toHaveBeenCalledWith({
        to: '+1987654321',
        from: '+1234567890',
        connection_id: 'test-app-id',
        client_state: expect.any(String)
      })
    })

    it('should use custom from number when provided', async () => {
      const mockResponse: TelnyxCallResponse = {
        data: {
          call_control_id: 'call-control-123',
          call_leg_id: 'call-leg-123'
        }
      }

      vi.mocked(mockTelnyxClient.createCall).mockResolvedValue(mockResponse)

      const paramsWithFrom = { ...validParams, from: '+1555555555' }
      await service.initiateCall(paramsWithFrom)

      expect(mockTelnyxClient.createCall).toHaveBeenCalledWith({
        to: '+1987654321',
        from: '+1555555555',
        connection_id: 'test-app-id',
        client_state: expect.any(String)
      })
    })

    it('should include metadata in client_state when provided', async () => {
      const mockResponse: TelnyxCallResponse = {
        data: {
          call_control_id: 'call-control-123',
          call_leg_id: 'call-leg-123'
        }
      }

      vi.mocked(mockTelnyxClient.createCall).mockResolvedValue(mockResponse)

      const paramsWithMetadata = {
        ...validParams,
        metadata: { customField: 'customValue' }
      }

      await service.initiateCall(paramsWithMetadata)

      const callArgs = vi.mocked(mockTelnyxClient.createCall).mock.calls[0][0]
      const clientState = JSON.parse(Buffer.from(callArgs.client_state!, 'base64').toString())

      expect(clientState).toMatchObject({
        propertyId: 'prop-123',
        propertyName: 'Test Property',
        agentName: 'Test Agent',
        customField: 'customValue',
        timestamp: expect.any(String)
      })
    })

    it('should return error when "to" parameter is missing', async () => {
      const invalidParams = { ...validParams, to: '' }

      const result = await service.initiateCall(invalidParams)

      expect(result).toEqual({
        success: false,
        callId: '',
        error: 'Missing required fields',
        details: 'Both "to" and "propertyId" are required'
      })

      expect(mockTelnyxClient.createCall).not.toHaveBeenCalled()
    })

    it('should return error when "propertyId" parameter is missing', async () => {
      const invalidParams = { ...validParams, propertyId: '' }

      const result = await service.initiateCall(invalidParams)

      expect(result).toEqual({
        success: false,
        callId: '',
        error: 'Missing required fields',
        details: 'Both "to" and "propertyId" are required'
      })

      expect(mockTelnyxClient.createCall).not.toHaveBeenCalled()
    })

    it('should handle Telnyx client errors gracefully', async () => {
      const error = new Error('API Error')
      vi.mocked(mockTelnyxClient.createCall).mockRejectedValue(error)

      const result = await service.initiateCall(validParams)

      expect(result).toEqual({
        success: false,
        callId: '',
        error: 'Failed to initiate call',
        details: 'API Error'
      })
    })

    it('should handle non-Error exceptions', async () => {
      vi.mocked(mockTelnyxClient.createCall).mockRejectedValue('String error')

      const result = await service.initiateCall(validParams)

      expect(result).toEqual({
        success: false,
        callId: '',
        error: 'Failed to initiate call',
        details: 'Unknown error'
      })
    })
  })

  describe('getCallStatus', () => {
    it('should return placeholder status for any call ID', async () => {
      const callId = 'test-call-id'
      const status = await service.getCallStatus(callId)

      expect(status).toEqual({
        callId: 'test-call-id',
        status: 'initiated',
        duration: 0
      })
    })
  })

  describe('create static method', () => {
    beforeEach(() => {
      vi.stubEnv('TELNYX_API_KEY', 'env-api-key')
      vi.stubEnv('TELNYX_PHONE_NUMBER', '+1111111111')
      vi.stubEnv('TELNYX_APP_ID', 'env-app-id')
    })

    it('should create instance with environment variables', () => {
      const instance = TelnyxCallService.create()
      expect(instance).toBeInstanceOf(TelnyxCallService)
    })

    it('should create instance with provided client', () => {
      const instance = TelnyxCallService.create(mockTelnyxClient)
      expect(instance).toBeInstanceOf(TelnyxCallService)
    })

    it('should throw error when TELNYX_API_KEY is missing', () => {
      vi.stubEnv('TELNYX_API_KEY', '')

      expect(() => TelnyxCallService.create()).toThrow(
        'Missing required Telnyx configuration. Please check TELNYX_API_KEY, TELNYX_PHONE_NUMBER, and TELNYX_APP_ID environment variables.'
      )
    })

    it('should throw error when TELNYX_PHONE_NUMBER is missing', () => {
      vi.stubEnv('TELNYX_PHONE_NUMBER', '')

      expect(() => TelnyxCallService.create()).toThrow(
        'Missing required Telnyx configuration. Please check TELNYX_API_KEY, TELNYX_PHONE_NUMBER, and TELNYX_APP_ID environment variables.'
      )
    })

    it('should throw error when TELNYX_APP_ID is missing', () => {
      vi.stubEnv('TELNYX_APP_ID', '')

      expect(() => TelnyxCallService.create()).toThrow(
        'Missing required Telnyx configuration. Please check TELNYX_API_KEY, TELNYX_PHONE_NUMBER, and TELNYX_APP_ID environment variables.'
      )
    })
  })
})