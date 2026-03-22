import { describe, it, expect } from 'vitest'

/**
 * Validation utility functions
 * These tests demonstrate unit testing for pure functions
 */

// Email validation
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/
  return emailRegex.test(email)
}

// Password validation
function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Username validation
function validateUsername(username: string): boolean {
  // 3-30 characters, letters, numbers, underscores, hyphens only
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
  return usernameRegex.test(username)
}

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@example.com')).toBe(true)
      expect(validateEmail('user+tag@example.co.uk')).toBe(true)
      expect(validateEmail('user_name@sub.example.org')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('user @example.com')).toBe(false)
      expect(validateEmail('user@example')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(validateEmail('a@b.c')).toBe(true) // Minimal valid email
      expect(validateEmail('user@@example.com')).toBe(false) // Double @
      expect(validateEmail('user@example..com')).toBe(false) // Double dot
    })
  })

  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      const result = validatePassword('SecurePass123!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject passwords that are too short', () => {
      const result = validatePassword('Short1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters')
    })

    it('should reject passwords without uppercase letters', () => {
      const result = validatePassword('lowercase123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should reject passwords without numbers', () => {
      const result = validatePassword('NoNumbers!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    it('should reject passwords without special characters', () => {
      const result = validatePassword('NoSpecial123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one special character')
    })

    it('should return multiple errors for weak passwords', () => {
      const result = validatePassword('weak')
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })

    it('should handle empty password', () => {
      const result = validatePassword('')
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('validateUsername', () => {
    it('should accept valid usernames', () => {
      expect(validateUsername('john_doe')).toBe(true)
      expect(validateUsername('user123')).toBe(true)
      expect(validateUsername('cool-user')).toBe(true)
      expect(validateUsername('abc')).toBe(true) // Minimum 3 chars
      expect(validateUsername('a'.repeat(30))).toBe(true) // Maximum 30 chars
    })

    it('should reject usernames that are too short', () => {
      expect(validateUsername('ab')).toBe(false)
      expect(validateUsername('a')).toBe(false)
      expect(validateUsername('')).toBe(false)
    })

    it('should reject usernames that are too long', () => {
      expect(validateUsername('a'.repeat(31))).toBe(false)
      expect(validateUsername('a'.repeat(50))).toBe(false)
    })

    it('should reject usernames with invalid characters', () => {
      expect(validateUsername('user name')).toBe(false) // Space
      expect(validateUsername('user@name')).toBe(false) // @
      expect(validateUsername('user.name')).toBe(false) // Dot
      expect(validateUsername('user!name')).toBe(false) // Special char
    })

    it('should accept underscores and hyphens', () => {
      expect(validateUsername('user_name')).toBe(true)
      expect(validateUsername('user-name')).toBe(true)
      expect(validateUsername('user_name-123')).toBe(true)
    })
  })
})
