import { describe, it, expect } from 'vitest'
import { formatPhone } from '@/lib/utils'

describe('formatPhone', () => {
  it('should format 10-digit phone numbers correctly', () => {
    expect(formatPhone('1234567890')).toBe('(123) 456-7890')
    expect(formatPhone('555-123-4567')).toBe('(555) 123-4567')
    expect(formatPhone('(555) 123-4567')).toBe('(555) 123-4567')
    expect(formatPhone('555.123.4567')).toBe('(555) 123-4567')
  })

  it('should format 11-digit phone numbers with leading 1', () => {
    expect(formatPhone('11234567890')).toBe('(123) 456-7890')
    expect(formatPhone('+1 555 123 4567')).toBe('(555) 123-4567')
  })

  it('should format 7-digit phone numbers', () => {
    expect(formatPhone('1234567')).toBe('123-4567')
    expect(formatPhone('555-1234')).toBe('555-1234')
  })

  it('should handle null, undefined, and empty values', () => {
    expect(formatPhone(null)).toBe('')
    expect(formatPhone(undefined)).toBe('')
    expect(formatPhone('')).toBe('')
  })

  it('should return original string for invalid lengths', () => {
    expect(formatPhone('123')).toBe('123')
    expect(formatPhone('123456789012345')).toBe('123456789012345')
    expect(formatPhone('not a phone')).toBe('not a phone')
  })

  it('should handle phone numbers with extensions and special characters', () => {
    expect(formatPhone('555-123-4567 ext 123')).toBe('555-123-4567 ext 123')
    expect(formatPhone('(555) 123-4567#123')).toBe('(555) 123-4567#123')
  })
})