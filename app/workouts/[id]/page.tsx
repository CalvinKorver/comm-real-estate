"use client"

import { useState, useEffect, use } from "react"
import { Workout } from "@/types/workout"
import { getWorkouts, archiveWorkout, deleteWorkout } from "@/lib/workouts"
import Block from "@/components/Block"
import WorkBlock from "@/components/WorkBlock"
import ActiveToggle from "@/components/ActiveToggle"
import { BlockType, DistanceUnit, MetricType } from "@/types/workout"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export default function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isArchiving, setIsArchiving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        setIsLoading(true)
        const workouts = await getWorkouts()
        const foundWorkout = workouts.find(w => w.id === id)
        if (foundWorkout) {
          console.log('Found workout:', foundWorkout)
          setWorkout(foundWorkout)
        } else {
          setError('Workout not found')
        }
      } catch (error) {
        setError('Failed to load workout')
        console.error('Failed to load workout:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkout()
  }, [id])

  const handleToggleActive = async () => {
    if (!workout) return

    try {
      setIsArchiving(true)
      const updatedWorkout = await archiveWorkout(workout.id, !workout.isActive)
      setWorkout(updatedWorkout)
    } catch (error) {
      console.error('Failed to update workout status:', error)
      setError('Failed to update workout status')
    } finally {
      setIsArchiving(false)
    }
  }

  const handleDelete = async () => {
    if (!workout) return

    try {
      setIsDeleting(true)
      await deleteWorkout(workout.id)
      // Navigate back to workouts list
      router.push('/workouts')
    } catch (error) {
      console.error('Failed to delete workout:', error)
      setError('Failed to delete workout')
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>
  }

  if (!workout) {
    return <div className="container mx-auto px-4 py-8">Workout not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{workout.name}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            className="h-9 w-9 text-red-500"
            aria-label="Delete workout"
          >
            <Trash size={18} />
          </Button>
          <ActiveToggle
            isActive={workout.isActive}
            isArchiving={isArchiving}
            onToggle={handleToggleActive}
          />
        </div>
      </div>
      <div className="text-lg text-zinc-300 mb-4">Intervals</div>
      {workout.blocks && workout.blocks.map((block) => {
        // Skip rest blocks as they are handled within work blocks
        if (block.blockType === BlockType.REST) {
          return null
        }

        let label = ''
        let highlight = false
        switch (block.blockType) {
          case BlockType.WARMUP:
            label = 'Warmup'
            break
          case BlockType.WORK:
            label = 'Work'
            break
          case BlockType.COOLDOWN:
            label = 'Cooldown'
            highlight = true
            break
          default:
            label = block.blockType
        }
        console.log('block')
        console.log(block)

        // Handle distance or time based on metricType
        const distance = block.metricType === MetricType.DISTANCE ? block.distance : undefined
        const unit = block.metricType === MetricType.DISTANCE ? block.distanceUnit?.toLowerCase() : undefined
        const time = block.metricType === MetricType.TIME ? block.duration : undefined

        console.log(block)
        // Pace (if available)
        let pace: string | undefined
        if (block.paceConstraint) {
          const mins = Math.floor(block.paceConstraint.duration / 60)
          const secs = block.paceConstraint.duration % 60
          pace = `${mins}:${secs.toString().padStart(2, '0')} min/${block.paceConstraint.unit.toLowerCase()}`
          console.log("Has pace")
        }

        // For work blocks with rest, use WorkBlock component
        if (block.blockType === BlockType.WORK) {
          console.log('Work block data:', {
            block,
            repeats: block.repeats,
            restBlock: block.restBlock
          })

          const rest = (block.restBlock && block.restBlock.duration) ? {
            time: block.restBlock.duration,
            repeats: block.repeats
          } : undefined

            return (
              <WorkBlock
                key={block.id}
                label={label}
                distance={distance}
                unit={unit}
                time={time}
                pace={pace}
                rest={rest}
                highlight={highlight}
                metricType={block.metricType}
              />
            )
          }
          

        // For other blocks, use regular Block component
        return (
          <Block
            key={block.id}
            label={label}
            distance={distance}
            unit={unit}
            time={time}
            pace={pace}
            highlight={highlight}
            metricType={block.metricType}
          />
        )
      })}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open: boolean) => setShowDeleteDialog(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this workout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{workout.name}&rdquo; and all of its data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
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