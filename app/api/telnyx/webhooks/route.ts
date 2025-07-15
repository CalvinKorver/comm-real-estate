import { NextRequest, NextResponse } from 'next/server';
import { TelnyxWebhookService } from '@/lib/services/telnyx-webhook-service';

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

    if (signature && !TelnyxWebhookService.verifyWebhookSignature(payload, signature, telnyxPublicKey)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const webhookData = JSON.parse(payload);
    
    // Process the webhook event using the service
    await TelnyxWebhookService.processWebhookEvent(webhookData);

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}