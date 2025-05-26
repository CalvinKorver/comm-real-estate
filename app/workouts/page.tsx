"use client"

import { useState, useEffect } from "react"
import { Workout } from "@/types/workout"
import { getWorkouts, calculateTotalDistance, deleteWorkout } from "@/lib/workouts"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ActiveToggle from "@/components/ActiveToggle"
import { Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"

export default function WorkoutsPage() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const handleCreateWorkout = () => {
    router.push('/workouts/create')
  }

  const handleDeleteClick = (e: React.MouseEvent, workoutId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setWorkoutToDelete(workoutId)
  }

  const handleConfirmDelete = async () => {
    if (!workoutToDelete) return
    
    try {
      setIsDeleting(true)
      await deleteWorkout(workoutToDelete)
      await fetchWorkouts() // Refresh the list
    } catch (error) {
      console.error('Error deleting workout:', error)
      setError('Failed to delete workout')
    } finally {
      setIsDeleting(false)
      setWorkoutToDelete(null)
    }
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
              <div 
                key={workout.id} 
                className="block p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow relative bg-gray-800"
              >
                <Link 
                  href={`/workouts/${workout.id}`} 
                  className="block"
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
                      {/* {workout.isFavorite && (
                        <span className="text-yellow-500">★</span>
                      )} */}
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-2 right-2 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={(e) => handleDeleteClick(e, workout.id)}
                  aria-label="Delete workout"
                >
                  <Trash size={16} />
                </Button>
              </div>
            )
          })
        )}
      </div>
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleCreateWorkout}
          className="w-1/3 max-w-md px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-red-800 transition-colors"
        >
          Create Workout
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!workoutToDelete} onOpenChange={(open: boolean) => !open && setWorkoutToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this workout and all of its data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 