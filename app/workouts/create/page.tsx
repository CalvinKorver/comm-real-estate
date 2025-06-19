"use client"

import { useState } from "react"
import { BlockType, MetricType, DistanceUnit } from "@/types/workout"
import Link from "next/link"
// import BuildingBlock from "@/components/BuildingBlock"
// import WorkBuildingBlock from "@/components/WorkBuildingBlock"
import { createWorkout } from "@/lib/workouts"
import { useRouter } from "next/navigation"

interface Block {
  type: BlockType
  distance?: number
  duration?: number
  metricType: MetricType
  paceConstraint?: {
    duration: number
    unit: DistanceUnit
  }
}

const AVAILABLE_BLOCKS = [
  { type: BlockType.WARMUP, label: "Add Warmup", color: "bg-gray-500 hover:bg-gray-600" },
  { type: BlockType.WORK, label: "Add Work", color: "bg-gray-500 hover:bg-gray-600" },
  { type: BlockType.COOLDOWN, label: "Add Cooldown", color: "bg-gray-500 hover:bg-gray-600" }
]

export default function CreateWorkoutPage() {
  const router = useRouter()
  const [workoutName, setWorkoutName] = useState("")
  const [blocks, setBlocks] = useState<Block[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddBlock = (type: BlockType) => {
    setBlocks([...blocks, { type, duration: 0, metricType: MetricType.DISTANCE }])
  }

  const handleDistanceChange = (index: number, distance: number) => {
    const newBlocks = [...blocks]
    newBlocks[index].distance = distance
    setBlocks(newBlocks)
  }

  const handleDurationChange = (index: number, duration: number) => {
    const newBlocks = [...blocks]
    newBlocks[index].duration = duration
    setBlocks(newBlocks)
  }

  const handleMetricTypeChange = (index: number, metricType: MetricType) => {
    const newBlocks = [...blocks]
    newBlocks[index].metricType = metricType
    setBlocks(newBlocks)
  }

  const handlePaceConstraintChange = (index: number, paceConstraint: { duration: number; unit: DistanceUnit } | undefined) => {
    const newBlocks = [...blocks]
    newBlocks[index].paceConstraint = paceConstraint
    setBlocks(newBlocks)
  }

  const handleRemoveBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index)
    setBlocks(newBlocks)
  }

  const isBlockTypeAdded = (type: BlockType) => {
    return blocks.some(block => block.type === type)
  }

  const handleSave = async () => {
    if (!workoutName.trim()) {
      setError("Please enter a workout name")
      return
    }

    if (blocks.length === 0) {
      setError("Please add at least one block")
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      // Create a test user if it doesn't exist
      const userResponse = await fetch('/api/users/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        }),
      })

      if (!userResponse.ok) {
        throw new Error('Failed to create test user')
      }

      const user = await userResponse.json()

      // Create the workout
      await createWorkout({
        name: workoutName,
        userId: user.id,
        blocks: blocks.map(block => ({
          blockType: block.type,
          metricType: block.metricType,
          distance: block.distance,
          distanceUnit: DistanceUnit.MILES,
          duration: block.duration,
          paceConstraint: block.paceConstraint
        }))
      })

      // Navigate back to workouts page
      router.push('/workouts')
    } catch (error) {
      console.error('Failed to save workout:', error)
      setError('Failed to save workout')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Create Workout</h1>

      </div>

      <div className="space-y-6">
        {/* Workout Name Input */}
        <div>

          <input
            type="text"
            id="workoutName"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Workout name"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Block Buttons */}
        <div className="flex flex-col space-y-4">
          {AVAILABLE_BLOCKS.map(({ type, label, color }) => {
            const isAdded = isBlockTypeAdded(type)
            const blockIndex = blocks.findIndex(block => block.type === type)
            
            if (isAdded) {
              if (type === BlockType.WORK) {
                return null
              } else {
                return null
              }
            }

            return (
              <button
                key={type}
                onClick={() => handleAddBlock(type)}
                className={`px-6 py-4 ${color} text-white rounded-lg transition-colors text-lg font-medium`}
              >
                {label}
              </button>
            )
          })}
        </div>
        <div className="flex flex-row justify-between space-x-4">
          <button
            className="px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-lg font-medium"
            onClick={() => router.push('/workouts')}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Workout'}
          </button>
        </div>
      </div>
    </div>
  )
} 