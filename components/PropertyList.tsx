import React from "react"
import Link from "next/link"

import { Property } from "@/types/property"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface PropertyListProps {
  properties: Property[]
  isLoading?: boolean
}

const PropertyList = React.memo(function PropertyList({
  properties,
  isLoading = false,
}: PropertyListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground">
          No properties found
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your search criteria
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Card key={property.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{property.street_address}</CardTitle>
            <CardDescription>
              {property.city}, {property.zip_code}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-bold text-foreground">
                ${property.price.toLocaleString()}
              </p>
              <p className="text-muted-foreground">
                {property.city}, {property.zip_code}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-muted-foreground mt-1">
                ${property.price.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{property.number_of_units} units</span>
                {property.square_feet && (
                  <>
                    <span>•</span>
                    <span>{property.square_feet.toLocaleString()} sqft</span>
                  </>
                )}
              </div>
            </div>

            {property.owners && property.owners.length > 0 ? (
              <div className="text-sm text-muted-foreground">
                {property.owners.length} owner
                {property.owners.length !== 1 ? "s" : ""}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No owners</div>
            )}

            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/properties/${property.id}`}>View Details</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/properties/${property.id}/edit`}>Edit</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})

export default PropertyList
