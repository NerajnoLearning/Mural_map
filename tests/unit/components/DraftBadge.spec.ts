import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/composables/useOfflineDrafts', () => ({
  useOfflineDrafts: () => ({
    drafts: { value: [{ id: '1' }, { id: '2' }] },
    getAllDrafts: vi.fn().mockResolvedValue(undefined),
    pendingPosts: { value: [] },
    getAllPendingPosts: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({ user: null }),
}))
vi.mock('@/stores/notifications', () => ({
  useNotificationsStore: () => ({
    unreadCount: 0,
    fetchNotifications: vi.fn(),
    subscribeToNotifications: vi.fn().mockReturnValue({}),
    unsubscribe: vi.fn(),
  }),
}))

import BottomNav from '@/components/layout/BottomNav.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/', component: { template: '<div />' } }],
})

describe('BottomNav draft badge', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows draft count badge when drafts exist', async () => {
    const wrapper = mount(BottomNav, {
      global: { plugins: [router, createPinia()] },
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="draft-badge"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="draft-badge"]').text()).toBe('2')
  })
})
