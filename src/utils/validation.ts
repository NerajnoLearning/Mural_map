// Form validation utilities

export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required'

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }

  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'

  if (password.length < 8) {
    return 'Password must be at least 8 characters'
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }

  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number'
  }

  return null
}

export const validateUsername = (username: string): string | null => {
  if (!username) return 'Username is required'

  if (username.length < 3) {
    return 'Username must be at least 3 characters'
  }

  if (username.length > 20) {
    return 'Username must be less than 20 characters'
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores'
  }

  return null
}

export const validatePhone = (phone: string): string | null => {
  if (!phone) return 'Phone number is required'

  // Simple validation - accepts various formats
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number'
  }

  // Remove non-digits and check length
  const digitsOnly = phone.replace(/\D/g, '')
  if (digitsOnly.length < 10) {
    return 'Phone number must be at least 10 digits'
  }

  return null
}

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`
  }
  return null
}

export const getPasswordStrength = (password: string): {
  score: number
  label: string
  color: string
} => {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) {
    return { score, label: 'Weak', color: 'bg-error' }
  } else if (score <= 4) {
    return { score, label: 'Fair', color: 'bg-warning' }
  } else if (score <= 5) {
    return { score, label: 'Good', color: 'bg-info' }
  } else {
    return { score, label: 'Strong', color: 'bg-success' }
  }
}
