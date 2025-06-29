import { useEffect, useState } from 'react'
import { Property } from '@/types/property'
import Link from 'next/link'
import { User } from 'lucide-react'

export default function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties')
        if (!response.ok) {
          throw new Error('Failed to fetch properties')
        }
        const data = await response.json()
        setProperties(data.properties || data) // Handle both paginated and non-paginated responses
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch properties')
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  if (loading) return <div>Loading properties...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {properties.map((property) => (
          <Link
            key={property.id}
            href={`/properties/${property.id}`}
            className="block p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{property.street_address}</h3>
                <p className="text-gray-600">{property.city}, {property.zip_code}</p>
                {property.price > 0 && (
                  <p className="text-gray-600 mt-1">${property.price.toLocaleString()}</p>
                )}
              </div>
              
              {/* Owner Information */}
              <div className="text-right">
                {property.owners && property.owners.length > 0 ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>
                      {property.owners.length === 1 
                        ? `${property.owners[0].firstName} ${property.owners[0].lastName}`
                        : `${property.owners.length} owners`
                      }
                    </span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">No owners</div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 