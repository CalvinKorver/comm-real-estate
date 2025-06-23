import { useEffect, useState } from 'react'
import { Property } from '@/types/property'
    import Link from 'next/link'

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
        setProperties(data)
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
            <h3 className="text-lg font-semibold">{property.street_address}</h3>
            <p className="text-gray-600">{property.city}, {property.zip_code}</p>
            {/* <p className="text-gray-600 mt-2">${property.price.toLocaleString()}</p> */}
          </Link>
        ))}
      </div>
    </div>
  )
} 