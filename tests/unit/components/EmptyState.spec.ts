import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { FaHeart } from 'oh-vue-icons/icons'
import EmptyState from '@/components/ui/EmptyState.vue'

addIcons(FaHeart)

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/', component: { template: '<div />' } }],
})

const globalConfig = {
  plugins: [router],
  components: { VIcon: OhVueIcon },
}

describe('EmptyState', () => {
  it('renders title', () => {
    const wrapper = mount(EmptyState, {
      global: globalConfig,
      props: { icon: 'fa-heart', title: 'Nothing here' },
    })
    expect(wrapper.text()).toContain('Nothing here')
  })

  it('renders description when provided', () => {
    const wrapper = mount(EmptyState, {
      global: globalConfig,
      props: { icon: 'fa-heart', title: 'Nothing here', description: 'Try again later' },
    })
    expect(wrapper.text()).toContain('Try again later')
  })

  it('omits description when not provided', () => {
    const wrapper = mount(EmptyState, {
      global: globalConfig,
      props: { icon: 'fa-heart', title: 'Nothing here' },
    })
    expect(wrapper.find('[data-testid="description"]').exists()).toBe(false)
  })

  it('renders CTA link when ctaLabel and ctaTo provided', () => {
    const wrapper = mount(EmptyState, {
      global: globalConfig,
      props: { icon: 'fa-heart', title: 'Nothing here', ctaLabel: 'Go there', ctaTo: '/discover' },
    })
    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.text()).toContain('Go there')
  })

  it('omits CTA when ctaLabel not provided', () => {
    const wrapper = mount(EmptyState, {
      global: globalConfig,
      props: { icon: 'fa-heart', title: 'Nothing here' },
    })
    expect(wrapper.find('a').exists()).toBe(false)
  })
})
