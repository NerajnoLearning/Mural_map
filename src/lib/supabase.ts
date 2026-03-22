import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { getEnvironmentConfig } from '@/utils/env'

// Get validated environment config
const env = getEnvironmentConfig()
const supabaseUrl = env.supabaseUrl
const supabaseAnonKey = env.supabaseAnonKey

// Create Supabase client configured for Clerk authentication
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable Supabase's built-in auth since we're using Clerk
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
})

// Returns a Supabase client with Clerk JWT injected for authenticated requests
export const getAuthenticatedClient = (token: string) => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })
}

// Helper functions for common operations

export const uploadImage = async (
  file: File,
  bucket: string = 'murals',
  path?: string
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const fileName = path || `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return { url: urlData.publicUrl, error: null }
  } catch (error) {
    return { url: null, error: error as Error }
  }
}

export const deleteImage = async (
  path: string,
  bucket: string = 'murals'
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

export default supabase
