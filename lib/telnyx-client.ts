import { TelnyxRTC } from '@telnyx/webrtc';

export interface TelnyxCallOptions {
  destination: string;
  callerName?: string;
  callerId?: string;
}

export interface TelnyxCallState {
  callId?: string;
  status: 'idle' | 'connecting' | 'ringing' | 'connected' | 'disconnected' | 'failed';
  duration?: number;
  error?: string;
}

export class TelnyxClient {
  private client: TelnyxRTC | null = null;
  private currentCall: any = null;
  private callStateCallback?: (state: TelnyxCallState) => void;
  private isInitialized = false;

  constructor() {
    // Don't initialize immediately - wait for client-side
  }

  private async initializeClient(loginToken?: string): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      this.client = new TelnyxRTC({
        login_token: loginToken,
        debug: process.env.NODE_ENV === 'development',
      });

      this.setupEventListeners();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Telnyx client:', error);
      throw error;
    }
  }

  private setupEventListeners() {
    if (!this.client) return;

    this.client.on('telnyx.ready', () => {
      console.log('Telnyx WebRTC client ready');
    });

    this.client.on('telnyx.error', (error: any) => {
      console.error('Telnyx WebRTC error:', error);
      this.updateCallState({ status: 'failed', error: error.message });
    });

    this.client.on('telnyx.socket.open', () => {
      console.log('WebRTC socket connected');
    });

    this.client.on('telnyx.socket.close', () => {
      console.log('WebRTC socket disconnected');
    });
  }

  async connect(loginToken: string): Promise<void> {
    try {
      await this.initializeClient(loginToken);
      
      if (!this.client) {
        throw new Error('Failed to initialize Telnyx client');
      }

      // Connect the client
      await this.client.connect();
      
      console.log('Connected to Telnyx WebRTC');
    } catch (error) {
      console.error('Failed to connect to Telnyx WebRTC:', error);
      throw error;
    }
  }

  async makeCall(options: TelnyxCallOptions): Promise<void> {
    try {
      if (!this.client) {
        throw new Error('Client not initialized. Call connect() first.');
      }

      this.updateCallState({ status: 'connecting' });

      const call = await this.client.newCall({
        destinationNumber: options.destination,
        callerName: options.callerName || 'Real Estate Agent',
        callerNumber: options.callerId,
        remoteElement: 'remoteMedia'
      });

      this.currentCall = call;
      this.setupCallEventListeners(call);

      this.updateCallState({ 
        callId: call.id, 
        status: 'ringing' 
      });

    } catch (error) {
      console.error('Failed to make call:', error);
      this.updateCallState({ 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  private setupCallEventListeners(call: any) {
    call.on('connect', () => {
      console.log('Call connected');
      this.updateCallState({ status: 'connected' });
    });

    call.on('hangup', () => {
      console.log('Call ended');
      this.updateCallState({ status: 'disconnected' });
      this.currentCall = null;
    });

    call.on('error', (error: any) => {
      console.error('Call error:', error);
      this.updateCallState({ 
        status: 'failed', 
        error: error.message 
      });
    });
  }

  hangup(): void {
    if (this.currentCall) {
      this.currentCall.hangup();
      this.currentCall = null;
      this.updateCallState({ status: 'disconnected' });
    }
  }

  onCallStateChange(callback: (state: TelnyxCallState) => void): void {
    this.callStateCallback = callback;
  }

  private updateCallState(state: Partial<TelnyxCallState>): void {
    if (this.callStateCallback) {
      this.callStateCallback({
        status: 'idle',
        ...state,
      });
    }
  }

  disconnect(): void {
    if (this.currentCall) {
      this.hangup();
    }
    if (this.client) {
      this.client.disconnect();
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }

  getCurrentCall(): any {
    return this.currentCall;
  }
}

export const telnyxClient = new TelnyxClient();