# Geocoding System Setup

This project now includes a comprehensive geocoding system that automatically converts property addresses to geographic coordinates when importing data via CSV.

## Features

- **Automatic Geocoding**: Properties are automatically geocoded during CSV import
- **Extensible Architecture**: Easy to switch between different geocoding providers
- **Batch Processing**: Process existing properties without coordinates
- **Confidence Levels**: Track the accuracy of geocoded results
- **Rate Limiting**: Built-in protection against API rate limits

## Setup

### 1. Google Maps API Key

You'll need a Google Maps API key with the following APIs enabled:
- **Geocoding API** (required for address → coordinates)
- **Maps JavaScript API** (for displaying maps)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the required APIs
4. Create an API key in the Credentials section
5. Restrict the API key to your domain for security

### 2. Environment Variables

Add your Google Maps API key to your `.env.local` file:

```bash
# For geocoding (server-side)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_geocoding_api_key_here

# For maps (client-side)
NEXT_PUBLIC_NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key_here
```

### 3. Database Migration

The system automatically creates the necessary database tables. Run the migration:

```bash
npx prisma migrate dev
```

## Usage

### CSV Import with Geocoding

When you upload a CSV file with property data, the system will:

1. Process the CSV data
2. Create properties and owners
3. Automatically geocode each property address
4. Store coordinates in the database
5. Return a summary including geocoding results

The CSV upload response now includes:
- `geocodedProperties`: Number of successfully geocoded properties
- `geocodingErrors`: List of addresses that failed to geocode

### Batch Geocoding Existing Properties

For properties that were imported before geocoding was implemented:

#### API Endpoints

**Get Geocoding Statistics:**
```bash
GET /api/geocoding/batch
```

**Batch Geocode All Properties:**
```bash
POST /api/geocoding/batch
Content-Type: application/json

{
  "batchSize": 10,
  "delayBetweenBatches": 1000
}
```

**Geocode Individual Property:**
```bash
POST /api/geocoding/property/{propertyId}
```

#### Example Usage

```javascript
// Get statistics
const stats = await fetch('/api/geocoding/batch').then(r => r.json());

// Batch geocode all properties
const result = await fetch('/api/geocoding/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ batchSize: 5, delayBetweenBatches: 2000 })
}).then(r => r.json());
```

### Programmatic Usage

```typescript
import { getGeocodingService } from '@/lib/services/geocoding-service';
import { CoordinateService } from '@/lib/services/coordinate-service';

// Geocode a single address
const geocodingService = getGeocodingService();
const result = await geocodingService.geocodeProperty(
  '123 Main St',
  'Seattle',
  'WA',
  '98101'
);

// Get or create coordinates for a property
const coordinateService = new CoordinateService();
const coordinates = await coordinateService.getOrCreateCoordinates(
  propertyId,
  streetAddress,
  city,
  state,
  zipCode
);
```

## Architecture

### Extensible Design

The system is designed to be easily extensible for different geocoding providers:

```typescript
// Current providers
type GeocodingProvider = 'google' | 'mapbox' | 'nominatim';

// Easy to add new providers
const geocodingService = getGeocodingService('google'); // or 'mapbox', 'nominatim'
```

### Service Layers

1. **GeocodingClient Interface**: Abstract interface for all geocoding providers
2. **GoogleGeocodingClient**: Google Maps Geocoding API implementation
3. **CoordinateService**: Database operations for coordinates
4. **BatchGeocodingService**: Batch processing utilities

### Database Schema

```sql
-- Properties table (existing)
CREATE TABLE properties (
  id UUID PRIMARY KEY,
  street_address TEXT,
  city TEXT,
  -- ... other fields
);

-- Coordinates table (new)
CREATE TABLE coordinates (
  id UUID PRIMARY KEY,
  property_id UUID UNIQUE REFERENCES properties(id),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  confidence TEXT, -- 'high', 'medium', 'low'
  place_id TEXT,   -- Google Place ID
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Configuration

### Rate Limiting

The system includes built-in rate limiting to avoid hitting API limits:

- **Default delay**: 100ms between individual geocoding requests
- **Batch delay**: 1000ms between batches (configurable)
- **Batch size**: 10 properties per batch (configurable)

### Confidence Levels

The system tracks geocoding confidence:

- **High**: Exact street address match
- **Medium**: Route or intersection match
- **Low**: City or region match

## Troubleshooting

### Common Issues

1. **"Google Maps API key is required"**
   - Ensure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in your environment variables
   - Verify the API key has the Geocoding API enabled

2. **"Failed to geocode address"**
   - Check if the address is valid and complete
   - Verify the Google Geocoding API is enabled
   - Check API quota and billing status

3. **Rate limiting errors**
   - Increase delays between requests
   - Reduce batch sizes
   - Check Google API quota limits

### Monitoring

Monitor geocoding success rates through the API responses:

```javascript
const uploadResult = await uploadCSV(file);
console.log(`Geocoded: ${uploadResult.geocodedProperties}/${uploadResult.createdProperties}`);
console.log('Geocoding errors:', uploadResult.geocodingErrors);
```

## Future Enhancements

- **Mapbox Integration**: Alternative geocoding provider
- **OpenStreetMap Nominatim**: Free geocoding option
- **Caching**: Cache geocoding results to reduce API calls
- **Address Validation**: Pre-validate addresses before geocoding
- **Reverse Geocoding**: Convert coordinates back to addresses 