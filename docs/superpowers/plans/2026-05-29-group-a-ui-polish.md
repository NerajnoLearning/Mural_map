# Group A — UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable `EmptyState` component using oh-vue-icons, replace 10 inline empty states across views, and add a client-side sort toggle (Date / City / Artist) to FavoritesPage.

**Architecture:** `EmptyState.vue` is a dumb presentational component registered globally via `oh-vue-icons`. Views import it and pass props; no store changes needed. Favorites sort is a client-side `computed` over already-fetched data — no additional Supabase queries.

**Tech Stack:** Vue 3, TypeScript, TailwindCSS, oh-vue-icons (Font Awesome 5 Free), vue-router RouterLink, @vue/test-utils + Vitest

---

## File Map

| File | Action |
|------|--------|
| `src/components/ui/EmptyState.vue` | Create |
| `src/main.ts` | Modify — register OhVueIcon globally + addIcons |
| `tests/unit/components/EmptyState.spec.ts` | Create |
| `src/views/FavoritesPage.vue` | Modify — EmptyState + sort toggle + fetch fix |
| `src/views/CollectionsPage.vue` | Modify — EmptyState |
| `src/views/CollectionDetailPage.vue` | Modify — EmptyState |
| `src/views/FriendsPage.vue` | Modify — EmptyState |
| `src/views/NotificationsPage.vue` | Modify — EmptyState |
| `src/views/TrendingPage.vue` | Modify — EmptyState |
| `src/views/DraftsPage.vue` | Modify — EmptyState |
| `src/views/ActivityPage.vue` | Modify — EmptyState |
| `src/views/ProfilePage.vue` | Modify — EmptyState |
| `src/views/SearchPage.vue` | Modify — EmptyState |
| `package.json` | Modify — add oh-vue-icons |

---

## Task 1: EmptyState Component + oh-vue-icons

**Files:**
- Create: `src/components/ui/EmptyState.vue`
- Create: `tests/unit/components/EmptyState.spec.ts`
- Modify: `src/main.ts`
- Modify: `package.json`

- [ ] **Step 1: Install oh-vue-icons**

```bash
npm install oh-vue-icons
```

Expected: `oh-vue-icons` added to `dependencies` in `package.json`.

- [ ] **Step 2: Write failing tests**

Create `tests/unit/components/EmptyState.spec.ts`:

```typescript
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
```

- [ ] **Step 3: Run tests — confirm they fail**

```bash
npm run test:run -- EmptyState
```

Expected: FAIL — `EmptyState.vue` not found.

- [ ] **Step 4: Create `src/components/ui/EmptyState.vue`**

```vue
<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface Props {
  icon: string
  title: string
  description?: string
  ctaLabel?: string
  ctaTo?: string
}

withDefaults(defineProps<Props>(), {
  description: undefined,
  ctaLabel: undefined,
  ctaTo: undefined,
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-64 text-center px-16">
    <v-icon
      :name="icon"
      scale="3"
      class="text-text-muted mb-16"
    />
    <h3 class="text-lg font-bold text-text mb-8">
      {{ title }}
    </h3>
    <p
      v-if="description"
      data-testid="description"
      class="text-text-muted text-sm mb-24 max-w-xs"
    >
      {{ description }}
    </p>
    <RouterLink
      v-if="ctaLabel && ctaTo"
      :to="ctaTo"
      class="inline-flex px-24 py-12 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium text-sm"
    >
      {{ ctaLabel }}
    </RouterLink>
  </div>
</template>
```

- [ ] **Step 5: Register oh-vue-icons globally in `src/main.ts`**

Add after the existing imports at the top of `src/main.ts`:

```typescript
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import {
  FaHeart, FaFolder, FaCamera, FaUsers, FaBell,
  FaFire, FaFileAlt, FaHistory, FaSearch,
} from 'oh-vue-icons/icons'

addIcons(FaHeart, FaFolder, FaCamera, FaUsers, FaBell, FaFire, FaFileAlt, FaHistory, FaSearch)
```

Then register the component on the `app` instance, just before `app.use(router)`:

```typescript
app.component('VIcon', OhVueIcon)
```

- [ ] **Step 6: Run tests — confirm they pass**

```bash
npm run test:run -- EmptyState
```

Expected: 5/5 PASS.

- [ ] **Step 7: Confirm lint passes**

