# Group B — Draft Badge + Reconnect Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a draft count badge to the Upload nav button and a reconnect banner that appears when the user comes back online with pending posts.

**Architecture:** Both features read from `useOfflineDrafts()` composable (IndexedDB, no network). `BottomNav.vue` shows badge. `ReconnectBanner.vue` is a new presentational component; `App.vue` owns the trigger logic via a `watch` on `appStore.isOnline`.

**Tech Stack:** Vue 3, TypeScript, TailwindCSS, Pinia (`useAppStore`), `useOfflineDrafts` composable, vue-router

---

## File Map

| File | Action |
|------|--------|
| `src/components/layout/BottomNav.vue` | Modify — add draft count badge |
| `src/components/ui/ReconnectBanner.vue` | Create |
| `src/App.vue` | Modify — import + render ReconnectBanner |

---

## Task 1: Draft Count Badge in BottomNav

**Files:**
- Modify: `src/components/layout/BottomNav.vue`

- [ ] **Step 1: Write failing test**

Create `tests/unit/components/DraftBadge.spec.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'

// Mock useOfflineDrafts
vi.mock('@/composables/useOfflineDrafts', () => ({
  useOfflineDrafts: () => ({
    drafts: { value: [{ id: '1' }, { id: '2' }] },
    getAllDrafts: vi.fn().mockResolvedValue(undefined),
    pendingPosts: { value: [] },
    getAllPendingPosts: vi.fn().mockResolvedValue(undefined),
  }),
}))

// Mock stores
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
```

- [ ] **Step 2: Run — confirm FAIL**

```bash
npm run test:run -- DraftBadge
```

Expected: FAIL — `data-testid="draft-badge"` not found.

- [ ] **Step 3: Modify BottomNav.vue**

Read `src/components/layout/BottomNav.vue` first.

In `<script setup>`, add after existing imports:
```typescript
import { useOfflineDrafts } from '@/composables/useOfflineDrafts'
const { drafts, getAllDrafts } = useOfflineDrafts()
```

In the existing `onMounted`, add `await getAllDrafts()` as the first line (before the existing notifications fetch):
```typescript
onMounted(async () => {
  await getAllDrafts()
  if (authStore.user) {
    // ... existing code
  }
})
```

In the template, find the Upload `<router-link>` and its inner circle `<div>`. Add the badge inside the same relative container. The Upload button currently has:
```html
<div
  class="w-48 h-48 rounded-full flex items-center justify-center -mt-24 shadow-lg"
  :class="isActive('/upload') ? 'bg-primary' : 'bg-accent'"
>
  <svg ...>
```

Wrap the entire icon circle in a `relative` div and add badge after the circle:
```html
<div class="relative inline-flex">
  <div
    class="w-48 h-48 rounded-full flex items-center justify-center -mt-24 shadow-lg"
    :class="isActive('/upload') ? 'bg-primary' : 'bg-accent'"
  >
    <svg
      class="w-24 h-24 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 4v16m8-8H4"
      />
    </svg>
  </div>
  <span
    v-if="drafts.length > 0"
    data-testid="draft-badge"
    class="absolute top-0 right-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-[10px] font-bold z-10 border-2 border-surface-elevated"
  >
    {{ drafts.length > 9 ? '9+' : drafts.length }}
  </span>
</div>
```

- [ ] **Step 4: Run — confirm PASS**

```bash
npm run test:run -- DraftBadge
```

Expected: PASS.

- [ ] **Step 5: Lint**

```bash
npm run lint
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/BottomNav.vue tests/unit/components/DraftBadge.spec.ts
git commit -m "feat: add draft count badge to Upload nav button"
```

---

## Task 2: Reconnect Banner

