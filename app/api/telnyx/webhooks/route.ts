import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, publicKey: string): boolean {
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

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('telnyx-signature-ed25519');
    const timestamp = request.headers.get('telnyx-timestamp');
    
    const telnyxPublicKey = process.env.TELNYX_PUBLIC_KEY;
    
    if (!telnyxPublicKey) {
      console.error('Telnyx public key not configured');
      return NextResponse.json({ error: 'Webhook verification failed' }, { status: 401 });
    }

    if (signature && !verifyWebhookSignature(payload, signature, telnyxPublicKey)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const webhookData = JSON.parse(payload);
    const { event_type, data } = webhookData;

    console.log('Received Telnyx webhook:', {
      event_type,
      call_control_id: data?.call_control_id,
      call_status: data?.call_status,
      timestamp: new Date().toISOString(),
    });

    switch (event_type) {
      case 'call.initiated':
        console.log('Call initiated:', data?.call_control_id);
        break;
      
      case 'call.ringing':
        console.log('Call ringing:', data?.call_control_id);
        break;
      
      case 'call.answered':
        console.log('Call answered:', data?.call_control_id);
        break;
      
      case 'call.hangup':
        console.log('Call ended:', data?.call_control_id, 'Reason:', data?.hangup_cause);
        break;
      
      case 'call.bridged':
        console.log('Call bridged:', data?.call_control_id);
        break;
      
      case 'call.machine.detection.ended':
        console.log('Machine detection ended:', data?.call_control_id, 'Result:', data?.result);
        break;
      
      default:
        console.log('Unhandled webhook event:', event_type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}