```bash
npm run lint
```

Expected: 0 errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/EmptyState.vue src/main.ts tests/unit/components/EmptyState.spec.ts package.json package-lock.json
git commit -m "feat: add EmptyState component with oh-vue-icons"
```

---

## Task 2: Replace Empty States — Batch 1 (FavoritesPage, CollectionsPage, CollectionDetailPage, FriendsPage, NotificationsPage)

**Files:**
- Modify: `src/views/FavoritesPage.vue`
- Modify: `src/views/CollectionsPage.vue`
- Modify: `src/views/CollectionDetailPage.vue`
- Modify: `src/views/FriendsPage.vue`
- Modify: `src/views/NotificationsPage.vue`

> For each view: add `EmptyState` import to `<script setup>`, replace the inline empty state `<div>` block with `<EmptyState ... />`.

### FavoritesPage.vue

- [ ] **Step 1: Update `src/views/FavoritesPage.vue` script — add EmptyState import**

In the `<script setup>` block, add after existing imports:

```typescript
import EmptyState from '@/components/ui/EmptyState.vue'
```

- [ ] **Step 2: Replace inline empty state in FavoritesPage template**

Find and replace the entire empty state `<div>` block (starts with `v-if="!loading && posts.length === 0 && !error"`):

```html
<!-- Empty state -->
<EmptyState
  v-if="!loading && posts.length === 0 && !error"
  icon="fa-heart"
  title="Nothing saved yet"
  description="Find a mural worth keeping."
  cta-label="Find a mural"
  cta-to="/discover"
/>
```

### CollectionsPage.vue

- [ ] **Step 3: Update `src/views/CollectionsPage.vue`**

Add import in `<script setup>`:
```typescript
import EmptyState from '@/components/ui/EmptyState.vue'
```

Find the inline block showing "No collections yet" and replace with:
```html
<EmptyState
  v-if="!collectionsStore.loading && collectionsStore.collections.length === 0"
  icon="fa-folder"
  title="No collections yet"
  description="Group your favorite murals into collections."
/>
```

> Keep whatever `v-if` condition currently wraps the existing empty state block — only replace the inner HTML.

### CollectionDetailPage.vue

- [ ] **Step 4: Update `src/views/CollectionDetailPage.vue`**

Add import in `<script setup>`:
```typescript
import EmptyState from '@/components/ui/EmptyState.vue'
```

Find the block showing "No murals yet" (around line 306) and replace with:
```html
<EmptyState
  icon="fa-camera"
  :title="isOwner ? 'No murals yet' : 'This collection is empty'"
  :description="isOwner ? 'Add murals to this collection from the mural detail pages.' : undefined"
/>
```

> Keep the same `v-if` condition that wraps the existing block.

### FriendsPage.vue

- [ ] **Step 5: Update `src/views/FriendsPage.vue`**

Add import in `<script setup>`:
```typescript
import EmptyState from '@/components/ui/EmptyState.vue'
```

Find the block showing "No friends yet" (around line 211) and replace with:
```html
<EmptyState
  icon="fa-users"
  title="No friends yet"
  description="Search for users to add friends."
  cta-label="Find Friends"
  cta-to="/search"
/>
```

> Remove the `<BaseButton>` CTA that called `router.push('/search')` — the EmptyState CTA replaces it. Remove unused `router` import if it was only used there.

### NotificationsPage.vue

- [ ] **Step 6: Update `src/views/NotificationsPage.vue`**

Add import in `<script setup>`:
```typescript
import EmptyState from '@/components/ui/EmptyState.vue'
```

Find the block showing `activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'` and replace with:
```html
<EmptyState
  icon="fa-bell"
  :title="activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'"
  :description="activeTab === 'unread' ? 'You\'re all caught up!' : 'When someone interacts with your content, you\'ll see it here.'"
/>
```

> Keep the same `v-else-if` condition.

- [ ] **Step 7: Run lint**

```bash
npm run lint
```

Expected: 0 errors.

- [ ] **Step 8: Run unit tests**

```bash
npm run test:run
```

Expected: All existing tests pass. No regressions.

- [ ] **Step 9: Commit**

```bash
git add src/views/FavoritesPage.vue src/views/CollectionsPage.vue src/views/CollectionDetailPage.vue src/views/FriendsPage.vue src/views/NotificationsPage.vue
git commit -m "feat: replace inline empty states with EmptyState component (batch 1)"
```

