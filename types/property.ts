// types/property.ts

export interface Property {
  id: string
  street_address: string
  city: string
  zip_code: number
  state?: string
  parcel_id?: string
  net_operating_income: number
  price: number
  return_on_investment: number
  number_of_units: number
  square_feet: number
  createdAt: Date
  updatedAt: Date
  owners?: Owner[]
  coordinates?: {
    id: string
    latitude: number
    longitude: number
    confidence: string
    placeId?: string
  }
}

export interface PropertyWithImages extends Property {
  images?: string[]
}

export interface PropertyPageProps {
  params: {
    id: string
  }
}

export interface PropertyImageGridProps {
  images: string[]
}

export interface PropertyDetailsProps {
  property: Property
}

export interface Owner {
  id: string
  firstName: string
  lastName: string
  fullName?: string
  llcContact?: string
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  phoneNumber?: string
  createdAt: Date
  updatedAt: Date
  contacts?: Contact[]
}

export interface Contact {
  id: string
  phone?: string
  email?: string
  type: string
  priority: number
  ownerId: string
  createdAt: Date
  updatedAt: Date
}