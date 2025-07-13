import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a phone number to (xxx) xxx-xxxx format
 * @param phone - The phone number string to format
 * @returns Formatted phone number or original string if invalid
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Handle different digit lengths
  if (digits.length === 10) {
    // Format as (xxx) xxx-xxxx
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  } else if (digits.length === 11 && digits.startsWith('1')) {
    // Remove leading 1 and format
    const tenDigits = digits.slice(1)
    return `(${tenDigits.slice(0, 3)}) ${tenDigits.slice(3, 6)}-${tenDigits.slice(6)}`
  } else if (digits.length === 7) {
    // Format as xxx-xxxx (local number)
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }
  
  // Return original string if doesn't match expected patterns
  return phone
}
