// Server-side Telnyx client for API routes
let telnyxClient: any = null;

function initializeTelnyxClient() {
  if (!telnyxClient) {
    const telnyxApiKey = process.env.TELNYX_API_KEY;
    if (!telnyxApiKey) {
      throw new Error('TELNYX_API_KEY not configured');
    }

    try {
      // Try different import patterns
      let telnyx;
      try {
        telnyx = require('telnyx').default;
      } catch {
        telnyx = require('telnyx');
      }
      
      telnyxClient = telnyx(telnyxApiKey);
      
      // Debug: log available methods
      console.log('Telnyx client methods:', Object.keys(telnyxClient));
      
    } catch (error) {
      console.error('Failed to initialize Telnyx client:', error);
      throw new Error('Failed to initialize Telnyx SDK');
    }
  }
  return telnyxClient;
}

export async function createTelephonyCredentials(connectionId: string) {
  try {
    const client = initializeTelnyxClient();
    return await client.telephonyCredentials.create({
      connection_id: connectionId
    });
  } catch (error) {
    console.error('Failed to create telephony credentials:', error);
    throw error;
  }
}

export async function generateAccessTokenFromCredential(credentialId: string) {
  try {
    const client = initializeTelnyxClient();
    
    // Check available methods on telephonyCredentials
    console.log('Available telephonyCredentials methods:', Object.keys(client.telephonyCredentials));
    
    // Try creating a token for the credential
    if (client.telephonyCredentials.createToken) {
      return await client.telephonyCredentials.createToken(credentialId);
    } else if (client.telephonyCredentials.tokens && client.telephonyCredentials.tokens.create) {
      return await client.telephonyCredentials.tokens.create({ credential_id: credentialId });
    } else {
      // Fallback: just retrieve the credential - we'll extract the login token from it
      return await client.telephonyCredentials.retrieve(credentialId);
    }
  } catch (error) {
    console.error('Failed to generate access token:', error);
    throw error;
  }
}

export async function hangupCall(callControlId: string, clientState?: string) {
  try {
    const client = initializeTelnyxClient();
    
    const result = await client.calls.hangup(callControlId, {
      client_state: clientState || 'server_initiated_hangup'
    });
    
    console.log('Call hangup initiated via server client:', {
      callControlId,
      clientState,
      result
    });
    
    return result;
  } catch (error) {
    console.error('Failed to hangup call:', error);
    throw error;
  }
}

export async function getCallInfo(callControlId: string) {
  try {
    const client = initializeTelnyxClient();
    
    const call = await client.calls.retrieve(callControlId);
    
    console.log('Call info retrieved:', {
      callControlId,
      status: call.call_status,
      direction: call.direction
    });
    
    return call;
  } catch (error) {
    console.error('Failed to get call info:', error);
    throw error;
  }
}

export async function answerCall(callControlId: string, clientState?: string) {
  try {
    const client = initializeTelnyxClient();
    
    const result = await client.calls.answer(callControlId, {
      client_state: clientState || 'server_answered'
    });
    
    console.log('Call answered via server client:', {
      callControlId,
      clientState,
      result
    });
    
    return result;
  } catch (error) {
    console.error('Failed to answer call:', error);
    throw error;
  }
}

export async function rejectCall(callControlId: string, cause?: string) {
  try {
    const client = initializeTelnyxClient();
    
    const result = await client.calls.reject(callControlId, {
      cause: cause || 'CALL_REJECTED'
    });
    
    console.log('Call rejected via server client:', {
      callControlId,
      cause,
      result
    });
    
    return result;
  } catch (error) {
    console.error('Failed to reject call:', error);
    throw error;
  }
} 