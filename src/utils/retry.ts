// Retry logic with exponential backoff for API calls

import { createLogger } from './logger'

const logger = createLogger('RetryUtil')

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  retryableErrors?: string[]
}

const defaultOptions: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: ['PGRST301', 'PGRST116', 'NetworkError', 'TimeoutError']
}

/**
 * Retry a function with exponential backoff
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns The result of the function
 * @throws The last error if all retries fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options }
  let lastError: Error | null = null

  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Check if error is retryable
      if (!isRetryableError(lastError, opts.retryableErrors)) {
        logger.error(`Non-retryable error on attempt ${attempt + 1}:`, lastError)
        throw lastError
      }

      // Don't wait after the last attempt
      if (attempt === opts.maxRetries - 1) {
        break
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelay
      )

      logger.warn(
        `Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`,
        lastError.message
      )

      await sleep(delay)
    }
  }

  logger.error(`All ${opts.maxRetries} retry attempts failed`, lastError)
  throw lastError
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: Error, retryableErrors: string[]): boolean {
  // Network errors are always retryable
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return true
  }

  // Check against retryable error codes
  return retryableErrors.some(code => error.message.includes(code))
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry a Supabase query with exponential backoff
 * Wrapper specifically for Supabase operations
 */
export async function retrySupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: RetryOptions = {}
): Promise<{ data: T | null; error: any }> {
  return retryWithBackoff(async () => {
    const result = await queryFn()

    // If there's an error, throw it so retry logic kicks in
    if (result.error) {
      const error = new Error(result.error.message || 'Supabase query failed')
      error.name = result.error.code || 'SupabaseError'
      throw error
    }

    return result
  }, options)
}
