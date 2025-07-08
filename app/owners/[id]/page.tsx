import { notFound } from 'next/navigation'
import { getOwnerWithProperties } from '@/lib/client/properties'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BaseHeader } from '@/components/base-header';
import { formatPhoneNumber } from '@/types/contact';

export default async function OwnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Get base URL for server-side fetch
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (typeof window === 'undefined') {
    // Try to get from headers if available (Next.js 13+)
    // @ts-ignore
    const headersList = typeof headers !== 'undefined' ? headers() : null;
    if (headersList) {
      const host = headersList.get('host');
      const proto = headersList.get('x-forwarded-proto') || 'http';
      if (host) baseUrl = `${proto}://${host}`;
    }
  }
  const ownerWithProperties = await getOwnerWithProperties(id, baseUrl)

  if (!ownerWithProperties) {
    notFound()
  }

  const { firstName, lastName, phoneNumber, streetAddress, city, zipCode, properties } = ownerWithProperties

  return (
    <>
      <BaseHeader />
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {firstName} {lastName}
            </h1>
            <p className="text-blue-500 py-2">
              <a href={`tel:${phoneNumber}`}>{formatPhoneNumber(phoneNumber)}</a>
            </p>
            <p className="text-muted-foreground">
              {streetAddress}, {city} {zipCode}
            </p>
            <p className='py-4'>
              Total Properties: {properties?.length || 0}
            </p>
          </div>
          {/* Properties List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">Properties</h2>
            <div className="grid gap-4">
              {properties && properties.length > 0 ? (
                properties.map((property: any) => (
                  <Link
                    key={property.id}
                    href={`/properties/${property.id}`}
                    className="block p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card"
                  >
                    <h3 className="text-lg font-semibold text-card-foreground">{property.street_address}</h3>
                    <p className="text-muted-foreground">{property.city}, {property.zip_code}</p>
                    <p className="text-muted-foreground mt-2">${property.price.toLocaleString()}</p>
                  </Link>
                ))
              ) : (
                <div className="text-muted-foreground">No properties found for this owner.</div>
              )}
            </div>
          </div>
          <div className="mt-8">
            <Link href="/properties">
              <Button>
                See All Properties
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}