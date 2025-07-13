import { NextRequest, NextResponse } from 'next/server';
import { createTelephonyCredentials, generateAccessTokenFromCredential } from '@/lib/telnyx-server-client';

export async function POST(request: NextRequest) {
  try {
    const connectionId = process.env.TELNYX_CONNECTION_ID;
    const telnyxSIPConnectionId = process.env.TELNYX_SIP_CONNECTION_ID;

    if (!connectionId) {
      return NextResponse.json(
        { error: 'Telnyx credentials not configured. Please set TELNYX_CONNECTION_ID environment variable.' },
        { status: 500 }
      );
    }

    if (!telnyxSIPConnectionId) {
      return NextResponse.json(
        { error: 'Telnyx SIP connection ID not configured. Please set TELNYX_SIP_CONNECTION_ID environment variable.' },
        { status: 500 }
      );
    }

    // Create telephony credentials
    const telephonyCredentials = await createTelephonyCredentials(telnyxSIPConnectionId);

    // Generate access token from credential
    const accessToken = await generateAccessTokenFromCredential(telephonyCredentials.data.id);

    console.log('Token generated at:', new Date().toISOString());
    // console.log('Access token response:', accessToken);

    // Handle different response formats
    const tokenData = accessToken.data || accessToken;
    
    // console.log('Token data structure:', {
    //   hasToken: !!tokenData.token,
    //   hasSipUsername: !!tokenData.sip_username,
    //   hasSipPassword: !!tokenData.sip_password,
    //   tokenData: tokenData
    // });
    
    // The token is directly in the data field as a string (JWT)
    const token = typeof tokenData === 'string' ? tokenData : (tokenData.token || tokenData.sip_username);
    
    return NextResponse.json({
      token: token,
      credential_id: telephonyCredentials.data.id,
      expires_at: tokenData.expires_at
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate access token' },
      { status: 500 }
    );
  }
}