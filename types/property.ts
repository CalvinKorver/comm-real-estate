// types/property.ts

export interface Property {
  id: string
  street_address: string
  city: string
  zip_code: number
  state?: string | null
  parcel_id?: string | null
  net_operating_income: number
  price: number
  return_on_investment: number
  number_of_units: number
  square_feet: number
  created_at: Date
  updated_at: Date
  owners?: Owner[]
  coordinates?: {
    id: string
    latitude: number
    longitude: number
    confidence: string
    place_id?: string
  }
  notes?: Note[]
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
  first_name: string
  last_name: string
  full_name?: string | null
  llc_contact?: string | null
  street_address?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  phone_number?: string | null
  created_at: Date
  updated_at: Date
  contacts?: Contact[]
}

export interface Contact {
  id: string
  phone?: string
  email?: string
  type: string
  priority: number
  notes?: string
  owner_id: string
  created_at: Date
  updated_at: Date
}

export interface Note {
  id: string
  content: string
  created_at: string | Date
  updated_at: string | Date
}