/**
 * Global test setup file
 * Runs before all tests
 */

import { vi } from 'vitest'

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'https://test-project.supabase.co'
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any

// Mock navigator.geolocation
Object.defineProperty(global.navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: vi.fn((success) =>
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10
        }
      })
    ),
    watchPosition: vi.fn(),
    clearWatch: vi.fn()
  }
})

// Mock clipboard API
Object.defineProperty(global.navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve(''))
  }
})

// Suppress console errors in tests (optional)
// global.console.error = vi.fn()
