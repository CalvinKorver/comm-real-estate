export interface Workout {
  id: string
  name: string
  isFavorite: boolean
  isActive: boolean
  imageName: string
  userId: string
  createdAt: string
  updatedAt: string
  blocks?: Block[]
}

export interface Block {
  id: string
  blockType: BlockType
  workoutId: string
  metricType?: MetricType
  distance?: number
  distanceUnit?: DistanceUnit
  duration?: number
  repeats?: number
  paceConstraint?: PaceConstraint
  restBlockId?: string
  restBlock?: Block
  workBlocks?: Block[]
  createdAt: string
  updatedAt: string
}

export interface PaceConstraint {
  id: string
  duration: number
  unit: DistanceUnit
  blockId: string
  createdAt: string
  updatedAt: string
}

export enum BlockType {
  WARMUP = 'WARMUP',
  COOLDOWN = 'COOLDOWN',
  WORK = 'WORK',
  REST = 'REST'
}

export enum MetricType {
  DISTANCE = 'DISTANCE',
  TIME = 'TIME'
}

export enum DistanceUnit {
  METERS = 'METERS',
  KILOMETERS = 'KILOMETERS',
  MILES = 'MILES',
  YARDS = 'YARDS'
} 