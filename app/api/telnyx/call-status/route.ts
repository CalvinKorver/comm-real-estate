import { NextRequest, NextResponse } from 'next/server';
import { CallStateService } from '@/lib/services/call-state-service';
import { isUserAuthorized, createUnauthorizedResponse } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authorized
    const isAuthorized = await isUserAuthorized();
    if (!isAuthorized) {
      return createUnauthorizedResponse();
    }
    const { searchParams } = new URL(request.url);
    const callControlId = searchParams.get('callControlId');

    if (!callControlId) {
      return NextResponse.json(
        { error: 'Call control ID is required' },
        { status: 400 }
      );
    }

    const callState = await CallStateService.getCallState(callControlId);

    if (!callState) {
      return NextResponse.json(
        { error: 'Call state not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      callControlId,
      ...callState
    });

  } catch (error: any) {
    console.error('Get call status error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get call status',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authorized
    const isAuthorized = await isUserAuthorized();
    if (!isAuthorized) {
      return createUnauthorizedResponse();
    }
    const { callControlId, status, timestamp, hangupCause, clientState } = await request.json();

    if (!callControlId || !status) {
      return NextResponse.json(
        { error: 'Call control ID and status are required' },
        { status: 400 }
      );
    }

    // Store the call state using the service
    await CallStateService.storeCallState(callControlId, {
      status,
      timestamp: timestamp || new Date().toISOString(),
      hangupCause,
      clientState
    });

    return NextResponse.json({
      success: true,
      callControlId,
      status,
      timestamp: timestamp || new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Call status API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update call status',
        details: error.message 
      },
      { status: 500 }
    );
  }
}