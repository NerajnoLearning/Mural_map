import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockSupabase, resetSupabaseMocks } from '../../mocks/supabase'

// Hoisted mock state so it is available before module imports are resolved
const mockClerkState = vi.hoisted(() => ({
  isSignedIn: { value: false },
  isLoaded: { value: true },
  user: { value: null as Record<string, any> | null },
  getToken: vi.fn(() => Promise.resolve('mock-clerk-token')),
}))

// Mock @clerk/vue — intercepted by both import and require
vi.mock('@clerk/vue', () => ({
  useAuth: () => ({
    isSignedIn: mockClerkState.isSignedIn,
    isLoaded: mockClerkState.isLoaded,
    getToken: mockClerkState.getToken,
  }),
  useUser: () => ({
    user: mockClerkState.user,
  }),
}))

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

import { useAuthStore } from '@/stores/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    resetSupabaseMocks()
    mockClerkState.isSignedIn.value = false
    mockClerkState.user.value = null
    mockClerkState.getToken.mockReset()
    mockClerkState.getToken.mockResolvedValue('mock-clerk-token')
  })

  describe('Initial State', () => {
    it('should have synced as false initially', () => {
      const authStore = useAuthStore()
      expect(authStore.synced).toBe(false)
    })

    it('should have syncing as false initially', () => {
      const authStore = useAuthStore()
      expect(authStore.syncing).toBe(false)
    })
  })

  describe('isAuthenticated', () => {
    it('should return false when Clerk user is not signed in', () => {
      mockClerkState.isSignedIn.value = false
      const authStore = useAuthStore()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should return true when Clerk user is signed in', () => {
      mockClerkState.isSignedIn.value = true
      const authStore = useAuthStore()
      expect(authStore.isAuthenticated).toBe(true)
    })
  })

  describe('currentUser', () => {
    it('should return null when no Clerk user', () => {
      mockClerkState.user.value = null
      const authStore = useAuthStore()
      expect(authStore.currentUser).toBeNull()
    })

    it('should return the Clerk user object when signed in', () => {
      mockClerkState.user.value = {
        id: 'clerk-user-id',
        primaryEmailAddress: { emailAddress: 'test@example.com' },
        username: 'testuser',
      }
      const authStore = useAuthStore()
      expect(authStore.currentUser).toBeTruthy()
      expect(authStore.currentUser?.id).toBe('clerk-user-id')
    })
  })

  describe('syncUserToSupabase', () => {
    it('should skip sync when not signed in', async () => {
      mockClerkState.isSignedIn.value = false
      const authStore = useAuthStore()
      await authStore.syncUserToSupabase()
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should skip sync when already syncing', async () => {
      mockClerkState.isSignedIn.value = true
      mockClerkState.user.value = { id: 'clerk-id' }
      const authStore = useAuthStore()
      authStore.syncing = true
      await authStore.syncUserToSupabase()
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should request a Supabase-scoped Clerk token during sync', async () => {
      mockClerkState.isSignedIn.value = true
      mockClerkState.user.value = {
        id: 'clerk-user-id',
        primaryEmailAddress: { emailAddress: 'test@example.com' },
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        imageUrl: 'https://example.com/avatar.jpg',
      }
      mockSupabase.from.mockReturnValueOnce({
        upsert: vi.fn(() => Promise.resolve({ error: null })),
      })

      const authStore = useAuthStore()
      await authStore.syncUserToSupabase()

      expect(mockClerkState.getToken).toHaveBeenCalledWith({ template: 'supabase' })
    })

    it('should set synced to true after a successful sync', async () => {
      mockClerkState.isSignedIn.value = true
      mockClerkState.user.value = {
        id: 'clerk-user-id',
        primaryEmailAddress: { emailAddress: 'test@example.com' },
        username: 'testuser',
        firstName: null,
        lastName: null,
        imageUrl: null,
      }
      mockSupabase.from.mockReturnValueOnce({
        upsert: vi.fn(() => Promise.resolve({ error: null })),
      })

      const authStore = useAuthStore()
      await authStore.syncUserToSupabase()

      expect(authStore.synced).toBe(true)
      expect(authStore.syncing).toBe(false)
    })

    it('should not set synced when token is missing', async () => {
      mockClerkState.isSignedIn.value = true
      mockClerkState.user.value = {
        id: 'clerk-user-id',
        primaryEmailAddress: { emailAddress: 'test@example.com' },
        username: 'testuser',
      }
      mockClerkState.getToken.mockResolvedValueOnce(null)

      const authStore = useAuthStore()
      await authStore.syncUserToSupabase()

      expect(authStore.synced).toBe(false)
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })
  })

  describe('getAuthenticatedClient', () => {
    it('should return a client when not signed in', async () => {
      mockClerkState.isSignedIn.value = false
      const authStore = useAuthStore()
      const client = await authStore.getAuthenticatedClient()
      expect(client).toBeTruthy()
    })

    it('should return a client when signed in', async () => {
      mockClerkState.isSignedIn.value = true
      const authStore = useAuthStore()
      const client = await authStore.getAuthenticatedClient()
      expect(client).toBeTruthy()
    })
  })
})
