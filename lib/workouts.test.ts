import { getWorkouts, calculateTotalDistance, createWorkout, CreateWorkoutInput } from './workouts'
import { Workout, BlockType, MetricType, DistanceUnit } from '@/types/workout'

// Mock console methods to keep test output clean
const originalConsoleLog = console.log
const originalConsoleError = console.error

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

beforeAll(() => {
  console.log = jest.fn()
  console.error = jest.fn()
})

afterAll(() => {
  console.log = originalConsoleLog
  console.error = originalConsoleError
})

describe('getWorkouts', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('should return an empty array when no workouts exist', async () => {
    // Mock successful response with empty array
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    })

    const workouts = await getWorkouts()
    expect(workouts).toEqual([])
    expect(Array.isArray(workouts)).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith('/api/workouts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })

  it('should return an array with a workout when one exists', async () => {
    const mockWorkout: Workout = {
      id: '123',
      name: 'Morning Run',
      isFavorite: false,
      imageName: 'runner',
      userId: 'user123',
      createdAt: '2024-04-06T10:00:00Z',
      updatedAt: '2024-04-06T10:00:00Z',
      blocks: [
        {
          id: 'block1',
          blockType: BlockType.WARMUP,
          workoutId: '123',
          metricType: MetricType.DISTANCE,
          distance: 1.0,
          distanceUnit: DistanceUnit.MILES,
          createdAt: '2024-04-06T10:00:00Z',
          updatedAt: '2024-04-06T10:00:00Z'
        }
      ]
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockWorkout])
    })

    const workouts = await getWorkouts()
    expect(workouts).toHaveLength(1)
    expect(workouts[0]).toEqual(mockWorkout)
    expect(workouts[0]).toHaveProperty('id', '123')
    expect(workouts[0]).toHaveProperty('name', 'Morning Run')
    expect(workouts[0]).toHaveProperty('isFavorite', false)
    expect(workouts[0]).toHaveProperty('imageName', 'runner')
    expect(workouts[0]).toHaveProperty('userId', 'user123')
    expect(workouts[0].blocks).toHaveLength(1)
    expect(workouts[0].blocks?.[0]).toHaveProperty('blockType', BlockType.WARMUP)
  })

  it('should handle API errors', async () => {
    // Mock error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({ error: 'Failed to fetch workouts' })
    })

    await expect(getWorkouts()).rejects.toThrow('Failed to fetch workouts: 500 Internal Server Error')
  })
})

describe('calculateTotalDistance', () => {
  it('should return 0 for workout with no blocks', () => {
    const workout: Workout = {
      id: '123',
      name: 'Empty Workout',
      isFavorite: false,
      imageName: 'runner',
      userId: 'user123',
      createdAt: '2024-04-06T10:00:00Z',
      updatedAt: '2024-04-06T10:00:00Z'
    }

    const result = calculateTotalDistance(workout)
    expect(result).toEqual({ total: 0, unit: DistanceUnit.MILES })
  })

  it('should sum up distances from all blocks', () => {
    const workout: Workout = {
      id: '123',
      name: 'Mixed Distance Workout',
      isFavorite: false,
      imageName: 'runner',
      userId: 'user123',
      createdAt: '2024-04-06T10:00:00Z',
      updatedAt: '2024-04-06T10:00:00Z',
      blocks: [
        {
          id: 'block1',
          blockType: BlockType.WARMUP,
          workoutId: '123',
          metricType: MetricType.DISTANCE,
          distance: 1.0,
          distanceUnit: DistanceUnit.MILES,
          createdAt: '2024-04-06T10:00:00Z',
          updatedAt: '2024-04-06T10:00:00Z'
        },
        {
          id: 'block2',
          blockType: BlockType.WORK,
          workoutId: '123',
          metricType: MetricType.DISTANCE,
          distance: 5.0,
          distanceUnit: DistanceUnit.KILOMETERS,
          createdAt: '2024-04-06T10:00:00Z',
          updatedAt: '2024-04-06T10:00:00Z'
        }
      ]
    }

    const result = calculateTotalDistance(workout)
    // 1 mile + (5 km * 0.621371 miles/km) ≈ 4.11 miles
    expect(result.total).toBeCloseTo(4.11, 2)
    expect(result.unit).toBe(DistanceUnit.MILES)
  })
})

