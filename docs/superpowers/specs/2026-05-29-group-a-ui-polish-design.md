# Group A — UI Polish Design Spec

**Date:** 2026-05-29
**Status:** Approved
**Milestone:** M5 — Polish & PWA

---

## Scope

Two self-contained UI polish tasks:

1. **EmptyState component** — reusable `EmptyState.vue` replacing 11 inline empty state blocks across views
2. **Favorites sort** — client-side sort toggle (Date / City / Artist) in `FavoritesPage.vue`

---

## 1. EmptyState Component

### Problem
11 views each contain hand-rolled empty state HTML with no consistent structure, icon style, spacing, or copy. Some use emoji, some use inline SVG, some have CTAs, some don't.

### Solution
Single `src/components/ui/EmptyState.vue` component. All views replace their inline block with `<EmptyState ...props />`.

### Dependency
Install `vue-awesome` v4.x (Vue 3 compatible) as a runtime dependency:
```bash
npm install vue-awesome
```

### Component API

```typescript
// Props
interface Props {
  icon: string          // Font Awesome icon name, e.g. 'heart', 'map-marker-alt'
  title: string         // Required — bold heading
  description?: string  // Optional — muted subtitle text
  ctaLabel?: string     // Optional — if provided, renders a BaseButton
  ctaTo?: string        // Optional — router-link path for CTA button
}
```

### Component Structure
```
[centered column]
  [icon — 48×48, text-text-muted]
  [title — text-lg font-bold text-text]
  [description — text-sm text-text-muted] (if provided)
  [BaseButton → ctaTo] (if ctaLabel + ctaTo provided)
```

### Icon Map (per view)

| View | `icon` prop | `ctaLabel` | `ctaTo` |
|------|-------------|-----------|---------|
| FavoritesPage | `heart` | `"Find a mural"` | `/discover` |
| CollectionsPage | `folder` | — | — |
| CollectionDetailPage (owner) | `images` | — | — |
| CollectionDetailPage (visitor) | `images` | — | — |
| FriendsPage | `users` | — | — |
| NotificationsPage | `bell` | — | — |
| TrendingPage | `fire` | — | — |
| DraftsPage | `file-alt` | `"Upload Mural"` | `/upload` |
| ActivityPage | `stream` | — | — |
| ProfilePage (no posts) | `camera` | — | — |
| SearchPage (no query) | `search` | — | — |
| HomePage (empty feed) | `map-marker-alt` | `"Explore Map"` | `/map` |

### Copy per view (title / description)

| View | title | description |
|------|-------|-------------|
| FavoritesPage | `"Nothing saved yet"` | `"Find a mural worth keeping."` |
| CollectionsPage | `"No collections yet"` | `"Group your favorite murals into collections."` |
| CollectionDetailPage (owner) | `"No murals yet"` | `"Add murals to this collection from the mural detail pages."` |
| CollectionDetailPage (visitor) | `"This collection is empty"` | — |
| FriendsPage | `"No friends yet"` | `"Search for users to connect with."` |
| NotificationsPage (unread) | `"No unread notifications"` | — |
| NotificationsPage (all) | `"No notifications yet"` | — |
| TrendingPage | `"No trending posts yet"` | `"Check back soon."` |
| DraftsPage | `"No drafts yet"` | `"Start uploading murals and save them as drafts when you're offline."` |
| ActivityPage | `"No activity yet"` | `"Activity from friends will appear here."` |
| ProfilePage | `"No posts yet"` | — |
| SearchPage | `"Search for murals"` | `"Try a city, artist, or tag."` |
| HomePage | `"No murals nearby"` | `"Be the first to add one."` |

### Registering vue-awesome
Register globally in `src/main.ts`:
```typescript
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { FaHeart, FaFolder, FaImages, FaUsers, FaBell, FaFire, FaFileAlt, FaStream, FaCamera, FaSearch, FaMapMarkerAlt } from 'oh-vue-icons/icons'

addIcons(FaHeart, FaFolder, FaImages, FaUsers, FaBell, FaFire, FaFileAlt, FaStream, FaCamera, FaSearch, FaMapMarkerAlt)
app.component('VIcon', OhVueIcon)
```

> **Note:** `oh-vue-icons` is the actively maintained Vue 3 fork of `vue-awesome`. Use `oh-vue-icons` instead of `vue-awesome` (which is Vue 2 only for v4+). Install: `npm install oh-vue-icons`.

---

## 2. Favorites Sort

### Problem
FavoritesPage hardcodes `order('created_at', { ascending: false })` — no sort controls, violating PRD AC-04 (US-19).

### Solution
Client-side computed sort on already-fetched data. No refetch needed.

### Sort Options
| Label | Key | Sort Logic |
|-------|-----|-----------|
| Date Favorited | `'date'` | default — preserve fetch order (desc by favorite `created_at`) |
| City (A–Z) | `'city'` | `post.city ?? '' ` alphabetical |
| Artist (A–Z) | `'artist'` | `post.user?.display_name ?? post.user?.username ?? ''` alphabetical |

### Data Change
Current Supabase query discards the favorite's own `created_at`. Must retain it for date sort:

```typescript
// Add favorites_created_at to each post object
.map((row: any) => ({
  ...row.post,
  favorites_created_at: row.created_at,  // favorite row timestamp
  ...
}))
```

### Sort Computed
```typescript
const sortBy = ref<'date' | 'city' | 'artist'>('date')

const sortedPosts = computed(() => {
  const list = [...posts.value]
  if (sortBy.value === 'city') {
    return list.sort((a, b) => (a.city ?? '').localeCompare(b.city ?? ''))
  }
  if (sortBy.value === 'artist') {
    const name = (p: Post) => p.user?.display_name ?? p.user?.username ?? ''
    return list.sort((a, b) => name(a).localeCompare(name(b)))
  }
  return list // already sorted by favorites_created_at desc from query
})
```

### UI
3-button toggle in sticky header, right-aligned next to "Favorites" title:
```
[Favorites]              [Date ▾] [City ▾] [Artist ▾]
```
Active button: `bg-primary text-white`. Inactive: `bg-surface-elevated text-text-muted border border-border`.

---

## File Map

| File | Action |
|------|--------|
| `src/components/ui/EmptyState.vue` | Create |
| `src/main.ts` | Modify — register oh-vue-icons globally |
| `src/views/FavoritesPage.vue` | Modify — use EmptyState + add sort |
| `src/views/CollectionsPage.vue` | Modify — use EmptyState |
| `src/views/CollectionDetailPage.vue` | Modify — use EmptyState |
| `src/views/FriendsPage.vue` | Modify — use EmptyState |
| `src/views/NotificationsPage.vue` | Modify — use EmptyState |
| `src/views/TrendingPage.vue` | Modify — use EmptyState |
| `src/views/DraftsPage.vue` | Modify — use EmptyState |
| `src/views/ActivityPage.vue` | Modify — use EmptyState |
| `src/views/ProfilePage.vue` | Modify — use EmptyState |
| `src/views/SearchPage.vue` | Modify — use EmptyState |
| `src/views/HomePage.vue` | Modify — use EmptyState |
| `package.json` | Modify — add oh-vue-icons dep |

---

## Out of Scope
- Animated/lottie illustrated empty states (future polish)
- Search results empty state (separate concern — when query has no results)
- Sort persistence across sessions (localStorage) — not in PRD
