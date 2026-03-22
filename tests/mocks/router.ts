import { vi } from 'vitest'
import { ref } from 'vue'

/**
 * Mock Vue Router for testing
 */

export const mockRoute = ref({
  path: '/',
  name: 'home',
  params: {},
  query: {},
  hash: '',
  fullPath: '/',
  matched: [],
  meta: {},
  redirectedFrom: undefined
})

export const mockRouter = {
  push: vi.fn((to: any) => {
    if (typeof to === 'string') {
      mockRoute.value.path = to
    } else if (to.path) {
      mockRoute.value.path = to.path
    }
    return Promise.resolve()
  }),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  beforeEach: vi.fn(),
  afterEach: vi.fn(),
  currentRoute: mockRoute,
  options: {
    history: {},
    routes: []
  }
}

/**
 * Helper to reset router mocks between tests
 */
export const resetRouterMocks = () => {
  vi.clearAllMocks()
  mockRoute.value = {
    path: '/',
    name: 'home',
    params: {},
    query: {},
    hash: '',
    fullPath: '/',
    matched: [],
    meta: {},
    redirectedFrom: undefined
  }
}
