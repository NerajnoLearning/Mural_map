import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
globalThis.URL.revokeObjectURL = vi.fn()

const BaseButtonStub = {
  template: '<button @click="$emit(\'click\')" :disabled="disabled"><slot /></button>',
  props: ['variant', 'size', 'loading', 'disabled'],
}

import CropAdjustModal from '@/components/upload/CropAdjustModal.vue'

const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })

describe('CropAdjustModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders aspect ratio buttons', () => {
    const wrapper = mount(CropAdjustModal, {
      props: { file: mockFile },
      global: { components: { BaseButton: BaseButtonStub } },
    })
    expect(wrapper.text()).toContain('Free')
    expect(wrapper.text()).toContain('1:1')
    expect(wrapper.text()).toContain('4:3')
    expect(wrapper.text()).toContain('16:9')
  })

  it('renders brightness and contrast sliders', () => {
    const wrapper = mount(CropAdjustModal, {
      props: { file: mockFile },
      global: { components: { BaseButton: BaseButtonStub } },
    })
    const sliders = wrapper.findAll('input[type="range"]')
    expect(sliders).toHaveLength(2)
    expect(sliders[0].attributes('min')).toBe('-50')
    expect(sliders[0].attributes('max')).toBe('50')
    expect(sliders[1].attributes('min')).toBe('-50')
    expect(sliders[1].attributes('max')).toBe('50')
  })

  it('resets adjustments on Reset click', async () => {
    const wrapper = mount(CropAdjustModal, {
      props: { file: mockFile },
      global: { components: { BaseButton: BaseButtonStub } },
    })
    const sliders = wrapper.findAll('input[type="range"]')
    await sliders[0].setValue('30')
    await wrapper.find('[data-testid="reset-btn"]').trigger('click')
    expect((wrapper.findAll('input[type="range"]')[0].element as HTMLInputElement).value).toBe('0')
  })

  it('emits skip when Skip clicked', async () => {
    const wrapper = mount(CropAdjustModal, {
      props: { file: mockFile },
      global: { components: { BaseButton: BaseButtonStub } },
    })
    await wrapper.find('[data-testid="skip-btn"]').trigger('click')
    expect(wrapper.emitted('skip')).toBeTruthy()
  })

  it('changes active aspect ratio on button click', async () => {
    const wrapper = mount(CropAdjustModal, {
      props: { file: mockFile },
      global: { components: { BaseButton: BaseButtonStub } },
    })
    await wrapper.find('[data-testid="ratio-1:1"]').trigger('click')
    expect(wrapper.find('[data-testid="ratio-1:1"]').classes()).toContain('bg-primary')
  })
})
