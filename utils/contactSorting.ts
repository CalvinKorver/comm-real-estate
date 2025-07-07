import type { PhoneLabel } from "@/types/property"

interface ContactWithLabel {
  label?: PhoneLabel
  created_at: Date | string
}

// Define the priority order for labels
const LABEL_PRIORITY: Record<string, number> = {
  primary: 1,
  secondary: 2,
  husband: 3,
  wife: 3,
  son: 4,
  daughter: 4,
}

/**
 * Sorts contacts by label priority and creation date
 * Priority order: Primary (1st), Secondary (2nd), Husband/Wife (3rd), Son/Daughter (4th),
 * everything else sorted by created date (newest first)
 */
export function sortContactsByPriority<T extends ContactWithLabel>(
  contacts: T[]
): T[] {
  return [...contacts].sort((a, b) => {
    const aLabel = a.label?.toLowerCase() || ""
    const bLabel = b.label?.toLowerCase() || ""

    const aPriority = LABEL_PRIORITY[aLabel] || 999
    const bPriority = LABEL_PRIORITY[bLabel] || 999

    // If priorities are different, sort by priority
    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    // If same priority (or both are "other"), sort by created date (newest first)
    const aDate = new Date(a.created_at).getTime()
    const bDate = new Date(b.created_at).getTime()
    return bDate - aDate
  })
}
