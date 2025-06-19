"use client"

import { useState, useEffect } from "react"
import { Property, Owner } from "@/types/property"
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
import { Icons } from "@/components/icons"

export default function PropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [search, setSearch] = useState("")
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])

  const fetchProperties = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/properties')
      if (!response.ok) {
        throw new Error('Failed to fetch properties')
      }
      const data = await response.json()
      console.log("fetched")
      console.log(data)
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

  useEffect(() => {
    setFilteredProperties(properties)
  }, [properties])

  function filterProperties(query: string) {
    const lower = query.toLowerCase()
    console.log("Query:", query);
    setFilteredProperties(
      properties.filter((property) => {
        // Address, city, zip, owner string
        console.log(property.owners)
        if (
          property.street_address.toLowerCase().includes(lower) ||
          property.city.toLowerCase().includes(lower) ||
          property.zip_code.toString().includes(lower)
        ) {
          console.log('returning true"')
          return true
        }
        return (property.owners && property.owners.find((owner) => owner.firstName.includes(query)));
      })
    );
  }

  const containsOwner = (query: string, owners: Owner[]) => {
    // console.log('in containsOwner')
    // console.log(owners)
    // console.log(query)
    owners.forEach((owner) => {
      // console.log("FIRST")
      // console.log(owner.firstName);
      if (owner.firstName.includes(query)) {
        console.log("returning true in containsOwner")
        return true
      }
    })
    return false
  
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    filterProperties(search)
  }

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
      <form onSubmit={handleSearch} className="flex w-full max-w-xl mx-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search (for owners, addresses, etc)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-r-lg hover:bg-emerald-700 flex items-center justify-center"
            aria-label="Search"
          >
            <Icons.searchIcon className="w-5 h-5" />
          </button>
        </form>
      <div className="flex flex-col items-center mb-8 space-y-4">
        
        
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-gray-500">Loading properties...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredProperties.length === 0 ? (
          <p className="text-gray-500">No properties found</p>
        ) : (
          filteredProperties.map((property) => (
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
                  {/* <h3 className="font-semibold-800">Details</h3> */}
                  <p className = "text-gray-600 text-sm">
                  <span >Projected Cashflow: </span> 
                  <span className="text-sm font-semibold" >${Math.round(Math.random() * 10000)}/month</span>
                  </p>

                  <p className = "text-gray-600 text-sm">
                  <span className="text-sm text-gray-600">Annual Taxes: </span>
                  <span className="font-semibold">$25,000/year</span>
                  </p>
                
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