import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Verify webhook signature
function verifyWebhookSignature(payload, signature, timestamp) {
  const publicKey = process.env.TELNYX_PUBLIC_KEY;
  
  // Construct the signed payload
  const signedPayload = `${timestamp}|${payload}`;
  
  // Verify the signature
  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(signedPayload);
  verify.end();
  
  return verify.verify(
    `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`,
    signature,
    'base64'
  );
}

export async function POST(request) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Get headers
    const signature = request.headers.get('telnyx-signature-ed25519');
    const timestamp = request.headers.get('telnyx-timestamp');
    
    // Verify webhook (optional but recommended)
    // if (!verifyWebhookSignature(rawBody, signature, timestamp)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }
    
    const event = JSON.parse(rawBody);
    const eventType = event.data.event_type;
    const payload = event.data.payload;
    
    console.log('Webhook received:', eventType);
    
    // Handle different event types
    switch (eventType) {
      case 'call.initiated':
        console.log('Call initiated:', payload.call_control_id);
        break;
        
      case 'call.answered':
        console.log('Call answered:', payload.call_control_id);
        // Update call status in database
        break;
        
      case 'call.hangup':
        console.log('Call ended:', {
          callId: payload.call_control_id,
          duration: payload.call_duration,
          hangupCause: payload.hangup_cause
        });
        // Update call record with duration and status
        break;
        
      case 'call.recording.saved':
        console.log('Recording saved:', payload.recording_urls);
        // Save recording URL to database
        break;
        
      default:
        console.log('Unhandled event type:', eventType);
    }
    
    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ received: true });
  }
}