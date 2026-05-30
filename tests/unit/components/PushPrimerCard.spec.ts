import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PushPrimerCard from '@/components/ui/PushPrimerCard.vue'

const BaseButtonStub = { template: '<button @click="$emit(\'click\')"><slot /></button>', props: ['variant', 'size', 'loading'] }

describe('PushPrimerCard', () => {
  it('renders enable and dismiss controls', () => {
    const wrapper = mount(PushPrimerCard, {
      props: { onEnable: vi.fn(), onDismiss: vi.fn() },
      global: { components: { BaseButton: BaseButtonStub } },
    })
    expect(wrapper.find('[data-testid="primer-enable"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="primer-dismiss"]').exists()).toBe(true)
  })

  it('calls onEnable when Enable button clicked', async () => {
    const onEnable = vi.fn().mockResolvedValue(undefined)
    const wrapper = mount(PushPrimerCard, {
      props: { onEnable, onDismiss: vi.fn() },
      global: { components: { BaseButton: BaseButtonStub } },
    })
    await wrapper.find('[data-testid="primer-enable"]').trigger('click')
    expect(onEnable).toHaveBeenCalled()
  })

  it('calls onDismiss when × clicked', async () => {
    const onDismiss = vi.fn()
    const wrapper = mount(PushPrimerCard, {
      props: { onEnable: vi.fn(), onDismiss },
      global: { components: { BaseButton: BaseButtonStub } },
    })
    await wrapper.find('[data-testid="primer-dismiss"]').trigger('click')
    expect(onDismiss).toHaveBeenCalled()
  })
})
