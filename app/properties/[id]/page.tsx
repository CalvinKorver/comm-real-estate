import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">{property.street_address}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Property Details</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-gray-600">Location</dt>
                <dd className="font-medium">{property.city}, {property.zip_code}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Price</dt>
                <dd className="font-medium">${property.price.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Net Operating Income</dt>
                <dd className="font-medium">${property.net_operating_income.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Return on Investment</dt>
                <dd className="font-medium">{property.return_on_investment}%</dd>
              </div>
              <div>
                <dt className="text-gray-600">Units</dt>
                <dd className="font-medium">{property.number_of_units}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Square Feet</dt>
                <dd className="font-medium">{property.square_feet.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Owner</dt>
                <dd className="font-medium">{property.owner}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
} 