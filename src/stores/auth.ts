import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuth, useUser } from '@clerk/vue'
import { supabase, getAuthenticatedClient as createAuthClient } from '@/lib/supabase'
import { createLogger } from '@/utils/logger'

const logger = createLogger('AuthStore')

export const useAuthStore = defineStore('auth', () => {
  let clerkAuth: any = null
  let clerkUser: any = null
  let clerkGetToken: any = null
  let clerkInitialized = false

  const synced = ref(false)
  const syncing = ref(false)

  // Initialize Clerk hooks lazily (called inside reactive context)
  function initializeClerk() {
    if (clerkInitialized) return

    try {
      clerkAuth = useAuth()
      clerkUser = useUser()
      clerkGetToken = clerkAuth.getToken
      clerkInitialized = true
      logger.info('Clerk initialized successfully')
    } catch (err) {
      logger.warn('Clerk not available:', err)
      clerkInitialized = false
    }
  }

  const isAuthenticated = computed(() => {
    if (!clerkInitialized) initializeClerk()
    return clerkAuth?.isSignedIn?.value ?? false
  })

  const currentUser = computed(() => {
    if (!clerkInitialized) initializeClerk()
    return clerkUser?.user?.value ?? null
  })

  // Sync Clerk user to Supabase
  async function syncUserToSupabase() {
    if (!clerkInitialized) initializeClerk()

    if (!clerkAuth?.isSignedIn?.value || !clerkUser?.user?.value) return
    if (syncing.value) return

    syncing.value = true

    try {
      // Get Clerk JWT token
      const token = await clerkGetToken({ template: 'supabase' })

      if (!token) {
        logger.error('No Clerk token available')
        return
      }

      const user = clerkUser.user.value

      // Call Supabase with Clerk token in header
      const { error } = await supabase
        .from('users')
        .upsert({
          clerk_id: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? '',
          username: user.username ?? user.id,
          display_name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
          avatar_url: user.imageUrl ?? null
        }, {
          onConflict: 'clerk_id'
        })

      if (error) {
        logger.error('User sync error:', error)
      } else {
        synced.value = true
      }
    } catch (err) {
      logger.error('Sync failed:', err)
    } finally {
      syncing.value = false
    }
  }

  // Get Supabase client with Clerk token
  async function getAuthenticatedClient() {
    if (!clerkInitialized) initializeClerk()

    if (!clerkAuth?.isSignedIn?.value) return supabase

    try {
      const token = await clerkGetToken({ template: 'supabase' })

      if (token) {
        return createAuthClient(token)
      }
    } catch (err) {
      logger.error('Error getting auth token:', err)
    }

    return supabase
  }

  return {
    isAuthenticated,
    currentUser,
    synced,
    syncing,
    syncUserToSupabase,
    getAuthenticatedClient
  }
})
