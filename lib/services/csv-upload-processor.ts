import { NextRequest, NextResponse } from "next/server"

import { createContactsFromCSV } from "@/types/contact"
import { prisma } from "@/lib/shared/prisma"

import { CoordinateService } from "./coordinate-service"
import {
  createContactsForOwner,
  CSVRow,
  processCSVRow,
  validateCSVRow,
} from "./csv-processor"
import { OwnerDeduplicationService } from "./owner-deduplication"
import { PropertyReconciliationService } from "./property-reconciliation"

export interface UploadResult {
  success: boolean
  message: string
  processedRows: number
  errors: Array<{
    row: number
    address: string
    errors: string[]
  }>
  duplicates: Array<{
    row: number
    address: string
    message: string
  }>
  createdOwners: number
  createdProperties: number
  createdContacts: number
  geocodedProperties: number
  geocodingErrors: string[]
  mergedProperties: number
  mergedOwners: number
  reconciliationSummary: {
    propertiesCreated: number
    propertiesMerged: number
    ownersCreated: number
    ownersMerged: number
  }
}

export interface ProcessedData {
  owners: Array<{
    first_name: string
    last_name: string
    full_name?: string
    llc_contact?: string
    street_address?: string
    city?: string
    state?: string
    zip_code?: string
  }>
  properties: Array<{
    street_address: string
    city: string
    zip_code: number
    state?: string
    parcel_id?: string
  }>
  contacts: Array<{
    owner_id: string
    phone?: string
    email?: string
    type: string
    priority: number
  }>
}

// Smart name parsing function
function parseOwnerName(fullName: string): {
  firstName: string
  lastName: string
  fullName: string
  isLLC: boolean
  llcName?: string
} {
  const trimmedName = fullName.trim()

  // Check if it's an LLC
  if (trimmedName.toLowerCase().includes("llc")) {
    return {
      firstName: trimmedName, // Store full LLC name as firstName
      lastName: "", // Empty lastName for LLCs
      fullName: trimmedName,
      isLLC: true,
      llcName: trimmedName,
    }
  }

  // Handle various separators and formats
  const separators = ["&", "and", "AND", "And"]
  let parts: string[] = []

  // Try to split by common separators
  for (const separator of separators) {
    if (trimmedName.includes(separator)) {
      parts = trimmedName
        .split(separator)
        .map((part) => part.trim())
        .filter((part) => part)
      break
    }
  }

  // If no separator found, try to split by spaces and look for patterns
  if (parts.length === 0) {
    const words = trimmedName.split(" ").filter((word) => word)

    // Handle single names
    if (words.length === 1) {
      return {
        firstName: words[0],
        lastName: "",
        fullName: trimmedName,
        isLLC: false,
      }
    }

    // Handle two-word names (likely first + last)
    if (words.length === 2) {
      return {
        firstName: words[0],
        lastName: words[1],
        fullName: trimmedName,
        isLLC: false,
      }
    }

    // For longer names, try to identify patterns
    // Look for initials (single letters)
    const initials = words.filter((word) => word.length === 1)
    const fullWords = words.filter((word) => word.length > 1)

    if (initials.length > 0 && fullWords.length > 0) {
      // Pattern like "A Ashenbrenner & M Suzanna"
      const firstName = initials[0] + " " + fullWords[0]
      const lastName = fullWords.slice(1).join(" ")
      return {
        firstName,
        lastName,
        fullName: trimmedName,
        isLLC: false,
      }
    }

    // Default: first word as first name, rest as last name
    return {
      firstName: words[0],
      lastName: words.slice(1).join(" "),
      fullName: trimmedName,
      isLLC: false,
    }
  }

  // Handle multiple parts (multiple people)
  if (parts.length === 2) {
    // Two people: "Aaron & Abby Cave"
    const person1 = parts[0].split(" ").filter((word) => word)
    const person2 = parts[1].split(" ").filter((word) => word)

    // Combine the names intelligently
    let firstName = ""
    let lastName = ""

    if (person1.length === 1 && person2.length === 1) {
      // "Aaron & Abby" - both first names
      firstName = person1[0] + " & " + person2[0]
      lastName = ""
    } else if (person1.length === 1 && person2.length === 2) {
      // "Aaron & Abby Cave" - first person has first name, second has first + last
      firstName = person1[0] + " & " + person2[0]
      lastName = person2[1]
    } else if (person1.length === 2 && person2.length === 1) {
      // "Aaron Cave & Abby" - first person has first + last, second has first name
      firstName = person1[0] + " & " + person2[0]
      lastName = person1[1]
    } else if (person1.length === 2 && person2.length === 2) {
      // "Aaron Cave & Abby Smith" - both have first + last
      firstName = person1[0] + " & " + person2[0]
      lastName = person1[1] + " & " + person2[1]
    } else {
      // Complex case, just combine
      firstName = parts[0]
      lastName = parts[1]
    }

    return {
      firstName,
      lastName,
      fullName: trimmedName,
      isLLC: false,
    }
  }

  // More than 2 parts - complex case
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" & "),
    fullName: trimmedName,
    isLLC: false,
  }
}

