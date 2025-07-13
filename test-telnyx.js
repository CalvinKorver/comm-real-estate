// Simple test to verify Telnyx SDK loading
const telnyx = require('telnyx');

console.log('Telnyx SDK loaded successfully');
console.log('Telnyx object:', typeof telnyx);
console.log('Telnyx keys:', Object.keys(telnyx));

// Check if it has a default export or specific methods
if (telnyx.default) {
  console.log('Has default export:', typeof telnyx.default);
}

// Try different ways to access the API
console.log('Direct telephonyCredentials:', !!telnyx.telephonyCredentials);
console.log('Direct setApiKey:', typeof telnyx.setApiKey); 