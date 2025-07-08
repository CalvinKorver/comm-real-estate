import { CallService, CallInitiationParams, CallResult, CallStatus, CallServiceConfig } from './call-service'
import { ITelnyxServiceClient, TelnyxServiceClient } from './telnyx-service-client'

export class TelnyxCallService extends CallService {
  private telnyxClient: ITelnyxServiceClient
  private config: CallServiceConfig

  constructor(config: CallServiceConfig, telnyxClient?: ITelnyxServiceClient) {
    super()
    this.config = config
    this.telnyxClient = telnyxClient || new TelnyxServiceClient(config.apiKey)
  }

  async initiateCall(params: CallInitiationParams): Promise<CallResult> {
    try {
      const { to, propertyId, propertyName, agentName, metadata } = params

      // Validate required parameters
      if (!to || !propertyId) {
        return {
          success: false,
          callId: '',
          error: 'Missing required fields',
          details: 'Both "to" and "propertyId" are required'
        }
      }

      // Prepare client state with call metadata
      const clientState = {
        propertyId,
        propertyName,
        agentName,
        timestamp: new Date().toISOString(),
        ...metadata
      }

      // Create the outbound call using the client
      const call = await this.telnyxClient.createCall({
        to: to,
        from: params.from || this.config.phoneNumber,
        connection_id: this.config.appId || '',
        client_state: Buffer.from(JSON.stringify(clientState)).toString('base64')
      })

      // Log call for tracking
      console.log('Telnyx call initiated:', {
        callControlId: call.data.call_control_id,
        callLegId: call.data.call_leg_id,
        to: to,
        propertyId: propertyId
      })

      return {
        success: true,
        callId: call.data.call_control_id,
        callLegId: call.data.call_leg_id
      }

    } catch (error) {
      console.error('Telnyx call initiation error:', error)
      return {
        success: false,
        callId: '',
        error: 'Failed to initiate call',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getCallStatus(callId: string): Promise<CallStatus> {
    // Note: Telnyx doesn't have a direct "get call" endpoint
    // This would typically be tracked in your own database
    // For now, return a placeholder implementation
    return {
      callId: callId,
      status: 'initiated',
      duration: 0
    }
  }

  // Static factory method for easy instantiation
  static create(telnyxClient?: ITelnyxServiceClient): TelnyxCallService {
    const config: CallServiceConfig = {
      apiKey: process.env.TELNYX_API_KEY || '',
      phoneNumber: process.env.TELNYX_PHONE_NUMBER || '',
      appId: process.env.TELNYX_APP_ID || ''
    }

    // Validate configuration
    if (!config.apiKey || !config.phoneNumber || !config.appId) {
      throw new Error('Missing required Telnyx configuration. Please check TELNYX_API_KEY, TELNYX_PHONE_NUMBER, and TELNYX_APP_ID environment variables.')
    }

    return new TelnyxCallService(config, telnyxClient)
  }
}