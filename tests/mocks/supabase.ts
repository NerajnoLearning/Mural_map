import { vi } from 'vitest'

/**
 * Mock Supabase client for testing
 * Use this to avoid making real API calls in tests
 */

export const mockSupabaseAuth = {
  signUp: vi.fn(() => Promise.resolve({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { display_name: 'Test User' }
      },
      session: { access_token: 'test-token' }
    },
    error: null
  })),

  signInWithPassword: vi.fn(() => Promise.resolve({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com'
      },
      session: { access_token: 'test-token' }
    },
    error: null
  })),

  signInWithOAuth: vi.fn(() => Promise.resolve({
    data: { url: 'https://oauth-url.com', provider: 'google' },
    error: null
  })),

  signInWithOtp: vi.fn(() => Promise.resolve({
    data: {},
    error: null
  })),

  verifyOtp: vi.fn(() => Promise.resolve({
    data: {
      user: { id: 'test-user-id' },
      session: { access_token: 'test-token' }
    },
    error: null
  })),

  signOut: vi.fn(() => Promise.resolve({ error: null })),

  getSession: vi.fn(() => Promise.resolve({
    data: { session: null },
    error: null
  })),

  onAuthStateChange: vi.fn((callback) => {
    return {
      data: { subscription: { unsubscribe: vi.fn() } }
    }
  }),

  resetPasswordForEmail: vi.fn(() => Promise.resolve({
    data: {},
    error: null
  })),

  updateUser: vi.fn(() => Promise.resolve({
    data: { user: { id: 'test-user-id' } },
    error: null
  }))
}

export const mockSupabaseFrom = vi.fn((table: string) => ({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({
        data: { id: 'test-id', title: 'Test Post' },
        error: null
      })),
      limit: vi.fn(() => Promise.resolve({
        data: [],
        error: null
      })),
      order: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({
          data: [],
          error: null
        })),
        range: vi.fn(() => Promise.resolve({
          data: [],
          error: null
        }))
      })),
      range: vi.fn(() => Promise.resolve({
        data: [],
        error: null
      }))
    })),
    gte: vi.fn(() => ({
      order: vi.fn(() => Promise.resolve({
        data: [],
        error: null
      }))
    })),
    or: vi.fn(() => Promise.resolve({
      data: [],
      error: null
    })),
    order: vi.fn(() => ({
      limit: vi.fn(() => Promise.resolve({
        data: [],
        error: null
      })),
      range: vi.fn(() => Promise.resolve({
        data: [],
        error: null
      }))
    })),
    limit: vi.fn(() => Promise.resolve({
      data: [],
      error: null
    }))
  })),

  insert: vi.fn(() => ({
    select: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({
        data: { id: 'new-id', title: 'New Post' },
        error: null
      }))
    }))
  })),

  update: vi.fn(() => ({
    eq: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({
          data: { id: 'test-id', updated: true },
          error: null
        }))
      }))
    }))
  })),

  delete: vi.fn(() => ({
    eq: vi.fn(() => Promise.resolve({
      error: null
    }))
  }))
}))

export const mockSupabaseStorage = {
  from: vi.fn((bucket: string) => ({
    upload: vi.fn(() => Promise.resolve({
      data: { path: 'test-image.jpg' },
      error: null
    })),

    getPublicUrl: vi.fn(() => ({
      data: { publicUrl: 'https://test-url.com/image.jpg' }
    })),

    remove: vi.fn(() => Promise.resolve({
      error: null
    }))
  }))
}

export const mockSupabaseChannel = vi.fn((name: string) => ({
  on: vi.fn(() => ({
    subscribe: vi.fn(() => Promise.resolve('ok'))
  })),
  subscribe: vi.fn(() => Promise.resolve('ok')),
  unsubscribe: vi.fn(() => Promise.resolve('ok'))
}))

export const mockSupabase = {
  auth: mockSupabaseAuth,
  from: mockSupabaseFrom,
  storage: mockSupabaseStorage,
  channel: mockSupabaseChannel,
  removeChannel: vi.fn()
}

/**
 * Helper to reset all mocks between tests
 */
export const resetSupabaseMocks = () => {
  vi.clearAllMocks()
}
