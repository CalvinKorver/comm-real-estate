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