export async function processCSVUpload(
  file: File,
  columnMapping: Record<string, string | null> = {}
): Promise<UploadResult> {
  try {
    // Read the file content
    const text = await file.text()
    const lines = text.split("\n")

    // Parse CSV headers (assuming first line is headers)
    const headers =
      lines[0]?.split(",").map((h) => h.trim().replace(/"/g, "")) || []
    const dataLines = lines.slice(1).filter((line) => line.trim())

    const result: UploadResult = {
      success: true,
      message: "CSV processed successfully",
      processedRows: 0,
      errors: [],
      duplicates: [],
      createdOwners: 0,
      createdProperties: 0,
      createdContacts: 0,
      geocodedProperties: 0,
      geocodingErrors: [],
      mergedProperties: 0,
      mergedOwners: 0,
      reconciliationSummary: {
        propertiesCreated: 0,
        propertiesMerged: 0,
        ownersCreated: 0,
        ownersMerged: 0,
      },
    }

    // Initialize services
    const coordinateService = new CoordinateService()
    const propertyReconciliationService = new PropertyReconciliationService()
    const ownerDeduplicationService = new OwnerDeduplicationService()

    // Track addresses to detect duplicates
    const processedAddresses = new Set<string>()
    const validRows: Array<{ row: number; values: string[]; address: string }> =
      []

    // Helper function to get mapped value
    const getMappedValue = (
      csvRow: string[],
      header: string,
      targetField: string
    ): string => {
      const mappedHeader = Object.keys(columnMapping).find(
        (h) => columnMapping[h] === targetField
      )
      if (mappedHeader) {
        const headerIndex = headers.indexOf(mappedHeader)
        return headerIndex >= 0 ? csvRow[headerIndex] || "" : ""
      }
      // Fallback to direct field name if no mapping
      const headerIndex = headers.indexOf(targetField)
      return headerIndex >= 0 ? csvRow[headerIndex] || "" : ""
    }

    // First pass: validate all rows and collect valid ones
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i]
      const values = parseCSVLine(line)

      // Get the address for error reporting using mapping
      const address =
        getMappedValue(values, "", "street_address") || "Unknown Address"
      const normalizedAddress = address.toLowerCase().trim()

      // Check for duplicates
      if (processedAddresses.has(normalizedAddress)) {
        result.duplicates.push({
          row: i + 2,
          address: `"${address}"`,
          message:
            "Duplicate address - only first occurrence will be processed",
        })
        continue
      }
      processedAddresses.add(normalizedAddress)

      // Validate row using new database field mapping
      const validation = validateCSVRowWithDatabaseMapping(
        values,
        headers,
        columnMapping
      )
      if (!validation.isValid) {
        result.errors.push({
          row: i + 2,
          address: `"${address}"`,
          errors: validation.errors,
        })
        continue
      }

      // Add to valid rows for processing
      validRows.push({ row: i + 2, values, address })
    }

    // Second pass: process valid rows and save to database
    for (const { row, values, address } of validRows) {
      try {
        // Process the row to get owner and property data using new database mapping
        const { owner, property, contacts } = processCSVRowWithDatabaseMapping(
          values,
          headers,
          columnMapping
        )

        // Handle unknown zip and city values
        if (property.zip_code === 0) {
          property.zip_code = -1 // Use -1 to represent "unknown" in database
        }
        if (!property.city || property.city.trim() === "") {
          property.city = "unknown"
        }

        // Parse the owner name intelligently
        const parsedName = parseOwnerName(owner.full_name || "")

        // Process owner with deduplication
        const ownerData = {
          first_name: parsedName.firstName,
          last_name: parsedName.lastName,
          full_name: parsedName.fullName,
          llc_contact: owner.llc_contact,
          street_address: owner.street_address,
          city: owner.city,
          state: owner.state,
          zip_code: owner.zip_code,
          phone: contacts.find((c) => c.phone)?.phone,
          email: contacts.find((c) => c.email)?.email,
        }

        const ownerResult =
          await ownerDeduplicationService.processOwner(ownerData)

        // Process property with reconciliation
        const propertyData = {
          street_address: property.street_address,
          city: property.city,
          zip_code: property.zip_code,
          state: property.state,
          parcel_id: property.parcel_id,
          net_operating_income: 0, // Default values for now
          price: 0,
          return_on_investment: 0,
          number_of_units: 0,
          square_feet: 0,
        }

        const propertyResult =
          await propertyReconciliationService.processProperty(
            propertyData,
            ownerResult.owner.id
          )

        // Update counters based on actions
        if (ownerResult.action === "created") {
          result.createdOwners++
          result.reconciliationSummary.ownersCreated++
        } else if (ownerResult.action === "merged") {
          result.mergedOwners++
          result.reconciliationSummary.ownersMerged++
        }

        if (propertyResult.action === "created") {
          result.createdProperties++
          result.reconciliationSummary.propertiesCreated++
        } else if (propertyResult.action === "merged") {
          result.mergedProperties++
          result.reconciliationSummary.propertiesMerged++
        }

        // Geocode the property
        try {
          const coordinates = await coordinateService.getOrCreateCoordinates(
            propertyResult.property.id,
            property.street_address,
            property.city,
            property.state || "",
            property.zip_code.toString()
          )

          if (coordinates) {
            result.geocodedProperties++
          } else {
            result.geocodingErrors.push(
              `Failed to geocode: ${property.street_address}, ${property.city}`
            )
          }
        } catch (geocodingError) {
          result.geocodingErrors.push(
            `Geocoding error for ${property.street_address}: ${geocodingError}`
          )
        }

        result.processedRows++
      } catch (error) {
        console.error(`Error processing row ${row} (${address}):`, error)
        result.errors.push({
          row,
          address: `"${address}"`,
          errors: [
            error instanceof Error ? error.message : "Database error occurred",
          ],
        })
      }
    }

    return result
  } catch (error) {
    console.error("Error processing CSV upload:", error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
      processedRows: 0,
      errors: [],
      duplicates: [],
      createdOwners: 0,
      createdProperties: 0,
      createdContacts: 0,
      geocodedProperties: 0,
      geocodingErrors: [],
      mergedProperties: 0,
      mergedOwners: 0,
      reconciliationSummary: {
        propertiesCreated: 0,
        propertiesMerged: 0,
        ownersCreated: 0,
        ownersMerged: 0,
      },
    }
  }
}

