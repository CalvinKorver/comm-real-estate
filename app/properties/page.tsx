"use client"

import { useState, useEffect } from "react"
import { Property } from "@/types/property"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

export default function PropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchProperties = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/properties')
      if (!response.ok) {
        throw new Error('Failed to fetch properties')
      }
      const data = await response.json()
      setProperties(data)
      setError(null)
    } catch (error) {
      setError('Failed to load properties')
      console.error('Failed to load properties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const handleCreateProperty = () => {
    router.push('/properties/create')
  }

  const handleDeleteClick = (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setPropertyToDelete(propertyId)
  }

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return
    
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/properties/${propertyToDelete}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete property')
      }
      await fetchProperties() // Refresh the list
    } catch (error) {
      console.error('Error deleting property:', error)
      setError('Failed to delete property')
    } finally {
      setIsDeleting(false)
      setPropertyToDelete(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Properties</h1>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-gray-500">Loading properties...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : properties.length === 0 ? (
          <p className="text-gray-500">No properties found</p>
        ) : (
          properties.map((property) => (
            <div 
              key={property.id} 
              className="block p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow relative bg-gray-200"
            >
              <Link 
                href={`/properties/${property.id}`} 
                className="block"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{property.street_address}</h2>
                    <p className="text-gray-600">
                      {property.city}, {property.zip_code}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium">
                      ${property.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {property.number_of_units} units
                    </p>
                  </div>
                  
                  
                  

                </div>
                <div className="pt-2">
                  <h3 className="font-semibold-800">Details</h3>
                  <p className="text-sm text-gray-600">Projected Cash Flow: $4,000/month</p>
                  <p className="text-sm text-gray-600">Annual Taxes: $25,000/year</p>
                
                  </div>
              </Link>

            </div>
          ))
        )}
      </div>
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleCreateProperty}
          className="w-1/3 max-w-md px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Add Property
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!propertyToDelete} onOpenChange={(open: boolean) => !open && setPropertyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this property and all of its data. This action cannot be undone.
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