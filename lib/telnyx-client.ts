import { TelnyxRTC } from '@telnyx/webrtc';

export interface TelnyxCallOptions {
  destination: string;
  callerName?: string;
  callerId?: string;
}

export interface TelnyxCallResult {
  callControlId?: string;
  callId?: string;
}

export interface TelnyxCallState {
  callId?: string;
  status: 'idle' | 'connecting' | 'ringing' | 'connected' | 'disconnected' | 'failed' | 'ended';
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

    // Main notification listener for call updates
    this.client.on('telnyx.notification', (notification: any) => {
      console.log('Telnyx notification received:', notification);
      
      if (notification.type === 'callUpdate' && notification.call) {
        this.handleCallUpdate(notification.call);
      }
    });
  }

  private handleCallUpdate(call: any) {
    console.log('Handling call update:', call);
    
    // Update current call reference
    if (call) {
      this.currentCall = call;
    }
    
    // Map Telnyx call states to our internal states
    switch (call.state) {
      case 'connecting':
        this.updateCallState({ status: 'connecting' });
        break;
      case 'ringing':
        this.updateCallState({ status: 'ringing' });
        break;
      case 'active':
        this.updateCallState({ status: 'connected' });
        break;
      case 'held':
        this.updateCallState({ status: 'connected' }); // Still connected but on hold
        break;
      case 'done':
      case 'hangup':
      case 'destroy':
        console.log('Call ended - updating state to ended');
        this.updateCallState({ status: 'ended' });
        this.currentCall = null;
        break;
      default:
        console.log('Unknown call state:', call.state);
        break;
    }
  }

  async connect(loginToken: string): Promise<void> {
    try {
      await this.initializeClient(loginToken);
      
      if (!this.client) {
        throw new Error('Failed to initialize Telnyx client');
      }

      console.log('Telnyx client initialized, attempting connection...');
      
      // Connect the client
      await this.client.connect();
      
      console.log('Connected to Telnyx WebRTC');
      console.log('Client methods:', Object.getOwnPropertyNames(this.client));
      console.log('NewCall method type:', typeof this.client.newCall);
      
    } catch (error) {
      console.error('Failed to connect to Telnyx WebRTC:', error);
      throw error;
    }
  }

  async makeCall(options: TelnyxCallOptions): Promise<TelnyxCallResult> {
    try {
      if (!this.client) {
        throw new Error('Client not initialized. Call connect() first.');
      }

      this.updateCallState({ status: 'connecting' });

      // Create the call - note that newCall typically returns the call object directly
      const call = this.client.newCall({
        destinationNumber: options.destination,
        callerName: options.callerName || 'Real Estate Agent',
        callerNumber: options.callerId,
        remoteElement: 'remoteMedia'
      });

      console.log('Call object created:', call);
      console.log('Call object methods:', call ? Object.getOwnPropertyNames(call) : 'null');

      if (!call) {
        throw new Error('Failed to create call object');
      }

      this.currentCall = call;
      
      // Extract call control ID and call ID
      const callControlId = (call as any).call_control_id || (call as any).callControlId;
      const callId = (call as any).id || (call as any).callId;
      
      console.log('Call IDs:', { callControlId, callId });
      
      // Check if call has the on method before setting up listeners
      if (typeof (call as any).on === 'function') {
        this.setupCallEventListeners(call);
      } else {
        console.warn('Call object does not have event listener methods');
        // Set up a basic state update
        this.updateCallState({ 
          callId: callId || 'unknown', 
          status: 'ringing' 
        });
      }

      return {
        callControlId,
        callId
      };

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
    try {
      // Check if each event listener method exists before using it
      if (typeof call.on === 'function') {
        call.on('connect', () => {
          console.log('Call connected');
          this.updateCallState({ status: 'connected' });
        });

        call.on('hangup', () => {
          console.log('Call ended');
          this.updateCallState({ status: 'ended' });
          this.currentCall = null;
        });

        call.on('error', (error: any) => {
          console.error('Call error:', error);
          this.updateCallState({ 
            status: 'failed', 
            error: error.message 
          });
        });

        // Additional Telnyx WebRTC events
        call.on('ringing', () => {
          console.log('Call ringing');
          this.updateCallState({ status: 'ringing' });
        });

        call.on('progress', () => {
          console.log('Call progress');
          this.updateCallState({ status: 'ringing' });
        });

        console.log('Call event listeners set up successfully');
      } else {
        console.warn('Call object does not support event listeners');
      }
    } catch (error) {
      console.error('Failed to set up call event listeners:', error);
    }
  }

  hangup(): void {
    if (this.currentCall) {
      this.currentCall.hangup();
      this.currentCall = null;
      this.updateCallState({ status: 'ended' });
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
    this.updateCallState({ status: 'idle' });
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }

  getCurrentCall(): any {
    return this.currentCall;
  }

  getCurrentCallControlId(): string | null {
    if (!this.currentCall) return null;
    return (this.currentCall as any).call_control_id || (this.currentCall as any).callControlId || null;
  }
}

export const telnyxClient = new TelnyxClient();