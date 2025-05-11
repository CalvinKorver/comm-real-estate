"use client"

import { useState, useEffect } from "react"
import { Workout } from "@/types/workout"
import { getWorkouts, calculateTotalDistance } from "@/lib/workouts"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ActiveToggle from "@/components/ActiveToggle"

export default function WorkoutsPage() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setIsLoading(true)
        const data = await getWorkouts()
        setWorkouts(data)
        setError(null)
      } catch (error) {
        setError('Failed to load workouts')
        console.error('Failed to load workouts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkouts()
  }, [])

  const handleCreateWorkout = () => {
    router.push('/workouts/create')
  }

  const filteredWorkouts = showInactive ? workouts : workouts.filter(workout => workout.isActive)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Workouts</h1>
        <ActiveToggle
          isActive={!showInactive}
          isArchiving={false}
          onToggle={() => setShowInactive(!showInactive)}
          label="Active Workouts"
        />
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-gray-500">Loading workouts...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredWorkouts.length === 0 ? (
          <p className="text-gray-500">No workouts found</p>
        ) : (
          filteredWorkouts.map((workout) => {
            const { total, unit } = calculateTotalDistance(workout)
            return (
              <Link 
                href={`/workouts/${workout.id}`} 
                key={workout.id} 
                className="block p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{workout.name}</h2>
                    <p className="text-gray-600">
                      {new Date(workout.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium">
                      {total.toFixed(1)} {unit.toLowerCase()}
                    </p>
                    {workout.isFavorite && (
                      <span className="text-yellow-500">★</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleCreateWorkout}
          className="w-1/2 max-w-md px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
        >
          Create Workout
        </button>
      </div>
    </div>
  )
} 