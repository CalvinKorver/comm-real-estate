import { Workout, DistanceUnit, Block } from '@/types/workout'

// Type for creating a new workout (without server-generated fields)
export type CreateWorkoutInput = {
  name: string
  blocks: {
    blockType: Block['blockType']
    metricType?: Block['metricType']
    distance?: number
    distanceUnit?: Block['distanceUnit']
    duration?: number
    repeats?: number
    paceConstraint?: {
      duration: number
      unit: DistanceUnit
    }
  }[]
  userId: string
  imageName?: string
}

export async function getWorkouts(): Promise<Workout[]> {
  try {
    console.log("Client: Fetching workouts")
    const response = await fetch('/api/workouts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Client: Failed to fetch workouts:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`Failed to fetch workouts: ${response.status} ${response.statusText}`)
    }
    
    const workouts = await response.json()
    console.log("Client: Successfully fetched workouts:", workouts.length)
    return workouts
  } catch (error) {
    console.error('Client: Error fetching workouts:', error)
    throw error
  }
}

export function calculateTotalDistance(workout: Workout): { total: number; unit: DistanceUnit } {
  if (!workout.blocks) return { total: 0, unit: DistanceUnit.MILES }

  let totalDistance = 0
  let unit = DistanceUnit.MILES // Default unit

  workout.blocks.forEach(block => {
    if (block.distance && block.distanceUnit) {
      // Convert all distances to miles for consistent addition
      const distanceInMiles = convertToMiles(block.distance, block.distanceUnit)
      totalDistance += distanceInMiles
      unit = DistanceUnit.MILES
    }
  })

  return { total: totalDistance, unit }
}

function convertToMiles(value: number, fromUnit: DistanceUnit): number {
  switch (fromUnit) {
    case DistanceUnit.MILES:
      return value
    case DistanceUnit.KILOMETERS:
      return value * 0.621371 // 1 km = 0.621371 miles
    case DistanceUnit.METERS:
      return value * 0.000621371 // 1 m = 0.000621371 miles
    case DistanceUnit.YARDS:
      return value * 0.000568182 // 1 yd = 0.000568182 miles
    default:
      return value
  }
}

export async function createWorkout(data: CreateWorkoutInput): Promise<Workout> {
  try {
    console.log("Client: Creating workout")
    const response = await fetch('/api/workouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Client: Failed to create workout:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`Failed to create workout: ${response.status} ${response.statusText}`)
    }
    
    const workout = await response.json()
    console.log("Client: Successfully created workout:", workout)
    return workout
  } catch (error) {
    console.error('Client: Error creating workout:', error)
    throw error
  }
}

export async function archiveWorkout(id: string, isActive: boolean = false): Promise<Workout> {
  try {
    console.log("Client: Updating workout status")
    const response = await fetch(`/api/workouts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Client: Failed to update workout status:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`Failed to update workout status: ${response.status} ${response.statusText}`)
    }
    
    const workout = await response.json()
    console.log("Client: Successfully updated workout status:", workout)
    return workout
  } catch (error) {
    console.error('Client: Error updating workout status:', error)
    throw error
  }
}

export async function deleteWorkout(id: string): Promise<boolean> {
  try {
    console.log("Client: Deleting workout", id)
    const response = await fetch(`/api/workouts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Client: Failed to delete workout:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`Failed to delete workout: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log("Client: Successfully deleted workout:", result)
    return result.success
  } catch (error) {
    console.error('Client: Error deleting workout:', error)
    throw error
  }
} 