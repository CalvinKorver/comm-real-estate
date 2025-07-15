import { telnyxClient, TelnyxCallState, TelnyxCallOptions } from './telnyx-client';

export interface CallSession {
  id: string;
  callControlId?: string;
  phoneNumber: string;
  contactName?: string;
  contactLabel?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: TelnyxCallState['status'];
  error?: string;
}

export class CallManager {
  private currentSession: CallSession | null = null;
  private sessionCallbacks: Set<(session: CallSession | null) => void> = new Set();
  private stateCallbacks: Set<(state: TelnyxCallState) => void> = new Set();

  constructor() {
    telnyxClient.onCallStateChange((state) => {
      this.handleCallStateChange(state);
    });
  }

  async initializeClient(): Promise<void> {
    try {
      const response = await fetch('/api/telnyx/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get access token');
      }

      const { token } = await response.json();
      await telnyxClient.connect(token);
    } catch (error) {
      console.error('Failed to initialize Telnyx client:', error);
      throw error;
    }
  }

  async startCall(
    phoneNumber: string, 
    contactName?: string, 
    contactLabel?: string
  ): Promise<CallSession> {
    if (this.currentSession) {
      throw new Error('Another call is already in progress');
    }

    const session: CallSession = {
      id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      phoneNumber,
      contactName,
      contactLabel,
      startTime: new Date(),
      status: 'connecting',
    };

    this.currentSession = session;
    this.notifySessionChange();

    try {
      const callOptions: TelnyxCallOptions = {
        destination: phoneNumber,
        callerName: 'Real Estate Agent',
        callerId: process.env.NEXT_PUBLIC_TELNYX_PHONE_NUMBER,
      };

      const callResult = await telnyxClient.makeCall(callOptions);
      
      // Update the session with the call control ID
      if (callResult.callControlId) {
        this.currentSession.callControlId = callResult.callControlId;
        this.notifySessionChange();
      }
      
      return session;
    } catch (error) {
      this.currentSession = null;
      this.notifySessionChange();
      throw error;
    }
  }

  endCall(): void {
    if (this.currentSession) {
      // Store a reference to the current session before calling hangup
      // because hangup() might trigger event listeners that set currentSession to null
      const session = this.currentSession;
      
      telnyxClient.hangup();
      
      // Update the stored session reference
      session.endTime = new Date();
      session.status = 'ended';
      
      if (session.endTime) {
        session.duration = Math.floor(
          (session.endTime.getTime() - session.startTime.getTime()) / 1000
        );
      }

      // Clear the current session
      this.currentSession = null;
      
      // Notify with the final session state
      this.notifySessionChange();
    }
  }

  private handleCallStateChange(state: TelnyxCallState): void {
    if (this.currentSession) {
      // Store a reference to avoid race conditions
      const session = this.currentSession;
      
      session.status = state.status;
      
      if (state.error) {
        session.error = state.error;
      }

      if (state.status === 'disconnected' || state.status === 'failed' || state.status === 'ended') {
        session.endTime = new Date();
        if (session.endTime) {
          session.duration = Math.floor(
            (session.endTime.getTime() - session.startTime.getTime()) / 1000
          );
        }
        
        // Clear the current session
        this.currentSession = null;
      }

      this.notifySessionChange();
    }

    this.notifyStateChange(state);
  }

  onSessionChange(callback: (session: CallSession | null) => void): () => void {
    this.sessionCallbacks.add(callback);
    return () => {
      this.sessionCallbacks.delete(callback);
    };
  }

  onStateChange(callback: (state: TelnyxCallState) => void): () => void {
    this.stateCallbacks.add(callback);
    return () => {
      this.stateCallbacks.delete(callback);
    };
  }

  private notifySessionChange(): void {
    this.sessionCallbacks.forEach(callback => {
      callback(this.currentSession);
    });
  }

  private notifyStateChange(state: TelnyxCallState): void {
    this.stateCallbacks.forEach(callback => {
      callback(state);
    });
  }

  getCurrentSession(): CallSession | null {
    return this.currentSession;
  }

  isCallInProgress(): boolean {
    return this.currentSession !== null;
  }

  resetCallState(): void {
    // Reset the call state to idle when starting a new call session
    this.notifyStateChange({ status: 'idle' });
  }

  isConnected(): boolean {
    return telnyxClient.isConnected();
  }

  getCurrentCallControlId(): string | null {
    return this.currentSession?.callControlId || telnyxClient.getCurrentCallControlId();
  }

  formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('+')) {
      return phoneNumber;
    }
    
    return `+1${cleaned}`;
  }
}

export const callManager = new CallManager();