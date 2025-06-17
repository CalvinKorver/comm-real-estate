import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PropertyPageProps {
  params: {
    id: string
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const owner = await prisma.owner.findUnique({
    where: { id: params.id }
  })

  if (!owner) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {owner.firstName} {owner.lastName}
          </h1>

          <p className="text-blue-500 py-2">
            <a href="" type="phone">{owner.phoneNumber}</a>
          </p>
          <p className="text-muted-foreground">
            {owner.streetAddress}, {owner.city} {owner.zipCode}
          </p>


          <p className='py-4'>
            Total Properties: 4
          </p>
          <p className="font-semibold py-4">
          
          </p>



        </div>

        <Link
            href="/properties">
            <Button>
                See Properties
            </Button>
        </Link>
      </div>
    </div>
  )
}