import { NextResponse } from 'next/server';
import { TelnyxCallService } from '../../../../lib/services/telnyx-call-service';

export async function POST(request) {
  try {
    const { to, propertyId, propertyName, agentName } = await request.json();

    // Create service instance
    const callService = TelnyxCallService.create();

    // Initiate the call using the service
    const result = await callService.initiateCall({
      to,
      propertyId,
      propertyName,
      agentName
    });

    // Handle validation errors
    if (!result.success && result.error === 'Missing required fields') {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: 400 }
      );
    }

    // Handle other errors
    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: 500 }
      );
    }

    // Save call record to your database here
    // await saveCallRecord({...})

    return NextResponse.json({
      success: result.success,
      callId: result.callId,
      callLegId: result.callLegId
    });

  } catch (error) {
    console.error('Error in call API route:', error);
    return NextResponse.json(
      { error: 'Failed to initiate call', details: error.message },
      { status: 500 }
    );
  }
}