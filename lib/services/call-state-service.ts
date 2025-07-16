export interface CallState {
  status: string;
  timestamp: string;
  hangupCause?: string;
  clientState?: string;
}

export interface CallStateUpdate {
  callControlId: string;
  status: 'initiated' | 'ringing' | 'answered' | 'hangup' | 'bridged';
  timestamp: string;
  hangupCause?: string;
  clientState?: string;
}

export class CallStateService {
  // In-memory store for call states (in production, use Redis or database)
  private static callStates = new Map<string, CallState>();

  static async storeCallState(callControlId: string, state: CallState): Promise<void> {
    if (!callControlId) {
      throw new Error('Call control ID is required');
    }

    this.callStates.set(callControlId, state);
    
    console.log('Call state stored:', { callControlId, state });
  }

  static async getCallState(callControlId: string): Promise<CallState | null> {
    if (!callControlId) {
      throw new Error('Call control ID is required');
    }

    const state = this.callStates.get(callControlId);
    return state || null;
  }

  static async updateCallState(
    callControlId: string, 
    status: string, 
    metadata: Partial<CallState>
  ): Promise<void> {
    if (!callControlId || !status) {
      throw new Error('Call control ID and status are required');
    }

    const existingState = this.callStates.get(callControlId);
    const updatedState: CallState = {
      ...existingState,
      status,
      timestamp: metadata.timestamp || new Date().toISOString(),
      hangupCause: metadata.hangupCause,
      clientState: metadata.clientState
    };

    await this.storeCallState(callControlId, updatedState);
  }

  static async broadcastCallStateUpdate(update: CallStateUpdate): Promise<void> {
    try {
      // In a production environment, this would send to connected clients via WebSocket/SSE
      // For now, we'll just log the update and store it directly
      console.log('Broadcasting call state update:', update);
      
      // Store the call state update directly in the service
      await this.storeCallState(update.callControlId, {
        status: update.status,
        timestamp: update.timestamp,
        hangupCause: update.hangupCause,
        clientState: update.clientState
      });
      
    } catch (error) {
      console.error('Failed to broadcast call state update:', error);
      throw error;
    }
  }

  static async removeCallState(callControlId: string): Promise<void> {
    if (!callControlId) {
      throw new Error('Call control ID is required');
    }

    this.callStates.delete(callControlId);
    console.log('Call state removed:', { callControlId });
  }

  static async getAllCallStates(): Promise<Map<string, CallState>> {
    return new Map(this.callStates);
  }

  static async clearAllCallStates(): Promise<void> {
    this.callStates.clear();
    console.log('All call states cleared');
  }
}