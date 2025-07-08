// Abstract base class for call service providers
export abstract class CallService {
  abstract initiateCall(params: CallInitiationParams): Promise<CallResult>
  abstract getCallStatus(callId: string): Promise<CallStatus>
}

// Common interfaces for all call service providers
export interface CallInitiationParams {
  to: string
  from?: string
  propertyId: string
  propertyName: string
  agentName: string
  metadata?: Record<string, any>
}

export interface CallResult {
  success: boolean
  callId: string
  callLegId?: string
  error?: string
  details?: string
}

export interface CallStatus {
  callId: string
  status: 'initiated' | 'ringing' | 'answered' | 'hangup' | 'failed'
  duration?: number
  startTime?: Date
  endTime?: Date
}

// Configuration interface for call services
export interface CallServiceConfig {
  apiKey: string
  phoneNumber: string
  appId?: string
  webhookUrl?: string
}