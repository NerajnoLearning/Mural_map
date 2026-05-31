import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { getEnvironmentConfig } from '@/utils/env'

const env = getEnvironmentConfig()
const supabaseUrl = env.supabaseUrl
const supabaseAnonKey = env.supabaseAnonKey

// Set by auth store after Clerk initializes; provides JWT for every Supabase request
let _tokenProvider: (() => Promise<string | null>) | null = null

export const setTokenProvider = (fn: () => Promise<string | null>) => {
  _tokenProvider = fn
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  accessToken: async () => {
    if (_tokenProvider) {
      return (await _tokenProvider()) ?? null
    }
    return null
  },
})

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
