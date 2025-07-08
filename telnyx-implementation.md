# Telnyx Click-to-Call Implementation Guide for Next.js

## Prerequisites

1. **Telnyx Account Setup**
   - Sign up at https://telnyx.com/sign-up
   - You'll get $10 credit to test

2. **Required Telnyx Resources**
   - API Key
   - Phone Number
   - Call Control Application
   - Outbound Voice Profile

## Step 1: Set Up Telnyx Account Resources

### 1.1 Get Your API Key
1. Log into [Mission Control Portal](https://portal.telnyx.com)
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Save the key securely (you'll only see it once)

### 1.2 Buy a Phone Number
1. Go to **Numbers** → **Search & Buy Numbers**
2. Search for a number (choose one with Voice capabilities)
3. Purchase the number

### 1.3 Create a Call Control Application
1. Navigate to **Voice** → **Programmable Voice**
2. Click **Create Voice App**
3. Configure:
   - **Application Name**: "Commercial Real Estate Click-to-Call"
   - **Webhook URL**: `https://your-domain.com/api/webhooks/telnyx` (we'll create this)
   - **Webhook API Version**: v2
   - Save and note the **Application ID**

### 1.4 Create an Outbound Voice Profile
1. Go to **Voice** → **Outbound Voice Profiles**
2. Click **Add New Profile**
3. Configure:
   - **Name**: "Real Estate Outbound"
   - **Traffic Type**: Select appropriate type
   - **Allowed Destinations**: Select regions you'll call
   - **Billing Method**: Choose your preference
4. Add your Call Control Application to this profile
5. Save the profile

### 1.5 Assign Phone Number to Application
1. Go to **Numbers** → **My Numbers**
2. Click on your purchased number
3. Under **Voice Settings**, select your Call Control Application
4. Save

## Step 2: Install Dependencies

```bash
npm install telnyx axios
```

## Step 3: Environment Variables

Create `.env.local`:

```env
# Telnyx Configuration
TELNYX_API_KEY=your_api_key_here
TELNYX_PHONE_NUMBER=+1234567890  # Your Telnyx number
TELNYX_APP_ID=your_call_control_app_id
TELNYX_PUBLIC_KEY=your_public_key  # For webhook verification

# Your App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Step 4: Create API Routes

### 4.1 Outbound Call Initiation Route

Create `/app/api/call/outbound/route.js`:

```javascript
import { NextResponse } from 'next/server';
import telnyx from 'telnyx';

const Telnyx = telnyx(process.env.TELNYX_API_KEY);

export async function POST(request) {
  try {
    const { to, propertyId, propertyName, agentName } = await request.json();

    // Validate input
    if (!to || !propertyId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the outbound call
    const call = await Telnyx.calls.create({
      to: to,
      from: process.env.TELNYX_PHONE_NUMBER,
      connection_id: process.env.TELNYX_APP_ID,
      // Optional: Add custom headers or client state
      client_state: Buffer.from(JSON.stringify({
        propertyId,
        propertyName,
        agentName,
        timestamp: new Date().toISOString()
      })).toString('base64')
    });

    // Log call for tracking
    console.log('Call initiated:', {
      callControlId: call.data.call_control_id,
      callLegId: call.data.call_leg_id,
      to: to,
      propertyId: propertyId
    });

    // Save call record to your database here
    // await saveCallRecord({...})

    return NextResponse.json({
      success: true,
      callId: call.data.call_control_id,
      callLegId: call.data.call_leg_id
    });

  } catch (error) {
    console.error('Error initiating call:', error);
    return NextResponse.json(
      { error: 'Failed to initiate call', details: error.message },
      { status: 500 }
    );
  }
}
```

### 4.2 Webhook Handler Route

Create `/app/api/webhooks/telnyx/route.js`:

```javascript
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
```

### 4.3 Call Status Check Route (Optional)

Create `/app/api/call/status/route.js`:

```javascript
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
```

## Step 5: Create React Components

### 5.1 Click-to-Call Button Component

Create `/components/TelnyxClickToCall.jsx`:

```jsx
'use client';
import { useState } from 'react';
import { Phone, PhoneOff, Loader } from 'lucide-react';

export default function TelnyxClickToCall({ 
  phoneNumber, 
  propertyId, 
  propertyName,
  agentName = "Agent"
}) {
  const [calling, setCalling] = useState(false);
  const [error, setError] = useState(null);
  const [callId, setCallId] = useState(null);
  
  const initiateCall = async () => {
    setCalling(true);
    setError(null);
    
    try {
      const response = await fetch('/api/call/outbound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          propertyId,
          propertyName,
          agentName
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate call');
      }
      
      setCallId(data.callId);
      
      // Show success message
      alert(`Calling ${phoneNumber}...`);
      
    } catch (err) {
      console.error('Call error:', err);
      setError(err.message);
    } finally {
      setCalling(false);
    }
  };
  
  return (
    <div className="click-to-call-container">
      <button
        onClick={initiateCall}
        disabled={calling}
        className={`call-button ${calling ? 'calling' : ''}`}
      >
        {calling ? (
          <>
            <Loader className="animate-spin" size={20} />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Phone size={20} />
            <span>Call {phoneNumber}</span>
          </>
        )}
      </button>
      
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
      
      <style jsx>{`
        .click-to-call-container {
          display: inline-block;
        }
        
        .call-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #00c08b;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .call-button:hover:not(:disabled) {
          background: #00a074;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 192, 139, 0.3);
        }
        
        .call-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .call-button.calling {
          background: #6b7280;
        }
        
        .error-message {
          margin-top: 8px;
          padding: 8px 12px;
          background: #fee;
          color: #c00;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
```

### 5.2 Property Card with Click-to-Call

Create `/components/PropertyCard.jsx`:

```jsx
import TelnyxClickToCall from './TelnyxClickToCall';

export default function PropertyCard({ property }) {
  return (
    <div className="property-card">
      <h3>{property.name}</h3>
      <p className="address">{property.address}</p>
      <p className="details">
        {property.sqft} sq ft • ${property.price.toLocaleString()}
      </p>
      
      <div className="contact-section">
        <p className="agent-name">Contact: {property.agentName}</p>
        <TelnyxClickToCall
          phoneNumber={property.agentPhone}
          propertyId={property.id}
          propertyName={property.name}
          agentName={property.agentName}
        />
      </div>
      
      <style jsx>{`
        .property-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        h3 {
          margin: 0 0 8px 0;
          color: #1f2937;
        }
        
        .address {
          color: #6b7280;
          margin: 0 0 8px 0;
        }
        
        .details {
          color: #374151;
          font-weight: 500;
          margin: 0 0 16px 0;
        }
        
        .contact-section {
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .agent-name {
          margin: 0;
          color: #4b5563;
        }
      `}</style>
    </div>
  );
}
```

## Step 6: Database Schema (SQLite)

Create `/lib/db/schema.sql`:

```sql
-- Call tracking table
CREATE TABLE calls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  call_control_id TEXT UNIQUE,
  call_leg_id TEXT,
  property_id INTEGER,
  property_name TEXT,
  agent_name TEXT,
  from_number TEXT,
  to_number TEXT,
  status TEXT DEFAULT 'initiated',
  duration INTEGER DEFAULT 0,
  recording_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  answered_at DATETIME,
  ended_at DATETIME
);

-- Create indexes
CREATE INDEX idx_calls_property_id ON calls(property_id);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_created_at ON calls(created_at);
```

## Step 7: Testing Your Implementation

### 7.1 Local Testing with ngrok
```bash
# Install ngrok
npm install -g ngrok

# Run your Next.js app
npm run dev

# In another terminal, expose your local server
ngrok http 3000
```

Update your Call Control Application webhook URL with the ngrok URL:
`https://your-ngrok-url.ngrok.io/api/webhooks/telnyx`

### 7.2 Test Call Flow
1. Click the call button on a property
2. Your phone should ring from your Telnyx number
3. Check console logs for webhook events
4. Verify call records are saved to database

## Step 8: Production Deployment

### 8.1 Update Environment Variables
- Set production API keys
- Update webhook URL to your production domain
- Enable webhook signature verification

### 8.2 Add Error Handling
- Implement retry logic for failed calls
- Add rate limiting
- Set up monitoring and alerts

### 8.3 Security Considerations
- Validate all phone numbers before calling
- Implement user authentication
- Add CORS protection to API routes
- Enable webhook signature verification

## Cost Breakdown

**Telnyx Pricing (as of 2025):**
- Phone Number: ~$1-2/month
- Outbound Calls: Starting at $0.014/minute
- Inbound Calls: Starting at $0.0085/minute
- No per-call connection fees

**Example Monthly Cost:**
- 1 Phone Number: $2
- 1000 minutes outbound: $14
- **Total: ~$16/month**

## Troubleshooting

### Common Issues:

1. **"Connection not found" error**
   - Verify your Call Control Application ID
   - Ensure phone number is assigned to the application

2. **Calls not connecting**
   - Check Outbound Voice Profile settings
   - Verify allowed destinations include your target regions

3. **Webhooks not received**
   - Confirm webhook URL is publicly accessible
   - Check for typos in the URL
   - Look for errors in Telnyx portal webhook logs

4. **Authentication errors**
   - Verify API key is correct
   - Check if API key has necessary permissions

## Additional Features

### Call Recording
Add to your call creation:
```javascript
const call = await Telnyx.calls.create({
  // ... other parameters
  record: 'record-from-answer',
  recording_channels: 'dual',
  recording_format: 'mp3'
});
```

### Call Transcription
```javascript
const call = await Telnyx.calls.create({
  // ... other parameters
  transcription: {
    transcription_tracks: 'inbound'
  }
});
```

### Custom Caller ID Name
```javascript
const call = await Telnyx.calls.create({
  // ... other parameters
  from_display_name: 'Your Company Name'
});
```

## Next Steps

1. Implement call analytics dashboard
2. Add call scheduling functionality
3. Integrate with CRM system
4. Set up automated follow-up workflows
5. Add SMS capabilities for text messaging

## Resources

- [Telnyx Developer Portal](https://developers.telnyx.com)
- [Call Control API Reference](https://developers.telnyx.com/api/call-control)
- [Telnyx Node.js SDK](https://github.com/team-telnyx/telnyx-node)
- [Support](https://support.telnyx.com)