---

## Task 3: Replace Empty States — Batch 2 (TrendingPage, DraftsPage, ActivityPage, ProfilePage, SearchPage)

**Files:**
- Modify: `src/views/TrendingPage.vue`
- Modify: `src/views/DraftsPage.vue`
- Modify: `src/views/ActivityPage.vue`
- Modify: `src/views/ProfilePage.vue`
- Modify: `src/views/SearchPage.vue`

### TrendingPage.vue

- [ ] **Step 1: Update `src/views/TrendingPage.vue`**

Add import in `<script setup>`:
```typescript
import EmptyState from '@/components/ui/EmptyState.vue'
```

Find block showing "No trending posts yet" and replace with:
```html
<EmptyState
  icon="fa-fire"
  title="No trending posts yet"
  description="Check back soon to see what's hot in the community."
  cta-label="Explore All Posts"
  cta-to="/discover"
/>
```

> Keep the same `v-else-if` condition (`trendingPosts.length === 0`).

### DraftsPage.vue

- [ ] **Step 2: Update `src/views/DraftsPage.vue`**

Add import in `<script setup>`:
```typescript
import EmptyState from '@/components/ui/EmptyState.vue'
```

Find block showing "No drafts yet" with the 📝 emoji and replace with:
```html
<EmptyState
  icon="fa-file-alt"
  title="No drafts yet"
  description="Start uploading murals and save them as drafts when you're offline."
  cta-label="Upload Mural"
  cta-to="/upload"
/>
```

> Keep the same `v-else-if` condition.

### ActivityPage.vue

- [ ] **Step 3: Update `src/views/ActivityPage.vue`**

Add import in `<script setup>`:
```typescript
import EmptyState from '@/components/ui/EmptyState.vue'
```

Find block showing "No activity yet" with the 👥 emoji and replace with:
```html
<EmptyState
  icon="fa-history"
  title="No activity yet"
  description="Connect with friends to see their activity here."
  cta-label="Find Friends"
  cta-to="/search"
/>
```

> Keep the same `v-else-if` condition (`activityStore.activities.length === 0`).

### ProfilePage.vue

- [ ] **Step 4: Update `src/views/ProfilePage.vue`**

Add import in `<script setup>`:
```typescript
import EmptyState from '@/components/ui/EmptyState.vue'
```

Find block showing "No posts yet" and replace with:
```html
<EmptyState
  icon="fa-camera"
  title="No posts yet"
  :description="isOwnProfile ? 'Share your first mural to get started!' : 'This user hasn\'t posted any murals yet.'"
/>
```

> Keep the same `v-if` condition that wraps the existing block.

### SearchPage.vue

- [ ] **Step 5: Update `src/views/SearchPage.vue`**

Add import in `<script setup>`:
```typescript
import EmptyState from '@/components/ui/EmptyState.vue'
```

Find block showing "Start searching" (the no-query state at around line 144) and replace with:
```html
<EmptyState
  v-if="!searchQuery"
  icon="fa-search"
  title="Search for murals"
  description="Try a city, artist, or tag."
/>
```

- [ ] **Step 6: Run lint**

```bash
npm run lint
```

Expected: 0 errors.

- [ ] **Step 7: Run unit tests**

```bash
npm run test:run
```

Expected: All tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/views/TrendingPage.vue src/views/DraftsPage.vue src/views/ActivityPage.vue src/views/ProfilePage.vue src/views/SearchPage.vue
git commit -m "feat: replace inline empty states with EmptyState component (batch 2)"
```

---

## Task 4: Favorites Sort (Date / City / Artist)

**Files:**
- Modify: `src/views/FavoritesPage.vue`

- [ ] **Step 1: Write failing test for sort logic**

Create `tests/unit/components/FavoritesSort.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest'

type SortablePost = {
  city?: string
  favorites_created_at?: string
  user?: { display_name?: string; username?: string }
}

function sortPosts(posts: SortablePost[], sortBy: 'date' | 'city' | 'artist'): SortablePost[] {
  const list = [...posts]
  if (sortBy === 'city') {
    return list.sort((a, b) => (a.city ?? '').localeCompare(b.city ?? ''))
  }
  if (sortBy === 'artist') {
    const name = (p: SortablePost) => p.user?.display_name ?? p.user?.username ?? ''
    return list.sort((a, b) => name(a).localeCompare(name(b)))
  }
  return list
}

