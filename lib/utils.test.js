import { cn } from './utils'

describe('cn function', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class active-class')
  })

  it('should handle false conditional classes', () => {
    const isActive = false
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class')
  })

  it('should handle empty strings and null values', () => {
    const result = cn('base-class', '', null, undefined)
    expect(result).toBe('base-class')
  })

  it('should handle arrays of classes', () => {
    const result = cn('base-class', ['nested-class', 'another-class'])
    expect(result).toBe('base-class nested-class another-class')
  })

  it('should handle objects with boolean values', () => {
    const result = cn('base-class', {
      'conditional-class': true,
      'false-class': false
    })
    expect(result).toBe('base-class conditional-class')
  })
})
