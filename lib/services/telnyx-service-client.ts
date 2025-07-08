import telnyx from 'telnyx'

// Raw Telnyx API response interfaces
export interface TelnyxCallResponse {
  data: {
    call_control_id: string
    call_leg_id: string
  }
}

// Interface for the Telnyx service client
export interface ITelnyxServiceClient {
  createCall(params: TelnyxCallParams): Promise<TelnyxCallResponse>
}

export interface TelnyxCallParams {
  to: string
  from: string
  connection_id: string
  client_state?: string
}

// Concrete implementation that makes actual Telnyx API calls
export class TelnyxServiceClient implements ITelnyxServiceClient {
  private telnyxClient: any

  constructor(apiKey: string) {
    this.telnyxClient = new telnyx(apiKey)
  }

  async createCall(params: TelnyxCallParams): Promise<TelnyxCallResponse> {
    const call = await this.telnyxClient.calls.create(params)
    return call
  }
}