const posts: SortablePost[] = [
  { city: 'Miami', user: { display_name: 'Zara' }, favorites_created_at: '2024-01-03' },
  { city: 'Atlanta', user: { display_name: 'Abel' }, favorites_created_at: '2024-01-01' },
  { city: 'Brooklyn', user: { display_name: 'Maya' }, favorites_created_at: '2024-01-02' },
]

describe('favorites sort', () => {
  it('date sort preserves original order', () => {
    const result = sortPosts(posts, 'date')
    expect(result[0].city).toBe('Miami')
    expect(result[1].city).toBe('Atlanta')
    expect(result[2].city).toBe('Brooklyn')
  })

  it('city sort sorts A-Z', () => {
    const result = sortPosts(posts, 'city')
    expect(result[0].city).toBe('Atlanta')
    expect(result[1].city).toBe('Brooklyn')
    expect(result[2].city).toBe('Miami')
  })

  it('artist sort sorts A-Z by display_name', () => {
    const result = sortPosts(posts, 'artist')
    expect(result[0].user?.display_name).toBe('Abel')
    expect(result[1].user?.display_name).toBe('Maya')
    expect(result[2].user?.display_name).toBe('Zara')
  })

  it('artist sort falls back to username when display_name missing', () => {
    const fallback: SortablePost[] = [
      { user: { username: 'zuser' } },
      { user: { username: 'auser' } },
    ]
    const result = sortPosts(fallback, 'artist')
    expect(result[0].user?.username).toBe('auser')
  })

  it('city sort handles missing city', () => {
    const withMissing: SortablePost[] = [
      { city: 'Miami' },
      { city: undefined },
      { city: 'Atlanta' },
    ]
    const result = sortPosts(withMissing, 'city')
    expect(result[0].city).toBeUndefined()
    expect(result[1].city).toBe('Atlanta')
    expect(result[2].city).toBe('Miami')
  })
})
```

- [ ] **Step 2: Run — confirm FAIL**

```bash
npm run test:run -- FavoritesSort
```

Expected: FAIL — `FavoritesSort.spec.ts` imports nothing that exists yet. Tests should fail with import errors or assertion errors.

> Note: These tests validate pure sort logic. The `sortPosts` function is defined inline in the test — once the plan is verified, that logic moves into the component as a computed. This pattern lets you validate logic before wiring it to Vue reactivity.

- [ ] **Step 3: Confirm tests pass (sort logic is correct)**

The test file is self-contained — run it:

```bash
npm run test:run -- FavoritesSort
```

Expected: 5/5 PASS (the logic in the test file itself is correct).

- [ ] **Step 4: Update `src/views/FavoritesPage.vue` — script changes**

Replace the entire `<script setup>` block with:

```typescript
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import MasonryGrid from '@/components/feed/MasonryGrid.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import type { Post } from '@/types'
import { createLogger } from '@/utils/logger'

const logger = createLogger('FavoritesPage')
const authStore = useAuthStore()