// Helper function to parse CSV line (handles quoted fields)
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

// Future method to actually save data to database
export async function saveProcessedData(
  data: ProcessedData
): Promise<UploadResult> {
  // This will be implemented next
  // For now, just return a dummy result
  return {
    success: true,
    message: "Data would be saved to database (dummy method)",
    processedRows: data.owners.length,
    errors: [],
    duplicates: [],
    createdOwners: data.owners.length,
    createdProperties: data.properties.length,
    createdContacts: data.contacts.length,
    geocodedProperties: 0,
    geocodingErrors: [],
    mergedProperties: 0,
    mergedOwners: 0,
    reconciliationSummary: {
      propertiesCreated: 0,
      propertiesMerged: 0,
      ownersCreated: 0,
      ownersMerged: 0,
    },
  }
}

/**
 * Extracts the header row (column names) from a CSV file.
 */
export async function extractCSVHeaders(file: File): Promise<string[]> {
  const text = await file.text()
  const [headerLine] = text.split("\n")
  return parseCSVLine(headerLine)
}

/**
 * Suggests a mapping from CSV headers to database fields by name similarity.
 */
export function suggestColumnMapping(
  csvHeaders: string[],
  dbFields: string[]
): Record<string, string | null> {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")

  // Define common field mappings for CSV columns
  const fieldMappings: Record<string, string[]> = {
    street_address: [
      "address",
      "street",
      "streetaddress",
      "propertyaddress",
      "location",
    ],
    city: ["city", "town", "municipality"],
    zip_code: ["zip", "zipcode", "postal", "postalcode", "zip_code"],
    state: ["state", "province", "region"],
    parcel_id: [
      "parcel",
      "parcelid",
      "parcel_id",
      "propertyid",
      "property_id",
      "apn",
    ],
    first_name: ["firstname", "first", "fname"],
    last_name: ["lastname", "last", "lname"],
    full_name: [
      "name",
      "fullname",
      "ownername",
      "owner",
      "contactname",
      "contact",
    ],
    llc_contact: ["llc", "llccontact", "company", "business"],
    owner_street_address: ["owneraddress", "owner_address", "ownerstreet"],
    owner_city: ["ownercity", "owner_city"],
    owner_state: ["ownerstate", "owner_state"],
    owner_zip_code: ["ownerzip", "owner_zip", "ownerzipcode"],
    phone: ["phone", "wireless", "landline", "mobile", "cell", "telephone"],
    email: ["email", "e-mail", "mail"],
    phone_type: ["phonetype", "phone_type", "type"],
    contact_priority: ["priority", "contactpriority", "order"],
  }

  const mapping: Record<string, string | null> = {}

  for (const header of csvHeaders) {
    const normalizedHeader = normalize(header)
    let bestMatch: string | null = null
    let bestScore = 0

    // First, try exact matches
    const exactMatch = dbFields.find(
      (field) => normalize(field) === normalizedHeader
    )
    if (exactMatch) {
      bestMatch = exactMatch
      bestScore = 1
    }

    // Then try pattern-based matching
    for (const [dbField, patterns] of Object.entries(fieldMappings)) {
      for (const pattern of patterns) {
        const normalizedPattern = normalize(pattern)

        // Check if header contains the pattern
        if (
          normalizedHeader.includes(normalizedPattern) ||
          normalizedPattern.includes(normalizedHeader)
        ) {
          // Calculate a score based on how well it matches
          let score = 0

          // Exact pattern match gets highest score
          if (normalizedHeader === normalizedPattern) {
            score = 0.9
          }
          // Header starts with pattern
          else if (normalizedHeader.startsWith(normalizedPattern)) {
            score = 0.8
          }
          // Header ends with pattern
          else if (normalizedHeader.endsWith(normalizedPattern)) {
            score = 0.7
          }
          // Header contains pattern
          else if (normalizedHeader.includes(normalizedPattern)) {
            score = 0.6
          }

          // Bonus for common variations
          if (
            normalizedHeader.includes("wireless") ||
            normalizedHeader.includes("landline")
          ) {
            score += 0.1
          }
          if (
            normalizedHeader.includes("email") ||
            normalizedHeader.includes("mail")
          ) {
            score += 0.1
          }

          if (score > bestScore) {
            bestMatch = dbField
            bestScore = score
          }
        }
      }
    }

    // Special handling for numbered fields (e.g., "Wireless 1", "Email 2")
    if (!bestMatch || bestScore < 0.5) {
      const numberMatch = normalizedHeader.match(/^(.+?)\s*\d+$/)
      if (numberMatch) {
        const baseField = numberMatch[1]

        // Map common numbered field patterns
        if (
          baseField.includes("wireless") ||
          baseField.includes("landline") ||
          baseField.includes("phone")
        ) {
          bestMatch = "phone"
          bestScore = 0.8
        } else if (baseField.includes("email") || baseField.includes("mail")) {
          bestMatch = "email"
          bestScore = 0.8
        }
      }
    }

    // Only use the match if it has a reasonable score
    mapping[header] = bestScore >= 0.5 ? bestMatch : null
  }

  return mapping
}

