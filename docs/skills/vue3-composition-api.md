# Vue 3 Composition API

## Overview
The Composition API is Vue 3's modern approach to component logic organization, replacing the Options API. It provides better TypeScript support, improved code reusability, and more flexible logic composition.

---

## Key Concepts Used in MuralMap

### 1. `<script setup>` Syntax
The most concise way to write Composition API code.

**Example from `NotificationsPage.vue`:**
```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const router = useRouter()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

const activeTab = ref<'all' | 'unread'>('all')

const filteredNotifications = computed(() => {
  if (activeTab.value === 'unread') {
    return notificationsStore.notifications.filter(n => !n.read)
  }
  return notificationsStore.notifications
})

onMounted(async () => {
  if (!authStore.user) {
    router.push('/auth/signin')
    return
  }
  await notificationsStore.fetchNotifications(authStore.user.id)
})
</script>
```

**Benefits:**
- No need for `export default`
- Auto-imported refs are reactive
- Top-level variables are exposed to template
- Better TypeScript inference

---

### 2. Reactive References (`ref` and `reactive`)

**`ref()` for primitive values:**
```typescript
const loading = ref(false)
const count = ref(0)
const message = ref('Hello')

// Access/modify with .value
loading.value = true
count.value++
```

**`reactive()` for objects:**
```typescript
const state = reactive({
  posts: [],
  loading: false,
  error: null
})

// Access directly (no .value)
state.loading = true
state.posts.push(newPost)
```

**From `PostDetailPage.vue`:**
```typescript
const post = ref<Post | null>(null)
const loading = ref(true)
const isFavoriting = ref(false)
const showDeleteConfirm = ref(false)
```

---

### 3. Computed Properties

Derived state that automatically updates when dependencies change.

**Example from `ActivityPage.vue`:**
```typescript
const filteredNotifications = computed(() => {
  if (activeTab.value === 'unread') {
    return notificationsStore.notifications.filter(n => !n.read)
  }
  return notificationsStore.notifications
})
```

**Benefits:**
- Cached until dependencies change
- Read-only by default
- Better performance than methods

---

### 4. Lifecycle Hooks

**Common hooks used:**
```typescript
onMounted(() => {
  // Runs after component is mounted
  loadData()
})

onUnmounted(() => {
  // Cleanup when component is destroyed
  observer.value?.disconnect()
})

onBeforeUnmount(() => {
  // Before unmounting
  cleanup()
})
```

**Example from `ActivityPage.vue`:**
```typescript
onMounted(async () => {
  if (!authStore.user) {
    router.push('/auth/signin')
    return
  }

  await activityStore.fetchFriendActivity(authStore.user.id)

  // Setup intersection observer
  observer.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    },
    { threshold: 0.5 }
  )
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})
```

---

### 5. Composables (Custom Hooks)

Reusable logic extracted into functions.

**Example: `useOfflineDrafts.ts`**
```typescript
export function useOfflineDrafts() {
  const drafts = ref<Draft[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const saveDraft = async (draft: Draft) => {
    // ... implementation
  }

  const getAllDrafts = async () => {
    // ... implementation
  }

  return {
    drafts,
    loading,
    error,
    saveDraft,
    getAllDrafts
  }
}
```

**Usage:**
```typescript
const { drafts, loading, saveDraft } = useOfflineDrafts()
```

---

### 6. Watch and WatchEffect

Monitor reactive data and respond to changes.

**`watch()` - explicit dependencies:**
```typescript
watch(searchQuery, (newQuery, oldQuery) => {
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value)
  }

  debounceTimeout.value = window.setTimeout(() => {
    performSearch(newQuery)
  }, 300)
})
```

**`watchEffect()` - automatic dependencies:**
```typescript
watchEffect(() => {
  // Automatically tracks dependencies
  if (user.value) {
    loadUserData(user.value.id)
  }
})
```

---

### 7. Props and Emits

**Defining props:**
```typescript
const props = defineProps<{
  postId: string
  showActions?: boolean
}>()

// Or with defaults
const props = withDefaults(defineProps<{
  limit?: number
  sortBy?: 'recent' | 'popular'
}>(), {
  limit: 20,
  sortBy: 'recent'
})
```

**Defining emits:**
```typescript
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update', value: string): void
  (e: 'delete', id: string): void
}>()

// Usage
emit('close')
emit('update', newValue)
emit('delete', itemId)
```

**Example from `AddToCollectionModal.vue`:**
```typescript
const props = defineProps<{
  postId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'added'): void
}>()

const handleAdd = () => {
  // ... add logic
  emit('added')
  emit('close')
}
```

---

## Common Patterns in MuralMap

### Pattern 1: Loading States
```typescript
const loading = ref(true)
const data = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    loading.value = true
    data.value = await fetchData()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
```

### Pattern 2: Form Handling
```typescript
const form = reactive({
  title: '',
  description: '',
  tags: []
})

const handleSubmit = async () => {
  const isValid = validateForm(form)
  if (!isValid) return

  await submitForm(form)
}
```

### Pattern 3: Infinite Scroll
```typescript
const observer = ref<IntersectionObserver | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)

onMounted(() => {
  observer.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore.value) {
        loadMore()
      }
    },
    { threshold: 0.5 }
  )

  if (loadMoreTrigger.value) {
    observer.value.observe(loadMoreTrigger.value)
  }
})

onUnmounted(() => {
  observer.value?.disconnect()
})
```

### Pattern 4: Store Integration
```typescript
const authStore = useAuthStore()
const postsStore = usePostsStore()

// Accessing state
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Calling actions
const handleLogin = async (credentials) => {
  await authStore.signIn(credentials)
}
```

---

## TypeScript Integration

### Typed Refs
```typescript
const user = ref<User | null>(null)
const posts = ref<Post[]>([])
const count = ref<number>(0)
```

### Typed Computed
```typescript
const fullName = computed<string>(() => {
  return `${firstName.value} ${lastName.value}`
})
```

### Typed Functions
```typescript
const handleClick = (event: MouseEvent): void => {
  console.log(event.target)
}

const fetchUser = async (id: string): Promise<User | null> => {
  const response = await api.getUser(id)
  return response.data
}
```

---

## Best Practices

### ✅ Do:
- Use `<script setup>` for cleaner code
- Extract reusable logic into composables
- Use computed for derived state
- Clean up side effects in `onUnmounted`
- Type your refs and props
- Keep components focused (single responsibility)

### ❌ Don't:
- Mix Options API and Composition API
- Forget `.value` when accessing refs
- Mutate props directly
- Create unnecessary watchers
- Put too much logic in components

---

## Resources

- [Vue 3 Composition API Docs](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Composition API Reference](https://vuejs.org/api/composition-api-setup.html)
- [Vue 3 + TypeScript Guide](https://vuejs.org/guide/typescript/composition-api.html)
- [VueUse - Composable Library](https://vueuse.org/)

---

## Examples in MuralMap

| File | Key Composition API Features |
|------|------------------------------|
| `NotificationsPage.vue` | `<script setup>`, refs, computed, lifecycle hooks |
| `useOfflineDrafts.ts` | Composable pattern, reactive state management |
| `PostDetailPage.vue` | Props, emits, async operations |
| `ActivityPage.vue` | Intersection Observer, infinite scroll |
| `SettingsPage.vue` | Reactive forms, tab state management |