const posts = ref<Post[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const sortBy = ref<'date' | 'city' | 'artist'>('date')

const sortedPosts = computed(() => {
  const list = [...posts.value]
  if (sortBy.value === 'city') {
    return list.sort((a, b) => (a.city ?? '').localeCompare(b.city ?? ''))
  }
  if (sortBy.value === 'artist') {
    const name = (p: Post) => (p.user as any)?.display_name ?? (p.user as any)?.username ?? ''
    return list.sort((a, b) => name(a).localeCompare(name(b)))
  }
  return list // date: preserve fetch order (desc by favorite created_at)
})

async function fetchFavorites() {
  loading.value = true
  error.value = null
  try {
    const client = await authStore.getAuthenticatedClient()
    const { data, error: err } = await client
      .from('favorites')
      .select(`
        created_at,
        post:posts(
          *,
          user:users(id, username, display_name, avatar_url),
          tags:post_tags(tag:tags(id, label)),
          favorites_count:favorites(count),
          comments_count:comments(count)
        )
      `)
      .order('created_at', { ascending: false })

    if (err) throw err

    posts.value = (data ?? [])
      .filter((row: any) => row.post)
      .map((row: any) => ({
        ...row.post,
        favorites_created_at: row.created_at,
        is_favorited: true,
        favorites_count: row.post.favorites_count?.[0]?.count ?? 0,
        comments_count: row.post.comments_count?.[0]?.count ?? 0,
      }))
  } catch (err) {
    logger.error('Error fetching favorites:', err)
    error.value = 'Failed to load favorites.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchFavorites)
</script>
```

- [ ] **Step 5: Update `src/views/FavoritesPage.vue` — template changes**

Replace the entire `<template>` block with:

```html
<template>
  <div class="min-h-screen bg-surface">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-surface border-b-2 border-border px-16 py-12">
      <div class="flex items-center justify-between gap-12">
        <h1 class="text-xl font-bold text-text">
          Favorites
        </h1>

        <!-- Sort toggle — only show when there are posts -->
        <div
          v-if="posts.length > 0"
          class="flex gap-4"
        >
          <button
            v-for="option in [
              { key: 'date', label: 'Date' },
              { key: 'city', label: 'City' },
              { key: 'artist', label: 'Artist' },
            ]"
            :key="option.key"
            class="px-10 py-4 rounded-md text-xs font-medium transition border"
            :class="sortBy === option.key
              ? 'bg-primary text-white border-primary'
              : 'bg-surface-elevated text-text-muted border-border hover:border-primary'"
            @click="sortBy = option.key as 'date' | 'city' | 'artist'"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="p-16">
      <!-- Error -->
      <div
        v-if="error"
        class="text-center py-48 text-error text-sm"
      >
        {{ error }}
      </div>

      <!-- Grid -->
      <MasonryGrid
        v-else
        :posts="sortedPosts"
        :loading="loading"
      />

      <!-- Empty state -->
      <EmptyState
        v-if="!loading && posts.length === 0 && !error"
        icon="fa-heart"
        title="Nothing saved yet"
        description="Find a mural worth keeping."
        cta-label="Find a mural"
        cta-to="/discover"
      />
    </div>
  </div>
</template>
```

- [ ] **Step 6: Run lint**

```bash
npm run lint
```

Expected: 0 errors.

- [ ] **Step 7: Run all tests**

```bash
npm run test:run
```

Expected: All tests pass including `FavoritesSort.spec.ts` and `EmptyState.spec.ts`.

- [ ] **Step 8: Commit**

```bash
git add src/views/FavoritesPage.vue tests/unit/components/FavoritesSort.spec.ts
git commit -m "feat: add favorites sort (Date/City/Artist) with client-side computed"
```

---

## Self-Review

**Spec coverage:**
- [x] `EmptyState.vue` created with `icon`, `title`, `description`, `ctaLabel`, `ctaTo` props
- [x] oh-vue-icons installed and registered globally
- [x] All 10 views updated: FavoritesPage, CollectionsPage, CollectionDetailPage, FriendsPage, NotificationsPage, TrendingPage, DraftsPage, ActivityPage, ProfilePage, SearchPage
- [x] Conditional empty states handled: CollectionDetailPage (isOwner), NotificationsPage (activeTab), ProfilePage (isOwnProfile)
- [x] Favorites sort: Date / City / Artist toggle in header
- [x] `favorites_created_at` retained from Supabase join row for correct date sort
- [x] Sort only shown when posts exist (no toggle on empty page)

**No placeholders:** All steps contain exact code.

**Type consistency:** `sortBy` typed as `'date' | 'city' | 'artist'` consistently. `Post` type used from `@/types`. `favorites_created_at` is a non-standard field added at runtime — cast via `any` to avoid type errors without modifying the shared `Post` interface.

**Gaps checked:**
- FavoritesPage already had EmptyState swap in Task 2 Batch 1 — Task 4 replaces that full file with the sort version. The Batch 1 commit for FavoritesPage is superseded by Task 4's commit. This is fine — the plan is sequential and Task 4 produces the final correct state.
- `oh-vue-icons/icons` imports FA5 Free icons only. Icons used (`FaHeart`, `FaFolder`, `FaCamera`, `FaUsers`, `FaBell`, `FaFire`, `FaFileAlt`, `FaHistory`, `FaSearch`) are all FA5 Free. `FaStream` and `FaImages` (Pro only) were deliberately replaced with `FaHistory` and `FaCamera`.
