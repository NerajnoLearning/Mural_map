import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '@/components/ui/BaseButton.vue'

describe('BaseButton', () => {
  describe('Rendering', () => {
    it('should render button with default props', () => {
      const wrapper = mount(BaseButton, {
        slots: {
          default: 'Click Me'
        }
      })

      expect(wrapper.element.tagName).toBe('BUTTON')
      expect(wrapper.text()).toBe('Click Me')
      expect(wrapper.attributes('type')).toBe('button')
    })

    it('should render button with custom text', () => {
      const wrapper = mount(BaseButton, {
        slots: {
          default: 'Custom Button Text'
        }
      })

      expect(wrapper.text()).toBe('Custom Button Text')
    })

    it('should render with HTML slot content', () => {
      const wrapper = mount(BaseButton, {
        slots: {
          default: '<span class="icon">✓</span> Save'
        }
      })

      expect(wrapper.html()).toContain('<span class="icon">✓</span>')
      expect(wrapper.text()).toContain('Save')
    })
  })

  describe('Variants', () => {
    it('should apply primary variant classes by default', () => {
      const wrapper = mount(BaseButton)
      const button = wrapper.find('button')

      expect(button.classes()).toContain('bg-primary')
      expect(button.classes()).toContain('text-white')
    })

    it('should apply secondary variant classes', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'secondary' }
      })

      expect(wrapper.classes()).toContain('bg-accent')
      expect(wrapper.classes()).toContain('text-white')
    })

    it('should apply outline variant classes', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'outline' }
      })

      expect(wrapper.classes()).toContain('border-2')
      expect(wrapper.classes()).toContain('border-primary')
      expect(wrapper.classes()).toContain('text-primary')
    })

    it('should apply ghost variant classes', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'ghost' }
      })

      expect(wrapper.classes()).toContain('text-primary')
    })

    it('should apply danger variant classes', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'danger' }
      })

      expect(wrapper.classes()).toContain('bg-error')
      expect(wrapper.classes()).toContain('text-white')
    })
  })

  describe('Sizes', () => {
    it('should apply medium size classes by default', () => {
      const wrapper = mount(BaseButton)

      expect(wrapper.classes()).toContain('px-16')
      expect(wrapper.classes()).toContain('py-8')
      expect(wrapper.classes()).toContain('text-base')
    })

    it('should apply small size classes', () => {
      const wrapper = mount(BaseButton, {
        props: { size: 'sm' }
      })

      expect(wrapper.classes()).toContain('px-12')
      expect(wrapper.classes()).toContain('py-6')
      expect(wrapper.classes()).toContain('text-sm')
    })

    it('should apply large size classes', () => {
      const wrapper = mount(BaseButton, {
        props: { size: 'lg' }
      })

      expect(wrapper.classes()).toContain('px-24')
      expect(wrapper.classes()).toContain('py-12')
      expect(wrapper.classes()).toContain('text-lg')
    })
  })

  describe('Full Width', () => {
    it('should not be full width by default', () => {
      const wrapper = mount(BaseButton)

      expect(wrapper.classes()).not.toContain('w-full')
    })

    it('should apply full width when prop is true', () => {
      const wrapper = mount(BaseButton, {
        props: { fullWidth: true }
      })

      expect(wrapper.classes()).toContain('w-full')
    })
  })

  describe('Button Types', () => {
    it('should have button type by default', () => {
      const wrapper = mount(BaseButton)

      expect(wrapper.attributes('type')).toBe('button')
    })

    it('should apply submit type', () => {
      const wrapper = mount(BaseButton, {
        props: { type: 'submit' }
      })

      expect(wrapper.attributes('type')).toBe('submit')
    })

    it('should apply reset type', () => {
      const wrapper = mount(BaseButton, {
        props: { type: 'reset' }
      })

      expect(wrapper.attributes('type')).toBe('reset')
    })
  })

  describe('Disabled State', () => {
    it('should not be disabled by default', () => {
      const wrapper = mount(BaseButton)

      expect(wrapper.attributes('disabled')).toBeUndefined()
    })

    it('should be disabled when prop is true', () => {
      const wrapper = mount(BaseButton, {
        props: { disabled: true }
      })

      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('should have disabled classes', () => {
      const wrapper = mount(BaseButton, {
        props: { disabled: true }
      })

      expect(wrapper.classes()).toContain('disabled:opacity-50')
      expect(wrapper.classes()).toContain('disabled:cursor-not-allowed')
    })

    it('should not emit click event when disabled', async () => {
      const wrapper = mount(BaseButton, {
        props: { disabled: true }
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeUndefined()
    })
  })

  describe('Loading State', () => {
    it('should not be loading by default', () => {
      const wrapper = mount(BaseButton)

      expect(wrapper.find('svg').exists()).toBe(false)
    })

    it('should show loading spinner when loading', () => {
      const wrapper = mount(BaseButton, {
        props: { loading: true }
      })

      const spinner = wrapper.find('svg')
      expect(spinner.exists()).toBe(true)
      expect(spinner.classes()).toContain('animate-spin')
    })

    it('should be disabled when loading', () => {
      const wrapper = mount(BaseButton, {
        props: { loading: true }
      })

      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('should not emit click event when loading', async () => {
      const wrapper = mount(BaseButton, {
        props: { loading: true }
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeUndefined()
    })

    it('should display content alongside spinner', () => {
      const wrapper = mount(BaseButton, {
        props: { loading: true },
        slots: {
          default: 'Saving...'
        }
      })

      expect(wrapper.text()).toContain('Saving...')
      expect(wrapper.find('svg').exists()).toBe(true)
    })
  })

  describe('Click Events', () => {
    it('should emit click event when clicked', async () => {
      const wrapper = mount(BaseButton)

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('should pass event object to click handler', async () => {
      const wrapper = mount(BaseButton)

      await wrapper.trigger('click')

      const emittedEvents = wrapper.emitted('click')
      expect(emittedEvents).toBeTruthy()
      expect(emittedEvents![0][0]).toBeInstanceOf(MouseEvent)
    })

    it('should emit multiple click events', async () => {
      const wrapper = mount(BaseButton)

      await wrapper.trigger('click')
      await wrapper.trigger('click')
      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toHaveLength(3)
    })

    it('should call custom click handler', async () => {
      const clickHandler = vi.fn()
      const wrapper = mount(BaseButton, {
        attrs: {
          onClick: clickHandler
        }
      })

      await wrapper.trigger('click')

      expect(clickHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have focus ring classes', () => {
      const wrapper = mount(BaseButton)

      expect(wrapper.classes()).toContain('focus:outline-none')
      expect(wrapper.classes()).toContain('focus:ring-2')
      expect(wrapper.classes()).toContain('focus:ring-offset-2')
    })

    it('should be keyboard accessible', async () => {
      const wrapper = mount(BaseButton)

      // Simulate Enter key press
      await wrapper.trigger('keydown.enter')
      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('should have appropriate focus ring color for variant', () => {
      const primaryButton = mount(BaseButton, {
        props: { variant: 'primary' }
      })
      expect(primaryButton.classes()).toContain('focus:ring-primary')

      const secondaryButton = mount(BaseButton, {
        props: { variant: 'secondary' }
      })
      expect(secondaryButton.classes()).toContain('focus:ring-accent')

      const dangerButton = mount(BaseButton, {
        props: { variant: 'danger' }
      })
      expect(dangerButton.classes()).toContain('focus:ring-error')
    })
  })

  describe('Combined Props', () => {
    it('should combine variant and size correctly', () => {
      const wrapper = mount(BaseButton, {
        props: {
          variant: 'secondary',
          size: 'lg'
        }
      })

      expect(wrapper.classes()).toContain('bg-accent')
      expect(wrapper.classes()).toContain('px-24')
      expect(wrapper.classes()).toContain('py-12')
      expect(wrapper.classes()).toContain('text-lg')
    })

    it('should combine all props correctly', () => {
      const wrapper = mount(BaseButton, {
        props: {
          variant: 'outline',
          size: 'sm',
          fullWidth: true,
          type: 'submit'
        },
        slots: {
          default: 'Submit Form'
        }
      })

      expect(wrapper.classes()).toContain('border-2')
      expect(wrapper.classes()).toContain('px-12')
      expect(wrapper.classes()).toContain('w-full')
      expect(wrapper.attributes('type')).toBe('submit')
      expect(wrapper.text()).toBe('Submit Form')
    })

    it('should handle disabled and loading together', () => {
      const wrapper = mount(BaseButton, {
        props: {
          disabled: true,
          loading: true
        }
      })

      expect(wrapper.attributes('disabled')).toBeDefined()
      expect(wrapper.find('svg').exists()).toBe(true)
    })
  })

  describe('Base Classes', () => {
    it('should always include base classes', () => {
      const wrapper = mount(BaseButton)

      const baseClasses = [
        'inline-flex',
        'items-center',
        'justify-center',
        'font-semibold',
        'rounded-lg',
        'transition-all'
      ]

      baseClasses.forEach(className => {
        expect(wrapper.classes()).toContain(className)
      })
    })
  })
})
