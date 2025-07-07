"use client"

// import { PropertyEditModal } from './PropertyEditModal'
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Building2, MapPin, Square, TrendingUp, User } from "lucide-react"

import type { Property } from "@/types/property"
import { Button } from "@/components/ui/button"

interface PropertyDetailsProps {
  property: Property
}

export function PropertyDetails({
  property: initialProperty,
}: PropertyDetailsProps) {
  const [property, setProperty] = useState(initialProperty)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat("en-US").format(number)
  }

  const monthlyEstimate = Math.round((property.price * 0.06771) / 12) // Based on your image showing Est. $6,771/mo

  const handlePropertyUpdated = (updatedProperty: Property) => {
    setProperty(updatedProperty)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left side - Main details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Image Gallery */}
        {/* {property.images && property.images.length > 0 && (
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
              {property.images.map((image, index) => (
                <div 
                  key={image.id} 
                  className={`relative ${index === 0 ? 'md:col-span-2' : ''} aspect-4/3`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || `Property image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* Status and pricing */}
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-600">FOR SALE</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {formatCurrency(property.price)}
              </span>
              <span className="text-muted-foreground">
                Est. {formatCurrency(monthlyEstimate)}/mo
              </span>
              <Button variant="link" className="p-0 h-auto text-blue-600">
                Get pre-qualified
              </Button>
            </div>

            <div className="flex items-center gap-6 text-lg">
              <div className="flex items-center gap-1">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">
                  {property.number_of_units}
                </span>
                <span className="text-muted-foreground">units</span>
              </div>
              <div className="flex items-center gap-1">
                <Square className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">
                  {formatNumber(property.square_feet)}
                </span>
                <span className="text-muted-foreground">sq ft</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-lg">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>
                {property.street_address}, {property.city}, {property.zip_code}
              </span>
            </div>
          </div>
        </div>

        {/* Investment Details */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Investment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">
                  Net Operating Income
                </dt>
                <dd className="text-lg font-semibold">
                  {formatCurrency(property.net_operating_income)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  Return on Investment
                </dt>
                <dd className="text-lg font-semibold flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  {property.return_on_investment}%
                </dd>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">
                  Price per Unit
                </dt>
                <dd className="text-lg font-semibold">
                  {formatCurrency(
                    Math.round(property.price / property.number_of_units)
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  Price per Sq Ft
                </dt>
                <dd className="text-lg font-semibold">
                  {formatCurrency(
                    Math.round(property.price / property.square_feet)
                  )}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Property Owner */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Owners</h2>
          <div className="space-y-4">
            {property.owners && property.owners.length > 0 ? (
              property.owners.map((owner) => (
                <div key={owner.id} className="space-y-2">
                  <h3 className="font-semibold">
                    {owner.first_name} {owner.last_name}
                  </h3>
                  {owner.phone_number && (
                    <p className="text-sm text-muted-foreground">
                      {owner.phone_number}
                    </p>
                  )}
                  {owner.street_address && (
                    <div className="text-sm text-muted-foreground">
                      <p>
                        {owner.street_address}, {owner.city}, {owner.state}{" "}
                        {owner.zip_code}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-center py-4">
                No owners found
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 pt-6 border-t space-y-3">
          <h3 className="font-semibold">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Listed</span>
              <span>{new Date(property.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Property Type</span>
              <span>Multifamily</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Building Units</span>
              <span>{property.number_of_units}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Action buttons */}
      <div className="space-y-4">
        <div className="bg-card p-6 rounded-lg border sticky top-6">
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Tour for free, no strings attached
          </p>
          <Button className="w-full mb-3 bg-green-600 hover:bg-green-700">
            Request showing
          </Button>

          <Button variant="outline" className="w-full mb-6">
            Start your offer
          </Button>

          {/* Edit Property Button */}
          <div className="mb-6">
            {/* <PropertyEditModal 
              property={property} 
              onPropertyUpdated={handlePropertyUpdated}
            /> */}
            <Button variant="outline" className="w-full">
              Edit Property (Coming Soon)
            </Button>
          </div>

          {/* <p className="text-xs text-muted-foreground text-center">
            A local agent will help you prepare and negotiate.
          </p> */}

          {/* Quick Stats */}
          <div className="mt-6 pt-6 border-t space-y-3">
            <h3 className="font-semibold">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Listed</span>
                <span>
                  {new Date(property.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property Type</span>
                <span>Multifamily</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Building Units</span>
                <span>{property.number_of_units}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
