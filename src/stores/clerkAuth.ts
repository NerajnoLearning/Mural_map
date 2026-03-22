import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuth, useUser } from '@clerk/vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

/**
 * Clerk-based authentication store
 * This replaces the old Supabase auth store
 */
export const useClerkAuthStore = defineStore('clerkAuth', () => {
  // Clerk auth hooks
  const { isSignedIn, isLoaded } = useAuth()
  const { user: clerkUser } = useUser()

  // Local state
  const supabaseUser = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => isSignedIn.value)
  const user = computed(() => supabaseUser.value)
  const userId = computed(() => supabaseUser.value?.id || null)
  const clerkId = computed(() => clerkUser.value?.id || null)

  /**
   * Fetch user profile from Supabase using Clerk ID
   */
  const fetchUserProfile = async () => {
    if (!clerkUser.value) {
      supabaseUser.value = null
      return
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkUser.value.id)
        .single()

      if (fetchError) {
        // User might not exist yet in Supabase (webhook hasn't fired)
        // Create user manually if needed
        if (fetchError.code === 'PGRST116') {
          console.warn('User not found in Supabase, may need to wait for webhook')
          await createUserFromClerk()
          return
        }
        throw fetchError
      }

      supabaseUser.value = data
    } catch (err) {
      error.value = (err as Error).message
      console.error('Error fetching user profile:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Create user in Supabase from Clerk data
   * This is a fallback if webhook hasn't fired yet
   */
  const createUserFromClerk = async () => {
    if (!clerkUser.value) return

    try {
      const email = clerkUser.value.emailAddresses?.[0]?.emailAddress || ''
      const username = clerkUser.value.username || email.split('@')[0] || `user_${clerkUser.value.id.slice(0, 8)}`
      const displayName = [clerkUser.value.firstName, clerkUser.value.lastName]
        .filter(Boolean)
        .join(' ') || username

      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          clerk_id: clerkUser.value.id,
          email,
          username,
          display_name: displayName,
          avatar_url: clerkUser.value.imageUrl || null
        })
        .select()
        .single()

      if (insertError) throw insertError

      supabaseUser.value = data
    } catch (err) {
      console.error('Error creating user from Clerk:', err)
      // Don't throw - webhook will eventually create the user
    }
  }

  /**
   * Update user profile in Supabase
   */
  const updateProfile = async (updates: Partial<User>) => {
    if (!supabaseUser.value) {
      error.value = 'No user logged in'
      return { data: null, error: new Error('No user logged in') }
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', supabaseUser.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      supabaseUser.value = data
      return { data, error: null }
    } catch (err) {
      error.value = (err as Error).message
      return { data: null, error: err as Error }
    } finally {
      loading.value = false
    }
  }

  /**
   * Sign out (handled by Clerk)
   * Just clear local Supabase user data
   */
  const signOut = async () => {
    supabaseUser.value = null
    error.value = null
    // Actual sign out is handled by Clerk's SignOutButton or signOut()
  }

  /**
   * Initialize - fetch user profile when Clerk is loaded
   */
  const initialize = async () => {
    if (isLoaded.value && isSignedIn.value) {
      await fetchUserProfile()
    }
  }

  return {
    // State
    supabaseUser,
    loading,
    error,
    isLoaded,

    // Computed
    isAuthenticated,
    user,
    userId,
    clerkId,
    clerkUser,

    // Actions
    initialize,
    fetchUserProfile,
    updateProfile,
    signOut
  }
})
