// types/property.ts

export interface Property {
  id: string
  street_address: string
  city: string
  zip_code: number
  net_operating_income: number
  price: number
  return_on_investment: number
  owner: string
  number_of_units: number
  square_feet: number
  createdAt: Date
  updatedAt: Date
  owners?: Owner[]
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
  phoneNumber: string
}