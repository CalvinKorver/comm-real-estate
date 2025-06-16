import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PropertyImageGrid } from '@/components/PropertyImageGrid'
import { PropertyDetails } from '@/components/PropertyDetails'

interface PropertyPageProps {
  params: {
    id: string
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const property = await prisma.property.findUnique({
    where: { id: params.id }
  })

  if (!property) {
    notFound()
  }

  // Mock images for now - you'll want to add an images field to your Property model
  const mockImages = [
    '/api/placeholder/800/600', // Main image
    '/api/placeholder/400/300', // Kitchen
    '/api/placeholder/400/300', // Living room
    '/api/placeholder/400/300', // Bathroom
    '/api/placeholder/400/300', // Bedroom
    '/api/placeholder/400/300', // Exterior
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {property.street_address}
          </h1>
          <p className="text-muted-foreground">
            {property.city}, {property.zip_code}
          </p>
        </div>

        {/* Image Grid */}
        <PropertyImageGrid images={mockImages} />

        {/* Property Details */}
        <PropertyDetails property={property} />
      </div>
    </div>
  )
}