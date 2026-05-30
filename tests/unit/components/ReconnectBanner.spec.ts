import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ReconnectBanner from '@/components/ui/ReconnectBanner.vue'

describe('ReconnectBanner', () => {
  it('renders pending count', () => {
    const wrapper = mount(ReconnectBanner, {
      props: { count: 3, onSync: () => {}, onDismiss: () => {} },
    })
    expect(wrapper.text()).toContain('3')
  })

  it('calls onDismiss on × click', async () => {
    const onDismiss = vi.fn()
    const wrapper = mount(ReconnectBanner, {
      props: { count: 2, onSync: () => {}, onDismiss },
    })
    await wrapper.find('[data-testid="dismiss-btn"]').trigger('click')
    expect(onDismiss).toHaveBeenCalled()
  })

  it('calls onSync on Sync button click', async () => {
    const onSync = vi.fn()
    const wrapper = mount(ReconnectBanner, {
      props: { count: 1, onSync, onDismiss: () => {} },
    })
    await wrapper.find('[data-testid="sync-btn"]').trigger('click')
    expect(onSync).toHaveBeenCalled()
  })

  it('shows singular "draft" for count 1', () => {
    const wrapper = mount(ReconnectBanner, {
      props: { count: 1, onSync: () => {}, onDismiss: () => {} },
    })
    expect(wrapper.text()).toContain('draft')
    expect(wrapper.text()).not.toContain('drafts')
  })

  it('shows plural "drafts" for count > 1', () => {
    const wrapper = mount(ReconnectBanner, {
      props: { count: 2, onSync: () => {}, onDismiss: () => {} },
    })
    expect(wrapper.text()).toContain('drafts')
  })
})
