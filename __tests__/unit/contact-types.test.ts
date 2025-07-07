import {
  CONTACT_TYPES,
  ContactType,
  createContactsFromCSV,
} from "@/types/contact"

describe("Contact Types", () => {
  describe("CONTACT_TYPES", () => {
    it("should have all expected contact types", () => {
      expect(CONTACT_TYPES.EMAIL).toBe("Email")
      expect(CONTACT_TYPES.CELL).toBe("Cell")
      expect(CONTACT_TYPES.HOME).toBe("Home")
      expect(CONTACT_TYPES.WORK).toBe("Work")
      expect(CONTACT_TYPES.LANDLINE).toBe("Landline")
      expect(CONTACT_TYPES.FAX).toBe("Fax")
      expect(CONTACT_TYPES.BUSINESS).toBe("Business")
      expect(CONTACT_TYPES.PERSONAL).toBe("Personal")
    })
  })

  describe("createContactsFromCSV", () => {
    const ownerId = "owner-1"

    it("should create contacts from email data", () => {
      const csvData = {
        "Email 1": "john@email.com",
        "Email 2": "john.work@email.com",
      }

      const result = createContactsFromCSV(ownerId, csvData)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        email: "john@email.com",
        type: CONTACT_TYPES.EMAIL,
        priority: 1,
        ownerId,
      })
      expect(result[1]).toEqual({
        email: "john.work@email.com",
        type: CONTACT_TYPES.EMAIL,
        priority: 2,
        ownerId,
      })
    })

    it("should create contacts from wireless phone data", () => {
      const csvData = {
        "Wireless 1": "206-555-0101",
        "Wireless 2": "206-555-0202",
        "Wireless 3": "206-555-0303",
        "Wireless 4": "206-555-0404",
      }

      const result = createContactsFromCSV(ownerId, csvData)

      expect(result).toHaveLength(4)
      expect(result[0]).toEqual({
        phone: "206-555-0101",
        type: CONTACT_TYPES.CELL,
        priority: 1,
        ownerId,
      })
      expect(result[1]).toEqual({
        phone: "206-555-0202",
        type: CONTACT_TYPES.CELL,
        priority: 2,
        ownerId,
      })
      expect(result[2]).toEqual({
        phone: "206-555-0303",
        type: CONTACT_TYPES.CELL,
        priority: 3,
        ownerId,
      })
      expect(result[3]).toEqual({
        phone: "206-555-0404",
        type: CONTACT_TYPES.CELL,
        priority: 4,
        ownerId,
      })
    })

    it("should create contacts from landline phone data", () => {
      const csvData = {
        "Landline 1": "206-555-0101",
        "Landline 2": "206-555-0202",
        "Landline 3": "206-555-0303",
        "Landline 4": "206-555-0404",
      }

      const result = createContactsFromCSV(ownerId, csvData)

      expect(result).toHaveLength(4)
      expect(result[0]).toEqual({
        phone: "206-555-0101",
        type: CONTACT_TYPES.LANDLINE,
        priority: 1,
        ownerId,
      })
      expect(result[1]).toEqual({
        phone: "206-555-0202",
        type: CONTACT_TYPES.LANDLINE,
        priority: 2,
        ownerId,
      })
      expect(result[2]).toEqual({
        phone: "206-555-0303",
        type: CONTACT_TYPES.LANDLINE,
        priority: 3,
        ownerId,
      })
      expect(result[3]).toEqual({
        phone: "206-555-0404",
        type: CONTACT_TYPES.LANDLINE,
        priority: 4,
        ownerId,
      })
    })

    it("should create contacts from mixed data", () => {
      const csvData = {
        "Email 1": "john@email.com",
        "Email 2": "john.work@email.com",
        "Wireless 1": "206-555-0101",
        "Wireless 2": "206-555-0202",
        "Landline 1": "206-555-0303",
      }

      const result = createContactsFromCSV(ownerId, csvData)

      expect(result).toHaveLength(5)

      // Check emails
      expect(result[0]).toEqual({
        email: "john@email.com",
        type: CONTACT_TYPES.EMAIL,
        priority: 1,
        ownerId,
      })
      expect(result[1]).toEqual({
        email: "john.work@email.com",
        type: CONTACT_TYPES.EMAIL,
        priority: 2,
        ownerId,
      })

      // Check wireless phones
      expect(result[2]).toEqual({
        phone: "206-555-0101",
        type: CONTACT_TYPES.CELL,
        priority: 1,
        ownerId,
      })
      expect(result[3]).toEqual({
        phone: "206-555-0202",
        type: CONTACT_TYPES.CELL,
        priority: 2,
        ownerId,
      })

      // Check landline phone
      expect(result[4]).toEqual({
        phone: "206-555-0303",
        type: CONTACT_TYPES.LANDLINE,
        priority: 1,
        ownerId,
      })
    })

    it("should skip empty fields", () => {
      const csvData = {
        "Email 1": "",
        "Email 2": "john.work@email.com",
        "Wireless 1": "206-555-0101",
        "Wireless 2": "",
        "Landline 1": "   ",
        "Landline 2": "206-555-0404",
      }

      const result = createContactsFromCSV(ownerId, csvData)

      expect(result).toHaveLength(4)
      expect(result[0]).toEqual({
        email: "john.work@email.com",
        type: CONTACT_TYPES.EMAIL,
        priority: 2,
        ownerId,
      })
      expect(result[1]).toEqual({
        phone: "206-555-0101",
        type: CONTACT_TYPES.CELL,
        priority: 1,
        ownerId,
      })
      expect(result[2]).toEqual({
        phone: "   ",
        type: CONTACT_TYPES.LANDLINE,
        priority: 1,
        ownerId,
      })
      expect(result[3]).toEqual({
        phone: "206-555-0404",
        type: CONTACT_TYPES.LANDLINE,
        priority: 2,
        ownerId,
      })
    })

    it("should handle undefined fields", () => {
      const csvData = {
        "Email 1": undefined,
        "Email 2": "john.work@email.com",
        "Wireless 1": undefined,
        "Wireless 2": "206-555-0202",
      }

      const result = createContactsFromCSV(ownerId, csvData)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        email: "john.work@email.com",
        type: CONTACT_TYPES.EMAIL,
        priority: 2,
        ownerId,
      })
      expect(result[1]).toEqual({
        phone: "206-555-0202",
        type: CONTACT_TYPES.CELL,
        priority: 2,
        ownerId,
      })
    })

    it("should return empty array when no contact data provided", () => {
      const csvData = {}

      const result = createContactsFromCSV(ownerId, csvData)

      expect(result).toEqual([])
    })

    it("should return empty array when all fields are empty", () => {
      const csvData = {
        "Email 1": "",
        "Email 2": "",
        "Wireless 1": "",
        "Wireless 2": "",
        "Wireless 3": "",
        "Wireless 4": "",
        "Landline 1": "",
        "Landline 2": "",
        "Landline 3": "",
        "Landline 4": "",
      }

      const result = createContactsFromCSV(ownerId, csvData)

      expect(result).toEqual([])
    })

    it("should maintain correct priority order", () => {
      const csvData = {
        "Email 1": "john@email.com",
        "Email 2": "john.work@email.com",
        "Wireless 1": "206-555-0101",
        "Wireless 2": "206-555-0202",
        "Landline 1": "206-555-0303",
        "Landline 2": "206-555-0404",
      }

      const result = createContactsFromCSV(ownerId, csvData)

      // Check that priorities are assigned correctly
      const emailContacts = result.filter((c) => c.type === CONTACT_TYPES.EMAIL)
      const cellContacts = result.filter((c) => c.type === CONTACT_TYPES.CELL)
      const landlineContacts = result.filter(
        (c) => c.type === CONTACT_TYPES.LANDLINE
      )

      expect(emailContacts[0].priority).toBe(1)
      expect(emailContacts[1].priority).toBe(2)
      expect(cellContacts[0].priority).toBe(1)
      expect(cellContacts[1].priority).toBe(2)
      expect(landlineContacts[0].priority).toBe(1)
      expect(landlineContacts[1].priority).toBe(2)
    })
  })
})