// New function to process CSV data directly using database field mappings
function processCSVRowWithDatabaseMapping(
  values: string[],
  headers: string[],
  columnMapping: Record<string, string | null>
): {
  owner: {
    first_name: string
    last_name: string
    full_name?: string
    llc_contact?: string
    street_address?: string
    city?: string
    state?: string
    zip_code?: string
  }
  property: {
    street_address: string
    city: string
    zip_code: number
    state?: string
    parcel_id?: string
  }
  contacts: Array<{
    phone?: string
    email?: string
    type: string
    priority: number
  }>
} {
  // Helper function to get mapped value
  const getMappedValue = (targetField: string): string => {
    const mappedHeader = Object.keys(columnMapping).find(
      (h) => columnMapping[h] === targetField
    )
    if (mappedHeader) {
      const headerIndex = headers.indexOf(mappedHeader)
      return headerIndex >= 0 ? values[headerIndex] || "" : ""
    }
    return ""
  }

  // Get property data
  const streetAddress = getMappedValue("street_address")
  const city = getMappedValue("city") || "unknown"
  const zipStr = getMappedValue("zip_code") || "0"
  const zipCode = parseInt(zipStr, 10) || 0
  const state = getMappedValue("state")
  const parcelId = getMappedValue("parcel_id")

  // Get owner data
  const fullName = getMappedValue("full_name")
  const firstName = getMappedValue("first_name")
  const lastName = getMappedValue("last_name")
  const llcContact = getMappedValue("llc_contact")
  const ownerStreetAddress = getMappedValue("owner_street_address")
  const ownerCity = getMappedValue("owner_city")
  const ownerState = getMappedValue("owner_state")
  const ownerZipCode = getMappedValue("owner_zip_code")

  // Parse owner name if only full_name is provided
  let finalFirstName = firstName
  let finalLastName = lastName
  if (!firstName && !lastName && fullName) {
    const parsedName = parseOwnerName(fullName)
    finalFirstName = parsedName.firstName
    finalLastName = parsedName.lastName
  }

  // Get contact data
  const phone = getMappedValue("phone")
  const email = getMappedValue("email")
  const phoneType = getMappedValue("phone_type") || "Cell"
  const contactPriority =
    parseInt(getMappedValue("contact_priority") || "1", 10) || 1

  const property = {
    street_address: streetAddress,
    city: city,
    zip_code: zipCode,
    state: state || undefined,
    parcel_id: parcelId || undefined,
  }

  const owner = {
    first_name: finalFirstName,
    last_name: finalLastName,
    full_name: fullName || undefined,
    llc_contact: llcContact || undefined,
    street_address: ownerStreetAddress || undefined,
    city: ownerCity || undefined,
    state: ownerState || undefined,
    zip_code: ownerZipCode || undefined,
  }

  const contacts = []
  if (phone) {
    contacts.push({
      phone,
      email: undefined,
      type: phoneType,
      priority: contactPriority,
    })
  }
  if (email) {
    contacts.push({
      phone: undefined,
      email,
      type: "Email",
      priority: contactPriority + 1,
    })
  }

  return { owner, property, contacts }
}

