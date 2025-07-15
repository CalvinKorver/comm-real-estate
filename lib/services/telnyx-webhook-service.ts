import crypto from 'crypto';
import { CallStateService } from './call-state-service';

export interface CallStateUpdate {
  callControlId: string;
  status: 'initiated' | 'ringing' | 'answered' | 'hangup' | 'bridged';
  timestamp: string;
  hangupCause?: string;
  clientState?: string;
}

export interface WebhookEvent {
  event_type: string;
  data?: {
    call_control_id?: string;
    call_status?: string;
    hangup_cause?: string;
    client_state?: string;
    result?: string;
  };
}

export class TelnyxWebhookService {
  static verifyWebhookSignature(
    payload: string, 
    signature: string, 
    publicKey: string
  ): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', publicKey)
        .update(payload)
        .digest('base64');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  static async processWebhookEvent(event: WebhookEvent): Promise<void> {
    const { event_type, data } = event;

    console.log('Processing Telnyx webhook:', {
      event_type,
      call_control_id: data?.call_control_id,
      call_status: data?.call_status,
      timestamp: new Date().toISOString(),
    });

    switch (event_type) {
      case 'call.initiated':
        await this.handleCallStateUpdate({
          callControlId: data?.call_control_id!,
          status: 'initiated',
          timestamp: new Date().toISOString(),
          clientState: data?.client_state
        });
        break;
      
      case 'call.ringing':
        await this.handleCallStateUpdate({
          callControlId: data?.call_control_id!,
          status: 'ringing',
          timestamp: new Date().toISOString(),
          clientState: data?.client_state
        });
        break;
      
      case 'call.answered':
        await this.handleCallStateUpdate({
          callControlId: data?.call_control_id!,
          status: 'answered',
          timestamp: new Date().toISOString(),
          clientState: data?.client_state
        });
        break;
      
      case 'call.hangup':
        await this.handleCallStateUpdate({
          callControlId: data?.call_control_id!,
          status: 'hangup',
          timestamp: new Date().toISOString(),
          hangupCause: data?.hangup_cause,
          clientState: data?.client_state
        });
        break;
      
      case 'call.bridged':
        await this.handleCallStateUpdate({
          callControlId: data?.call_control_id!,
          status: 'bridged',
          timestamp: new Date().toISOString(),
          clientState: data?.client_state
        });
        break;
      
      case 'call.machine.detection.ended':
        console.log('Machine detection ended:', data?.call_control_id, 'Result:', data?.result);
        break;
      
      default:
        console.log('Unhandled webhook event:', event_type);
    }
  }

  static async handleCallStateUpdate(update: CallStateUpdate): Promise<void> {
    try {
      console.log(`Call ${update.status}:`, update.callControlId);
      
      // Store the call state update
      await CallStateService.updateCallState(
        update.callControlId,
        update.status,
        {
          timestamp: update.timestamp,
          hangupCause: update.hangupCause,
          clientState: update.clientState
        }
      );
      
      // Broadcast the state update
      await CallStateService.broadcastCallStateUpdate(update);
      
    } catch (error) {
      console.error('Failed to handle call state update:', error);
      throw error;
    }
  }
}