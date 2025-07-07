import type { Property } from "@/generated/prisma"

import { prisma } from "@/lib/shared/prisma"

export interface PropertyData {
  street_address: string
  city: string
  zip_code: number
  state?: string
  parcel_id?: string
  net_operating_income?: number
  price?: number
  return_on_investment?: number
  number_of_units?: number
  square_feet?: number
}

export interface PropertyMatch {
  property: Property
  confidence: number
  matchReason: string
}

export class PropertyReconciliationService {
  /**
   * Normalize address for comparison by removing common variations
   */
  normalizeAddress(address: string): string {
    return address
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\./g, "") // Remove periods
      .replace(/,/g, "") // Remove commas
      .replace(/street|st\.?/gi, "st") // Normalize street abbreviations
      .replace(/avenue|ave\.?/gi, "ave")
      .replace(/road|rd\.?/gi, "rd")
      .replace(/drive|dr\.?/gi, "dr")
      .replace(/lane|ln\.?/gi, "ln")
      .replace(/boulevard|blvd\.?/gi, "blvd")
      .replace(/court|ct\.?/gi, "ct")
      .replace(/place|pl\.?/gi, "pl")
      .replace(/circle|cir\.?/gi, "cir")
      .replace(/way/gi, "way")
      .replace(/terrace|ter\.?/gi, "ter")
  }

  /**
   * Calculate similarity between two addresses (0-1 scale)
   */
  calculateAddressSimilarity(addr1: string, addr2: string): number {
    const normalized1 = this.normalizeAddress(addr1)
    const normalized2 = this.normalizeAddress(addr2)

    if (normalized1 === normalized2) return 1.0

    // Split into words and compare
    const words1 = normalized1.split(" ")
    const words2 = normalized2.split(" ")

    const commonWords = words1.filter((word) => words2.includes(word))
    const totalWords = Math.max(words1.length, words2.length)

    if (totalWords === 0) return 0

    const wordSimilarity = commonWords.length / totalWords

    // Also check for number similarity (house numbers)
    const number1 = words1.find((word) => /^\d+$/.test(word))
    const number2 = words2.find((word) => /^\d+$/.test(word))

    if (number1 && number2) {
      const numSimilarity = number1 === number2 ? 1 : 0.5
      return (wordSimilarity + numSimilarity) / 2
    }

    return wordSimilarity
  }

  /**
   * Find matching properties by address with fuzzy matching
   */
  async findMatchingProperty(
    address: string,
    city: string,
    zip: number,
    state?: string
  ): Promise<PropertyMatch | null> {
    // First try exact match
    const exactMatch = await prisma.property.findFirst({
      where: {
        street_address: address,
        city: city,
        zip_code: zip,
        ...(state && { state: state }),
      },
    })

    if (exactMatch) {
      return {
        property: exactMatch,
        confidence: 1.0,
        matchReason: "Exact address match",
      }
    }

    // Try fuzzy matching within the same city/zip
    const candidates = await prisma.property.findMany({
      where: {
        city: city,
        zip_code: zip,
        ...(state && { state: state }),
      },
    })

    let bestMatch: PropertyMatch | null = null
    let bestConfidence = 0.7 // Minimum confidence threshold

    for (const candidate of candidates) {
      const similarity = this.calculateAddressSimilarity(
        address,
        candidate.street_address
      )

      if (similarity > bestConfidence) {
        bestConfidence = similarity
        bestMatch = {
          property: candidate,
          confidence: similarity,
          matchReason: `Fuzzy address match (${Math.round(similarity * 100)}% similarity)`,
        }
      }
    }

    return bestMatch
  }

  /**
   * Merge property data (additive updates)
   */
  async mergePropertyData(
    existing: Property,
    newData: PropertyData
  ): Promise<Property> {
    const updateData: Partial<Property> = {}

    // Only update fields that have meaningful new data
    if (newData.parcel_id && !existing.parcel_id) {
      updateData.parcel_id = newData.parcel_id
    }

    if (newData.net_operating_income && newData.net_operating_income > 0) {
      updateData.net_operating_income = newData.net_operating_income
    }

    if (newData.price && newData.price > 0) {
      updateData.price = newData.price
    }

    if (newData.return_on_investment && newData.return_on_investment > 0) {
      updateData.return_on_investment = newData.return_on_investment
    }

    if (newData.number_of_units && newData.number_of_units > 0) {
      updateData.number_of_units = newData.number_of_units
    }

    if (newData.square_feet && newData.square_feet > 0) {
      updateData.square_feet = newData.square_feet
    }

    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      return await prisma.property.update({
        where: { id: existing.id },
        data: updateData,
      })
    }

    return existing
  }

  /**
   * Create a new property if no match is found
   */
  async createNewProperty(
    propertyData: PropertyData,
    ownerId: string
  ): Promise<Property> {
    return await prisma.property.create({
      data: {
        street_address: propertyData.street_address,
        city: propertyData.city,
        zip_code: propertyData.zip_code,
        state: propertyData.state,
        parcel_id: propertyData.parcel_id,
        net_operating_income: propertyData.net_operating_income || 0,
        price: propertyData.price || 0,
        return_on_investment: propertyData.return_on_investment || 0,
        number_of_units: propertyData.number_of_units || 0,
        square_feet: propertyData.square_feet || 0,
        owners: {
          connect: { id: ownerId },
        },
      },
    })
  }

  /**
   * Process a property with full reconciliation logic
   */
  async processProperty(
    propertyData: PropertyData,
    ownerId: string
  ): Promise<{
    property: Property
    action: "created" | "merged" | "updated"
    match?: PropertyMatch
  }> {
    // Try to find a matching property
    const match = await this.findMatchingProperty(
      propertyData.street_address,
      propertyData.city,
      propertyData.zip_code,
      propertyData.state
    )

    if (match) {
      if (match.confidence >= 0.95) {
        // High confidence match - merge the data
        const mergedProperty = await this.mergePropertyData(
          match.property,
          propertyData
        )

        // Link the new owner to the existing property
        await prisma.property.update({
          where: { id: mergedProperty.id },
          data: {
            owners: {
              connect: { id: ownerId },
            },
          },
        })

        return {
          property: mergedProperty,
          action: "merged",
          match,
        }
      } else {
        // Lower confidence match - create new property to be safe
        const newProperty = await this.createNewProperty(propertyData, ownerId)
        return {
          property: newProperty,
          action: "created",
        }
      }
    } else {
      // No match found - create new property
      const newProperty = await this.createNewProperty(propertyData, ownerId)
      return {
        property: newProperty,
        action: "created",
      }
    }
  }
}
