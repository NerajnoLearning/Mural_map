# Group C — Push Notification Primer Card Design Spec

**Date:** 2026-05-30
**Status:** Approved
**Milestone:** M5 — Polish & PWA

---

## Scope

Push notification primer card — a one-time dismissible prompt in `NotificationsPage` that encourages users to enable push notifications when they haven't yet.

> Note: Push notification toggle already exists in SettingsPage → Notifications tab. This primer is the missing discovery surface.

---

## Problem

Users rarely navigate to Settings to find the push toggle. Without a prompt on the Notifications page, push opt-in rate stays near zero.

## Solution

`PushPrimerCard.vue` — shown at the top of `NotificationsPage` when:
1. Push is supported in the browser (`'PushManager' in window`)
2. User is not yet subscribed (`isSubscribed()` returns false)
3. User has not previously dismissed it (no `push-primer-dismissed` key in localStorage)

## Component API

```typescript
interface Props {
  onEnable: () => Promise<void>   // calls subscribe(), hides card on success
  onDismiss: () => void           // sets localStorage flag, hides card
}
```

## Card UI

```
┌─────────────────────────────────────────────────┐
│ 🔔  Stay in the loop                            [×]│
│    Get notified about likes, comments,           │
│    and new murals from friends.                  │
│                                                  │
│         [Enable Notifications]                   │
└─────────────────────────────────────────────────┘
```

- Background: `bg-primary/10 border border-primary/20 rounded-lg p-16`
- Icon: bell emoji or inline SVG
- Title: `text-text font-semibold`
- Body: `text-sm text-text-muted`
- Enable button: `BaseButton variant="primary" size="sm"`
- Dismiss ×: top-right, `text-text-muted hover:text-text`

## Integration in NotificationsPage

```typescript
const { supported: pushSupported, isSubscribed, subscribe } = usePushNotifications()
const showPrimer = ref(false)

onMounted(async () => {
  // ... existing fetch/subscribe code ...
  if (pushSupported && !(await isSubscribed()) && !localStorage.getItem('push-primer-dismissed')) {
    showPrimer.value = true
  }
})

async function handlePrimerEnable() {
  const ok = await subscribe()
  if (ok) showPrimer.value = false
}

function handlePrimerDismiss() {
  localStorage.setItem('push-primer-dismissed', '1')
  showPrimer.value = false
}
```

Primer renders above the tab bar, below the header.

## File Map

| File | Action |
|------|--------|
| `src/components/ui/PushPrimerCard.vue` | Create |
| `src/views/NotificationsPage.vue` | Modify — add primer logic + render |
