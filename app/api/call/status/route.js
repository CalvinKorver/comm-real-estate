import { NextResponse } from 'next/server';
import telnyx from 'telnyx';

const Telnyx = telnyx(process.env.TELNYX_API_KEY);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const callControlId = searchParams.get('callId');
  
  if (!callControlId) {
    return NextResponse.json({ error: 'Call ID required' }, { status: 400 });
  }
  
  try {
    // Note: Telnyx doesn't have a direct "get call" endpoint
    // You would typically track this in your own database
    // This is a placeholder for your implementation
    
    return NextResponse.json({
      callId: callControlId,
      status: 'active', // Get from your database
      duration: 0
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get call status' },
      { status: 500 }
    );
  }
}