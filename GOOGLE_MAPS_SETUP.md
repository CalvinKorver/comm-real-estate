# Google Maps API Setup

This project uses the Google Maps JavaScript API for the property map functionality.

## Setup Instructions

1. **Get a Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Maps JavaScript API" and "Places API"
   - Go to "Credentials" and create an API key
   - Restrict the API key to your domain for security

2. **Add the API Key to Environment Variables:**
   Create a `.env.local` file in the project root and add:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. **Restart the Development Server:**
   ```bash
   npm run dev
   ```

## Features

The Google Maps integration includes:
- Basic map initialization with customizable center and zoom
- Loading and error states
- Responsive design
- Placeholder for future marker functionality
- Clean script loading and cleanup

## Components

- `GoogleMapContainer.tsx` - Direct Google Maps API integration
- `PropertyMapPanel.tsx` - Right panel container for the map
- `PropertyMapView.tsx` - Main container with split layout

## Usage

```tsx
import GoogleMapContainer from '@/components/property-map/GoogleMapContainer'

// Basic usage
<GoogleMapContainer />

// With custom center and zoom
<GoogleMapContainer 
  center={{ lat: 40.7128, lng: -74.0060 }}
  zoom={14}
/>
```

## Troubleshooting

- **"Google Maps failed to load"** - Check your API key and ensure it's properly set in environment variables
- **"Failed to load Google Maps"** - Verify your API key has the correct permissions and billing is enabled
- **Map not displaying** - Check browser console for JavaScript errors 