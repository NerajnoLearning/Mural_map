// Environment variable validation
// Ensures all required environment variables are present

interface EnvironmentConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  clerkPublishableKey?: string
  isDevelopment: boolean
  isProduction: boolean
}

/**
 * Validate and retrieve environment variables
 * Throws error if required variables are missing
 */
export function validateEnvironment(): EnvironmentConfig {
  const errors: string[] = []

  // Required variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is required')
  }

  if (!supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required')
  }

  // Validate URL format
  if (supabaseUrl && !isValidUrl(supabaseUrl)) {
    errors.push('VITE_SUPABASE_URL must be a valid URL')
  }

  // Optional but recommended
  const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  if (!clerkPublishableKey && import.meta.env.PROD) {
    console.warn('[MuralMap] VITE_CLERK_PUBLISHABLE_KEY is not set. Authentication features may not work.')
  }

  // Throw if any required variables are missing
  if (errors.length > 0) {
    const errorMessage = [
      '❌ Missing required environment variables:',
      ...errors.map(err => `  - ${err}`),
      '',
      'Please check your .env file and ensure all required variables are set.',
      'See .env.example for a template.'
    ].join('\n')

    throw new Error(errorMessage)
  }

  return {
    supabaseUrl: supabaseUrl!,
    supabaseAnonKey: supabaseAnonKey!,
    clerkPublishableKey,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD
  }
}

/**
 * Simple URL validation
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Get environment config (cached after first call)
 */
let cachedConfig: EnvironmentConfig | null = null

export function getEnvironmentConfig(): EnvironmentConfig {
  if (!cachedConfig) {
    cachedConfig = validateEnvironment()
  }
  return cachedConfig
}
