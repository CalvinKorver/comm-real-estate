import { Property } from '@/types/property'

// Type for creating a new property (without server-generated fields)
export type CreatePropertyInput = {
  street_address: string
  city: string
  zip_code: number
  net_operating_income: number
  price: number
  return_on_investment: number
  owner: string
  number_of_units: number
  square_feet: number
}

export async function getProperties(): Promise<Property[]> {
  try {
    console.log("Client: Fetching properties")
    const response = await fetch('/api/properties', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Client: Failed to fetch properties:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`Failed to fetch properties: ${response.status} ${response.statusText}`)
    }
    
    const properties = await response.json()
    console.log("Client: Successfully fetched properties:", properties.length)
    return properties
  } catch (error) {
    console.error('Client: Error fetching properties:', error)
    throw error
  }
}

export async function createProperty(data: CreatePropertyInput): Promise<Property> {
  try {
    console.log("Client: Creating property")
    const response = await fetch('/api/properties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Client: Failed to create property:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`Failed to create property: ${response.status} ${response.statusText}`)
    }
    
    const property = await response.json()
    console.log("Client: Successfully created property:", property)
    return property
  } catch (error) {
    console.error('Client: Error creating property:', error)
    throw error
  }
}

export async function deleteProperty(id: string): Promise<boolean> {
  try {
    console.log("Client: Deleting property", id)
    const response = await fetch(`/api/properties/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Client: Failed to delete property:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`Failed to delete property: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log("Client: Successfully deleted property:", result)
    return result.success
  } catch (error) {
    console.error('Client: Error deleting property:', error)
    throw error
  }
} 