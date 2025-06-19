import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PropertyImageGrid } from '@/components/PropertyImageGrid'
import { PropertyDetails } from '@/components/PropertyDetails'

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: true,
      owners: true
    }
  })

  if (!property) {
    notFound()
  }

  // Use the actual property images if they exist, otherwise use the default images
  const propertyImages = property.images?.map(img => img.url) || []

  // Map property to match PropertyDetails prop type
  const propertyForDetails = {
    ...property,
    owner: property.owners?.[0]?.id || '', // fallback for required 'owner' field
    owners: (property.owners || []).map(owner => ({
      ...owner,
      streetAddress: owner.streetAddress || '',
      city: owner.city || '',
      zipCode: owner.zipCode || '',
    })),
    images: property.images || [],
  }

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
        <PropertyImageGrid images={propertyImages} />

        {/* Property Details */}
        <PropertyDetails property={propertyForDetails} />
      </div>
    </div>
  )
}