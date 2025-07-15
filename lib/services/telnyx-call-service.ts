import { hangupCall, getCallInfo, answerCall, rejectCall } from '../telnyx-server-client';

export interface HangupResult {
  success: boolean;
  message: string;
  callControlId: string;
  timestamp: string;
  details?: string;
}

export interface CallStatusResult {
  callControlId: string;
  status: string;
  timestamp: string;
  hangupCause?: string;
  clientState?: string;
}

export class TelnyxCallService {

  static async hangupCall(
    callControlId: string, 
    reason: string = 'client_initiated'
  ): Promise<HangupResult> {
    if (!callControlId) {
      throw new Error('Call control ID is required');
    }

    const timestamp = new Date().toISOString();

    try {
      await hangupCall(callControlId, `${reason}_hangup`);

      console.log('Call hangup initiated via service:', {
        callControlId,
        reason,
        timestamp
      });

      return {
        success: true,
        message: 'Call hangup initiated successfully',
        callControlId,
        timestamp
      };

    } catch (telnyxError: any) {
      console.error('Telnyx hangup error:', telnyxError);
      
      // If call is already ended, treat as success
      if (telnyxError.message?.includes('call_not_found') || telnyxError.message?.includes('call_already_ended')) {
        return {
          success: true,
          message: 'Call already ended',
          callControlId,
          timestamp
        };
      }

      // Re-throw other errors to be handled by the caller
      throw new Error(`Failed to hangup call via Telnyx API: ${telnyxError.message}`);
    }
  }

  static async validateCallControlId(callControlId: string): Promise<boolean> {
    if (!callControlId || typeof callControlId !== 'string') {
      return false;
    }

    // Basic validation - Telnyx call control IDs are typically UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(callControlId);
  }

  static async getCallInfo(callControlId: string): Promise<any> {
    try {
      const call = await getCallInfo(callControlId);
      return call;
    } catch (error: any) {
      console.error('Failed to retrieve call info:', error);
      throw new Error(`Failed to retrieve call info: ${error.message}`);
    }
  }

  static async answerCall(callControlId: string, clientState?: string): Promise<any> {
    try {
      const result = await answerCall(callControlId, clientState);
      return result;
    } catch (error: any) {
      console.error('Failed to answer call:', error);
      throw new Error(`Failed to answer call: ${error.message}`);
    }
  }

  static async rejectCall(callControlId: string, cause?: string): Promise<any> {
    try {
      const result = await rejectCall(callControlId, cause);
      return result;
    } catch (error: any) {
      console.error('Failed to reject call:', error);
      throw new Error(`Failed to reject call: ${error.message}`);
    }
  }
}