// New validation function for database field mappings
function validateCSVRowWithDatabaseMapping(
  values: string[],
  headers: string[],
  columnMapping: Record<string, string | null>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Helper function to get mapped value
  const getMappedValue = (targetField: string): string => {
    const mappedHeader = Object.keys(columnMapping).find(
      (h) => columnMapping[h] === targetField
    )
    if (mappedHeader) {
      const headerIndex = headers.indexOf(mappedHeader)
      return headerIndex >= 0 ? values[headerIndex] || "" : ""
    }
    return ""
  }

  // Required fields
  const streetAddress = getMappedValue("street_address")
  const fullName = getMappedValue("full_name")
  const firstName = getMappedValue("first_name")
  const lastName = getMappedValue("last_name")

  if (!streetAddress?.trim()) {
    errors.push("Property street address is required")
  }

  if (!fullName?.trim() && (!firstName?.trim() || !lastName?.trim())) {
    errors.push(
      "Owner name is required (either full_name or first_name + last_name)"
    )
  }

  // Validate zip code format if provided
  const zipCode = getMappedValue("zip_code")
  if (zipCode && zipCode.trim() && !/^\d{5}(-\d{4})?$/.test(zipCode)) {
    errors.push("Zip code must be in valid format (e.g., 12345 or 12345-6789)")
  }

  // Validate email format if provided
  const email = getMappedValue("email")
  if (email && !isValidEmail(email)) {
    errors.push("Email is not in valid format")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
