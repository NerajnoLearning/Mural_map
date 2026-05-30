# Group B — Draft Badge + Reconnect Banner Design Spec

**Date:** 2026-05-30
**Status:** Approved
**Milestone:** M5 — Polish & PWA

---

## Scope

Two self-contained offline-aware UI features:

1. **Draft count badge** — numeric badge on Upload nav button showing count of saved drafts
2. **Reconnect banner** — dismissible banner shown when user comes back online with pending posts

---

## 1. Draft Count Badge

### Problem
Users save drafts offline but have no visual cue they exist. The Upload nav button is the closest entry point; no badge shows pending drafts.

### Solution
In `BottomNav.vue`, call `useOfflineDrafts()` on mount to load draft count. Show a badge on the Upload button when `drafts.length > 0`.

### Files
- Modify: `src/components/layout/BottomNav.vue`

### Logic
```typescript
const { drafts, getAllDrafts } = useOfflineDrafts()

onMounted(async () => {
  await getAllDrafts()
  // ... existing onMounted code
})
```

### Badge UI
Positioned absolute top-right of Upload icon circle, same pattern as notifications badge:
```html
<span
  v-if="drafts.length > 0"
  class="absolute -top-4 -right-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-[10px] font-bold z-10"
>
  {{ drafts.length > 9 ? '9+' : drafts.length }}
</span>
```

Badge color: `bg-primary` (orange) — differentiates from notifications badge (`bg-error`/red).

### Note
`getAllDrafts()` reads from IndexedDB. Does not make network requests. Safe to call on every nav mount.

---

## 2. Reconnect Banner

### Problem
When a user comes back online after being offline, pending posts (from `useOfflineDrafts().pendingPosts`) are silently waiting. No UI prompts sync.

### Solution
Global dismissible banner in `App.vue`. Watches `appStore.isOnline` — when it transitions `false → true`, checks `pendingPosts.length`. If > 0, shows banner.

### Files
- Create: `src/components/ui/ReconnectBanner.vue`
- Modify: `src/App.vue`

### ReconnectBanner Component API
```typescript
interface Props {
  count: number       // number of pending posts
  onSync: () => void  // navigate to /drafts
  onDismiss: () => void
}
```

### Banner UI
Sticky, full-width, above BottomNav. Amber/warning color:
```
[⚡ Back online · 2 drafts ready to sync]  [Sync →]  [×]
```

Classes: `bg-warning text-white` (or `bg-amber-500 text-white` if `warning` token unavailable).

Layout: `fixed bottom-64 md:bottom-0 left-0 right-0 z-40 flex items-center justify-between px-16 py-10`

### Trigger Logic (in App.vue)
```typescript
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
```

### Dismiss + Sync
- Dismiss: `showReconnectBanner.value = false`
- Sync (navigate to /drafts): `router.push('/drafts')` then dismiss

---

## File Map

| File | Action |
|------|--------|
| `src/components/layout/BottomNav.vue` | Modify — draft count badge on Upload button |
| `src/components/ui/ReconnectBanner.vue` | Create — banner component |
| `src/App.vue` | Modify — trigger + render ReconnectBanner |
