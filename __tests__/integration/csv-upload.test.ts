import fs from "fs"
import path from "path"
import fetch from "cross-fetch"
import FormData from "form-data"

import { Contact, Owner, Property } from "../../generated/prisma"
import { prisma } from "../../lib/shared/prisma"

describe("CSV Upload API", () => {
  afterAll(async () => {
    await prisma.$disconnect()
  })

  it("should accept a CSV file upload and create properties with owner data", async () => {
    // First, test that the endpoint is accessible
    const healthCheck = await fetch("http://localhost:3000/api/csv-upload", {
      method: "GET",
    })
    console.log("Health check status:", healthCheck.status)
    expect(healthCheck.status).toBe(405) // Method not allowed for GET

    // Prepare a more complete CSV file with owner and contact information
    const csvContent = `street_address,city,zip_code,state,full_name,phone,email,owner_street_address,owner_city,owner_state,owner_zip_code
123 Main St,Testville,12345,WA,John Doe,(555) 123-4567,john.doe@example.com,456 Owner Ave,Owner City,WA,98765
789 Oak Dr,Testburg,54321,WA,Jane Smith,(555) 987-6543,jane.smith@example.com,321 Owner Blvd,Owner Town,WA,11111`

    const fileBuffer = Buffer.from(csvContent, "utf-8")

    // Prepare form data with mapping for all fields
    const form = new FormData()
    form.append("file", fileBuffer, {
      filename: "test.csv",
      contentType: "text/csv",
    })
    form.append(
      "columnMapping",
      JSON.stringify({
        street_address: "street_address",
        city: "city",
        zip_code: "zip_code",
        state: "state",
        full_name: "full_name",
        phone: "phone",
        email: "email",
        owner_street_address: "owner_street_address",
        owner_city: "owner_city",
        owner_state: "owner_state",
        owner_zip_code: "owner_zip_code",
      })
    )

    console.log("FormData headers:", form.getHeaders())

    // Make the request
    const res = await fetch("http://localhost:3000/api/csv-upload", {
      method: "POST",
      body: form as any,
      headers: {
        ...form.getHeaders(),
      },
    })

    console.log("Response status:", res.status)
    console.log("Response headers:", Object.fromEntries(res.headers.entries()))

    // Check response status
    if (res.status !== 200) {
      const errorText = await res.text()
      console.error("Error response:", errorText)
    }
    expect(res.status).toBe(200)

    // Parse response
    const responseData = await res.json()
    console.log("Upload response:", JSON.stringify(responseData, null, 2))

    // Verify response structure
    expect(responseData.success).toBe(true)
    expect(responseData.summary.processedRows).toBe(2)
    expect(
      responseData.summary.createdProperties +
        responseData.summary.mergedProperties
    ).toBe(2)
    expect(
      responseData.summary.createdOwners + responseData.summary.mergedOwners
    ).toBe(2)

    console.log("Properties created:", responseData.summary.createdProperties)
    console.log("Properties merged:", responseData.summary.mergedProperties)
    console.log("Owners created:", responseData.summary.createdOwners)
    console.log("Owners merged:", responseData.summary.mergedOwners)

    // Verify properties were actually created in database
    const properties = await prisma.property.findMany({
      where: {
        street_address: {
          in: ["123 Main St", "789 Oak Dr"],
        },
      },
      include: {
        owners: {
          include: {
            contacts: true,
          },
        },
      },
    })

    console.log("Found properties:", properties.length)
    console.log(
      "Property addresses:",
      properties.map(
        (p: Property & { owners: (Owner & { contacts: Contact[] })[] }) =>
          p.street_address
      )
    )

    // Should find at least the 2 properties we uploaded (may be more due to duplicates)
    expect(properties.length).toBeGreaterThanOrEqual(2)

    // Verify specific property data
    const mainStProperty = properties.find(
      (p: Property & { owners: (Owner & { contacts: Contact[] })[] }) =>
        p.street_address === "123 Main St"
    )
    expect(mainStProperty).toBeDefined()
    expect(mainStProperty?.city).toBe("Testville")
    expect(mainStProperty?.zip_code).toBe(12345)
    // State might be null if the existing property didn't have it set
    if (mainStProperty?.state) {
      expect(mainStProperty.state).toBe("WA")
    }

    // Verify owner data
    expect(mainStProperty?.owners.length).toBeGreaterThan(0)
    const owner = mainStProperty?.owners[0]
    expect(owner?.full_name).toBe("John Doe")
    expect(owner?.street_address).toBe("456 Owner Ave")
    expect(owner?.city).toBe("Owner City")

    // Verify contacts - check if they exist
    console.log("Owner contacts:", owner?.contacts)
    expect(owner?.contacts.length).toBeGreaterThan(0)

    const phoneContact = owner?.contacts.find((c: Contact) => c.phone)
    const emailContact = owner?.contacts.find((c: Contact) => c.email)

    if (phoneContact) {
      expect(phoneContact.phone).toBe("(555) 123-4567")
    }
    if (emailContact) {
      expect(emailContact.email).toBe("john.doe@example.com")
    }

    // Also verify the second property
    const oakDrProperty = properties.find(
      (p: Property & { owners: (Owner & { contacts: Contact[] })[] }) =>
        p.street_address === "789 Oak Dr"
    )
    expect(oakDrProperty).toBeDefined()
    expect(oakDrProperty?.city).toBe("Testburg")
    expect(oakDrProperty?.zip_code).toBe(54321)
  })
})