**Files:**
- Create: `src/components/ui/ReconnectBanner.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/components/ReconnectBanner.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReconnectBanner from '@/components/ui/ReconnectBanner.vue'

describe('ReconnectBanner', () => {
  it('renders pending count', () => {
    const wrapper = mount(ReconnectBanner, {
      props: { count: 3, onSync: () => {}, onDismiss: () => {} },
    })
    expect(wrapper.text()).toContain('3')
  })

  it('emits dismiss on × click', async () => {
    const onDismiss = vi.fn()
    const wrapper = mount(ReconnectBanner, {
      props: { count: 2, onSync: () => {}, onDismiss },
    })
    await wrapper.find('[data-testid="dismiss-btn"]').trigger('click')
    expect(onDismiss).toHaveBeenCalled()
  })

  it('emits sync on Sync button click', async () => {
    const onSync = vi.fn()
    const wrapper = mount(ReconnectBanner, {
      props: { count: 1, onSync, onDismiss: () => {} },
    })
    await wrapper.find('[data-testid="sync-btn"]').trigger('click')
    expect(onSync).toHaveBeenCalled()
  })
})
```

Note: add `import { vi } from 'vitest'` at the top of the spec.

- [ ] **Step 2: Run — confirm FAIL**

```bash
npm run test:run -- ReconnectBanner
```

Expected: FAIL — component not found.

- [ ] **Step 3: Create `src/components/ui/ReconnectBanner.vue`**

```vue
<script setup lang="ts">
interface Props {
  count: number
  onSync: () => void
  onDismiss: () => void
}

defineProps<Props>()
</script>

<template>
  <div class="fixed bottom-64 md:bottom-0 left-0 right-0 z-40 bg-amber-500 text-white flex items-center justify-between px-16 py-10 shadow-lg">
    <span class="text-sm font-medium">
      Back online · {{ count }} {{ count === 1 ? 'draft' : 'drafts' }} ready to sync
    </span>
    <div class="flex items-center gap-8">
      <button
        data-testid="sync-btn"
        class="text-sm font-semibold underline hover:no-underline"
        @click="onSync"
      >
        Sync now
      </button>
      <button
        data-testid="dismiss-btn"
        class="text-lg font-bold leading-none hover:opacity-75"
        aria-label="Dismiss"
        @click="onDismiss"
      >
        ×
      </button>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Run — confirm PASS**

```bash
npm run test:run -- ReconnectBanner
```

Expected: 3/3 PASS.

- [ ] **Step 5: Modify App.vue**

Read `src/App.vue` first.

Add to imports in `<script setup>`:
```typescript
import { useRouter } from 'vue-router'
import { useOfflineDrafts } from '@/composables/useOfflineDrafts'
import ReconnectBanner from '@/components/ui/ReconnectBanner.vue'
```

Note: `watch` and `ref` are already imported in App.vue. Add only what's missing.

Add after existing refs:
```typescript
const router = useRouter()
const { pendingPosts, getAllPendingPosts } = useOfflineDrafts()
const showReconnectBanner = ref(false)

watch(() => appStore.isOnline, async (online, wasOnline) => {
  if (online && wasOnline === false) {
    await getAllPendingPosts()
    if (pendingPosts.value.length > 0) {
      showReconnectBanner.value = true
    }
  }
})

function handleSync() {
  showReconnectBanner.value = false
  router.push('/drafts')
}
```

In template, add `<ReconnectBanner>` just before `<BottomNav>`:
```html
<ReconnectBanner
  v-if="showReconnectBanner && shouldShowNav"
  :count="pendingPosts.length"
  :on-sync="handleSync"
  :on-dismiss="() => (showReconnectBanner = false)"
/>
```

- [ ] **Step 6: Run all tests**

```bash
npm run test:run
```

Expected: All tests pass.

- [ ] **Step 7: Lint**

```bash
npm run lint
```

Expected: 0 errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/ReconnectBanner.vue src/App.vue tests/unit/components/ReconnectBanner.spec.ts
git commit -m "feat: add reconnect banner for pending offline drafts"
```
