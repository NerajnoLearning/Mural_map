# Group C — Push Primer Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a one-time dismissible push notification primer card to NotificationsPage, shown when push is supported but not yet enabled.

**Architecture:** `PushPrimerCard.vue` is a dumb presentational component. `NotificationsPage.vue` owns show/hide logic via `usePushNotifications` and localStorage flag `push-primer-dismissed`.

**Tech Stack:** Vue 3, TypeScript, TailwindCSS, `usePushNotifications` composable, `BaseButton`

---

## File Map

| File | Action |
|------|--------|
| `src/components/ui/PushPrimerCard.vue` | Create |
| `src/views/NotificationsPage.vue` | Modify |

---

## Task 1: PushPrimerCard component + NotificationsPage integration

**Files:**
- Create: `src/components/ui/PushPrimerCard.vue`
- Modify: `src/views/NotificationsPage.vue`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/components/PushPrimerCard.spec.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PushPrimerCard from '@/components/ui/PushPrimerCard.vue'

// Stub BaseButton
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
```

- [ ] **Step 2: Run — confirm FAIL**

```bash
npm run test:run -- PushPrimerCard
```

Expected: FAIL — component not found.

- [ ] **Step 3: Create `src/components/ui/PushPrimerCard.vue`**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'

interface Props {
  onEnable: () => Promise<void>
  onDismiss: () => void
}

const props = defineProps<Props>()
const enabling = ref(false)

async function handleEnable() {
  enabling.value = true
  try {
    await props.onEnable()
  } finally {
    enabling.value = false
  }
}
</script>

<template>
  <div class="bg-primary/10 border border-primary/20 rounded-lg p-16 flex gap-12">
    <div class="flex-1">
      <p class="font-semibold text-text mb-4">
        🔔 Stay in the loop
      </p>
      <p class="text-sm text-text-muted mb-12">
        Get notified about likes, comments, and new murals from friends.
      </p>
      <BaseButton
        data-testid="primer-enable"
        variant="primary"
        size="sm"
        :loading="enabling"
        @click="handleEnable"
      >
        Enable Notifications
      </BaseButton>
    </div>
    <button
      data-testid="primer-dismiss"
      class="text-text-muted hover:text-text self-start text-xl leading-none"
      aria-label="Dismiss"
      @click="onDismiss"
    >
      ×
    </button>
  </div>
</template>
```

- [ ] **Step 4: Run — confirm PASS**

```bash
npm run test:run -- PushPrimerCard
```

Expected: 3/3 PASS.

- [ ] **Step 5: Modify NotificationsPage.vue**

Read `src/views/NotificationsPage.vue` first.

In `<script setup>`, add imports:
```typescript
import { usePushNotifications } from '@/composables/usePushNotifications'
import PushPrimerCard from '@/components/ui/PushPrimerCard.vue'
```

Add after existing refs:
```typescript
const { supported: pushSupported, isSubscribed, subscribe } = usePushNotifications()
const showPrimer = ref(false)
```

In the existing `onMounted` (the one that does `fetchNotifications`), add AFTER the fetch call:
```typescript
if (pushSupported && !(await isSubscribed()) && !localStorage.getItem('push-primer-dismissed')) {
  showPrimer.value = true
}
```

Add these functions after existing handlers:
```typescript
async function handlePrimerEnable() {
  const ok = await subscribe()
  if (ok) showPrimer.value = false
}

function handlePrimerDismiss() {
  localStorage.setItem('push-primer-dismissed', '1')
  showPrimer.value = false
}
```

In the template, add `<PushPrimerCard>` BETWEEN the sticky header and the tab bar (or just after the header `<div>`). Find the sticky header section, then add right after it closes:

```html
<!-- Push primer card -->
<div
  v-if="showPrimer"
  class="px-16 pt-16"
>
  <PushPrimerCard
    :on-enable="handlePrimerEnable"
    :on-dismiss="handlePrimerDismiss"
  />
</div>
```

- [ ] **Step 6: Run all tests + lint**

```bash
npm run lint
npm run test:run
```

Expected: 0 lint errors, all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/PushPrimerCard.vue src/views/NotificationsPage.vue tests/unit/components/PushPrimerCard.spec.ts
git commit -m "feat: add push notification primer card to NotificationsPage"
```
