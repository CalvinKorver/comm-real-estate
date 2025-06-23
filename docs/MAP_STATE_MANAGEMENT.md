# Map State Management Pattern

This document describes the centralized state management pattern implemented for map interactions in the real estate application.

## Overview

The map state management uses React Context and hooks to provide a centralized, predictable state management solution for all map-related interactions. This pattern ensures that map state is consistent across all components and provides a clean API for map operations.

## Architecture

### Core Components

1. **MapContext** (`contexts/MapContext.tsx`)
   - Provides the centralized state store
   - Implements a reducer pattern for state updates
   - Exposes convenience methods for common operations

2. **MapProvider** 
   - Wraps the application to provide context
   - Configurable with initial center and zoom values

3. **Custom Hooks**
   - `useMap()` - Full access to state and actions
   - `useMapState()` - Read-only access to state
   - `useMapActions()` - Access to actions only

### State Structure

```typescript
interface MapState {
  center: Coordinates
  zoom: number
  bounds: Bounds | null
  selectedPropertyId: string | null
  highlightedPropertyId: string | null
  isLoading: boolean
  error: string | null
  mapInstance: google.maps.Map | null
}
```

## Usage Examples

### Basic Usage

```tsx
import { useMap } from '@/contexts/MapContext'

function MyComponent() {
  const { state, zoomIn, zoomOut, setCenter } = useMap()
  
  return (
    <div>
      <p>Current zoom: {state.zoom}</p>
      <button onClick={zoomIn}>Zoom In</button>
      <button onClick={zoomOut}>Zoom Out</button>
    </div>
  )
}
```

### State-Only Access

```tsx
import { useMapState } from '@/contexts/MapContext'

function MapInfo() {
  const { center, zoom, isLoading } = useMapState()
  
  return (
    <div>
      {isLoading ? 'Loading...' : `Zoom: ${zoom}`}
    </div>
  )
}
```

### Actions-Only Access

```tsx
import { useMapActions } from '@/contexts/MapContext'

function MapControls() {
  const { zoomIn, zoomOut, resetView } = useMapActions()
  
  return (
    <div>
      <button onClick={zoomIn}>+</button>
      <button onClick={zoomOut}>-</button>
      <button onClick={resetView}>Reset</button>
    </div>
  )
}
```

## Available Actions

### Zoom Operations
- `zoomIn()` - Increase zoom level by 1
- `zoomOut()` - Decrease zoom level by 1
- `setZoom(zoom: number)` - Set specific zoom level
- `resetView()` - Reset to default center and zoom

### Center Operations
- `setCenter(center: Coordinates)` - Set map center
- `panTo(center: Coordinates)` - Pan to specific coordinates

### Property Operations
- `selectProperty(propertyId: string | null)` - Select/deselect property
- `highlightProperty(propertyId: string | null)` - Highlight/deselect property

### Map Instance
- `setMapInstance(map: google.maps.Map | null)` - Store map instance reference

### Loading & Error
- `setLoading(loading: boolean)` - Set loading state
- `setError(error: string | null)` - Set error state

## Components

### MapZoomControls

A reusable component that provides zoom in/out and reset functionality:

```tsx
<MapZoomControls 
  position="top-right"
  showResetButton={true}
/>
```

**Props:**
- `position` - Position on the map ('top-left', 'top-right', 'bottom-left', 'bottom-right')
- `showResetButton` - Whether to show the reset view button
- `className` - Additional CSS classes

### MapStateDebugger

A development component that displays current map state:

```tsx
<MapStateDebugger />
```

## Integration with Google Maps

The context integrates seamlessly with Google Maps by:

1. **Storing the map instance** - Allows direct manipulation of the map
2. **Listening to map events** - Updates context state when map changes
3. **Applying context changes** - Updates the map when context state changes

### Example Integration

```tsx
// In GoogleMapContainer
const { setMapInstance, setCenter, setZoom } = useMapActions()
const { center, zoom } = useMapState()

// Store map instance when created
useEffect(() => {
  const map = new google.maps.Map(container, options)
  setMapInstance(map)
}, [])

// Listen to map changes
map.addListener('center_changed', () => {
  const center = map.getCenter()
  setCenter({ lat: center.lat(), lng: center.lng() })
})

map.addListener('zoom_changed', () => {
  setZoom(map.getZoom())
})

// Apply context changes to map
useEffect(() => {
  if (mapInstance) {
    mapInstance.setCenter(center)
    mapInstance.setZoom(zoom)
  }
}, [center, zoom, mapInstance])
```

## Benefits

1. **Centralized State** - All map state in one place
2. **Predictable Updates** - Reducer pattern ensures consistent state changes
3. **Reusable Components** - Zoom controls and other components can be used anywhere
4. **Type Safety** - Full TypeScript support
5. **Performance** - Context updates only when necessary
6. **Testability** - Easy to test individual actions and state changes

## Future Enhancements

- Add support for map bounds management
- Implement undo/redo functionality
- Add map style switching
- Support for multiple map instances
- Add map interaction history

## Best Practices

1. **Use specific hooks** - Use `useMapState()` for read-only access, `useMapActions()` for actions
2. **Avoid direct dispatch** - Use convenience methods instead of dispatching actions directly
3. **Handle loading states** - Always check loading state before performing operations
4. **Error boundaries** - Wrap map components in error boundaries
5. **Performance** - Use `useMemo` and `useCallback` for expensive operations 