describe('createWorkout', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('should successfully create a workout with blocks', async () => {
    const mockWorkout: Workout = {
      id: '123',
      name: 'Test Workout',
      isFavorite: false,
      imageName: 'runner',
      userId: 'user123',
      createdAt: '2024-04-06T10:00:00Z',
      updatedAt: '2024-04-06T10:00:00Z',
      blocks: [
        {
          id: 'block1',
          blockType: BlockType.WARMUP,
          workoutId: '123',
          metricType: MetricType.DISTANCE,
          distance: 1.0,
          distanceUnit: DistanceUnit.MILES,
          createdAt: '2024-04-06T10:00:00Z',
          updatedAt: '2024-04-06T10:00:00Z'
        }
      ]
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockWorkout)
    })

    const workoutData: CreateWorkoutInput = {
      name: 'Test Workout',
      userId: 'user123',
      blocks: [
        {
          blockType: BlockType.WARMUP,
          metricType: MetricType.DISTANCE,
          distance: 1.0,
          distanceUnit: DistanceUnit.MILES
        }
      ]
    }

    const result = await createWorkout(workoutData)
    expect(result).toEqual(mockWorkout)
    expect(mockFetch).toHaveBeenCalledWith('/api/workouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workoutData)
    })
  })

  it('should create a workout with pace constraints', async () => {
    const mockWorkout: Workout = {
      id: '123',
      name: 'Pace Workout',
      isFavorite: false,
      imageName: 'runner',
      userId: 'user123',
      createdAt: '2024-04-06T10:00:00Z',
      updatedAt: '2024-04-06T10:00:00Z',
      blocks: [
        {
          id: 'block1',
          blockType: BlockType.WORK,
          workoutId: '123',
          metricType: MetricType.DISTANCE,
          distance: 5.0,
          distanceUnit: DistanceUnit.KILOMETERS,
          createdAt: '2024-04-06T10:00:00Z',
          updatedAt: '2024-04-06T10:00:00Z',
          paceConstraint: {
            id: 'pace1',
            duration: 480, // 8 minutes
            unit: DistanceUnit.KILOMETERS,
            blockId: 'block1',
            createdAt: '2024-04-06T10:00:00Z',
            updatedAt: '2024-04-06T10:00:00Z'
          }
        }
      ]
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockWorkout)
    })

    const workoutData: CreateWorkoutInput = {
      name: 'Pace Workout',
      userId: 'user123',
      blocks: [
        {
          blockType: BlockType.WORK,
          metricType: MetricType.DISTANCE,
          distance: 5.0,
          distanceUnit: DistanceUnit.KILOMETERS,
          paceConstraint: {
            duration: 480,
            unit: DistanceUnit.KILOMETERS
          }
        }
      ]
    }

    const result = await createWorkout(workoutData)
    expect(result).toEqual(mockWorkout)
    expect(result.blocks?.[0].paceConstraint).toBeDefined()
    expect(result.blocks?.[0].paceConstraint?.duration).toBe(480)
  })

  it('should handle API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ error: 'Missing required fields' })
    })

    const workoutData: CreateWorkoutInput = {
      name: 'Invalid Workout',
      userId: 'user123',
      blocks: [] // Missing required blocks
    }

    await expect(createWorkout(workoutData)).rejects.toThrow('Failed to create workout: 400 Bad Request')
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const workoutData: CreateWorkoutInput = {
      name: 'Test Workout',
      userId: 'user123',
      blocks: [
        {
          blockType: BlockType.WARMUP,
          metricType: MetricType.DISTANCE,
          distance: 1.0,
          distanceUnit: DistanceUnit.MILES
        }
      ]
    }

    await expect(createWorkout(workoutData)).rejects.toThrow('Network error')
  })
}) 