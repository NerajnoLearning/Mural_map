import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuth, useUser, useClerk } from '@clerk/vue'
import { supabase, getAuthenticatedClient as createAuthClient } from '@/lib/supabase'
import { createLogger } from '@/utils/logger'

const logger = createLogger('AuthStore')

export const useAuthStore = defineStore('auth', () => {
  let clerkAuth: any = null
  let clerkUser: any = null
  let clerkInstance: any = null
  let clerkInitialized = false

  const synced = ref(false)
  const syncing = ref(false)

  function initializeClerk() {
    if (clerkInitialized) return

    try {
      clerkAuth = useAuth()
      clerkUser = useUser()
      clerkInstance = useClerk()
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

  // Clerk user object — used by all components via authStore.user
  const user = computed(() => {
    if (!clerkInitialized) initializeClerk()
    return clerkUser?.user?.value ?? null
  })

  // Alias for compatibility
  const currentUser = user

  const isLoaded = computed(() => {
    if (!clerkInitialized) initializeClerk()
    return clerkAuth?.isLoaded?.value ?? false
  })

  async function signOut() {
    if (!clerkInitialized) initializeClerk()
    try {
      await clerkInstance?.value?.signOut()
    } catch (err) {
      logger.error('Sign out error:', err)
    }
  }

  // Legacy stubs — these pages exist but auth is handled by Clerk components
  async function signIn(_email: string, _password: string) {
    logger.warn('signIn called on auth store — use Clerk SignIn component instead')
  }

  async function signUp(_email: string, _password: string, _username: string) {
    logger.warn('signUp called on auth store — use Clerk SignUp component instead')
  }

  async function signInWithOAuth(_provider: string) {
    logger.warn('signInWithOAuth called on auth store — use Clerk OAuth instead')
  }

  async function resetPassword(_email: string) {
    logger.warn('resetPassword called on auth store — use Clerk forgot password instead')
  }

  // Sync Clerk user to Supabase
  async function syncUserToSupabase() {
    if (!clerkInitialized) initializeClerk()

    if (!clerkAuth?.isSignedIn?.value || !clerkUser?.user?.value) return
    if (syncing.value) return

    syncing.value = true

    try {
      const token = await clerkAuth.getToken({ template: 'supabase' })

      if (!token) {
        logger.error('No Clerk token available')
        return
      }

      const u = clerkUser.user.value

      const { error } = await supabase
        .from('users')
        .upsert({
          clerk_id: u.id,
          email: u.primaryEmailAddress?.emailAddress ?? '',
          username: u.username ?? u.id,
          display_name: [u.firstName, u.lastName].filter(Boolean).join(' ') || null,
          avatar_url: u.imageUrl ?? null
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

  async function getAuthenticatedClient() {
    if (!clerkInitialized) initializeClerk()

    if (!clerkAuth?.isSignedIn?.value) return supabase

    try {
      const token = await clerkAuth.getToken({ template: 'supabase' })
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
    isLoaded,
    user,
    currentUser,
    synced,
    syncing,
    signOut,
    signIn,
    signUp,
    signInWithOAuth,
    resetPassword,
    syncUserToSupabase,
    getAuthenticatedClient
  }
})
