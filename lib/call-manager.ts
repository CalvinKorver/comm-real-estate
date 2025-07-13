import { telnyxClient, TelnyxCallState, TelnyxCallOptions } from './telnyx-client';

export interface CallSession {
  id: string;
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

      await telnyxClient.makeCall(callOptions);
      return session;
    } catch (error) {
      this.currentSession = null;
      this.notifySessionChange();
      throw error;
    }
  }

  endCall(): void {
    if (this.currentSession) {
      telnyxClient.hangup();
      this.currentSession.endTime = new Date();
      this.currentSession.status = 'disconnected';
      
      if (this.currentSession.endTime) {
        this.currentSession.duration = Math.floor(
          (this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime()) / 1000
        );
      }

      this.notifySessionChange();
      this.currentSession = null;
    }
  }

  private handleCallStateChange(state: TelnyxCallState): void {
    if (this.currentSession) {
      this.currentSession.status = state.status;
      
      if (state.error) {
        this.currentSession.error = state.error;
      }

      if (state.status === 'disconnected' || state.status === 'failed') {
        this.currentSession.endTime = new Date();
        if (this.currentSession.endTime) {
          this.currentSession.duration = Math.floor(
            (this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime()) / 1000
          );
        }
      }

      this.notifySessionChange();

      if (state.status === 'disconnected' || state.status === 'failed') {
        this.currentSession = null;
      }
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