# Pinia State Management

## Overview
Pinia is the official state management library for Vue 3, replacing Vuex. It provides a centralized store for shared state across components with TypeScript support, devtools integration, and a simpler API.

---

## Setup

### Installation & Configuration

**`src/main.ts`:**
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
```

---

## Store Structure in MuralMap

### 1. Auth Store (`src/stores/auth.ts`)

Complete authentication management with user session persistence.

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const loading = ref(false)

  // Getters (computed)
  const isAuthenticated = computed(() => user.value !== null)
  const userId = computed(() => user.value?.id || null)

  // Actions
  const signUp = async (email: string, password: string, displayName: string) => {
    loading.value = true
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError) throw authError

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user!.id,
          email: authData.user!.email,
          display_name: displayName
        }])

      if (profileError) throw profileError

      user.value = {
        id: authData.user!.id,
        email: authData.user!.email!,
        display_name: displayName,
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString()
      }
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email: string, password: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      user.value = userData
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    user.value = null
  }

  const initAuth = async () => {
    const { data } = await supabase.auth.getSession()

    if (data.session) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.session.user.id)
        .single()

      user.value = userData
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        user.value = userData
      } else {
        user.value = null
      }
    })
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user.value) return

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.value.id)
      .select()
      .single()

    if (error) throw error

    user.value = { ...user.value, ...data }
  }

  return {
    // State
    user,
    loading,
    // Getters
    isAuthenticated,
    userId,
    // Actions
    signUp,
    signIn,
    signOut,
    initAuth,
    updateProfile
  }
})
```

**Usage in Components:**
```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const handleSignIn = async () => {
  await authStore.signIn(email.value, password.value)
  router.push('/discover')
}
</script>

<template>
  <div v-if="authStore.isAuthenticated">
    Welcome, {{ authStore.user?.display_name }}!
  </div>
</template>
```

---

### 2. Posts Store (`src/stores/posts.ts`)

Manages all post-related data and operations.

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/types'

export const usePostsStore = defineStore('posts', () => {
  const posts = ref<Post[]>([])
  const loading = ref(false)
  const hasMore = ref(true)
  const currentPage = ref(1)

  const fetchPosts = async (page: number = 1, limit: number = 20) => {
    loading.value = true

    try {
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users!posts_user_id_fkey(id, display_name, avatar_url),
          favorites:favorites(user_id),
          comments:comments(count)
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      if (page === 1) {
        posts.value = data
      } else {
        posts.value = [...posts.value, ...data]
      }

      hasMore.value = data.length === limit
      currentPage.value = page
    } finally {
      loading.value = false
    }
  }

  const fetchPostById = async (id: string): Promise<Post | null> => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users!posts_user_id_fkey(*),
        favorites:favorites(user_id),
        comments:comments(*, user:users(*))
      `)
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  const createPost = async (post: Partial<Post>): Promise<Post | null> => {
    const { data, error } = await supabase
      .from('posts')
      .insert([post])
      .select(`
        *,
        user:users!posts_user_id_fkey(*)
      `)
      .single()

    if (error) throw error

    // Add to beginning of posts array
    posts.value.unshift(data)
    return data
  }

  const updatePost = async (id: string, updates: Partial<Post>) => {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Update in local state
    const index = posts.value.findIndex(p => p.id === id)
    if (index !== -1) {
      posts.value[index] = { ...posts.value[index], ...data }
    }

    return data
  }

  const deletePost = async (id: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Remove from local state
    posts.value = posts.value.filter(p => p.id !== id)
  }

  const searchPosts = async (query: string) => {
    loading.value = true

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, user:users(*)')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,artist.ilike.%${query}%`)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data
    } finally {
      loading.value = false
    }
  }

  const fetchTrendingPosts = async (limit: number = 10): Promise<Post[]> => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(*),
        favorites:favorites(created_at),
        comments:comments(created_at)
      `)
      .eq('visibility', 'public')
      .gte('created_at', sevenDaysAgo.toISOString())

    if (error) throw error

    // Calculate trending score
    const now = Date.now()
    const postsWithScores = data.map((post: any) => {
      const ageInHours = (now - new Date(post.created_at).getTime()) / (1000 * 60 * 60)
      const favoritesCount = post.favorites?.length || 0
      const commentsCount = post.comments?.length || 0
      const engagementScore = (favoritesCount * 2) + (commentsCount * 3)
      const trendingScore = engagementScore / Math.pow(ageInHours + 2, 1.5)

      return {
        ...post,
        trending_score: trendingScore
      }
    })

    return postsWithScores
      .sort((a, b) => b.trending_score - a.trending_score)
      .slice(0, limit)
  }

  const clear = () => {
    posts.value = []
    currentPage.value = 1
    hasMore.value = true
  }

  return {
    posts,
    loading,
    hasMore,
    currentPage,
    fetchPosts,
    fetchPostById,
    createPost,
    updatePost,
    deletePost,
    searchPosts,
    fetchTrendingPosts,
    clear
  }
})
```

---

### 3. Notifications Store (`src/stores/notifications.ts`)

Manages notifications with real-time updates.

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const loading = ref(false)

  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  const fetchNotifications = async (userId: string) => {
    loading.value = true

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:users!notifications_actor_id_fkey(id, display_name, avatar_url),
          post:posts(id, title, image_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      notifications.value = data
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    if (error) throw error

    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  const markAllAsRead = async (userId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error

    notifications.value.forEach(n => {
      n.read = true
    })
  }

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) throw error

    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  const createNotification = async (notification: Partial<Notification>) => {
    const { error } = await supabase
      .from('notifications')
      .insert([notification])

    if (error) throw error
  }

  const subscribeToNotifications = (userId: string) => {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          const { data } = await supabase
            .from('notifications')
            .select(`
              *,
              actor:users!notifications_actor_id_fkey(*),
              post:posts(*)
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            notifications.value.unshift(data)
          }
        }
      )
      .subscribe()
  }

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    subscribeToNotifications
  }
})
```

---

### 4. App Store (`src/stores/app.ts`)

Manages global app state like theme and toasts.

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

export const useAppStore = defineStore('app', () => {
  const theme = ref<'light' | 'dark'>('light')
  const toasts = ref<Toast[]>([])

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'

    setTheme(savedTheme || systemPreference)

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  const showToast = (message: string, type: Toast['type'] = 'info', duration = 3000) => {
    const id = Math.random().toString(36)
    const toast: Toast = { id, message, type, duration }

    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    theme,
    toasts,
    setTheme,
    initTheme,
    showToast,
    removeToast
  }
})
```

---

## Store Communication

### Using Multiple Stores Together

```typescript
// In a component
const authStore = useAuthStore()
const postsStore = usePostsStore()
const appStore = useAppStore()

const loadUserPosts = async () => {
  if (!authStore.user) {
    appStore.showToast('Please sign in', 'warning')
    return
  }

  await postsStore.fetchPosts()
  appStore.showToast('Posts loaded', 'success')
}
```

### Store Composing (One Store Using Another)

```typescript
// posts.ts
import { useAuthStore } from './auth'

export const usePostsStore = defineStore('posts', () => {
  const authStore = useAuthStore()

  const createPost = async (post: Partial<Post>) => {
    if (!authStore.user) {
      throw new Error('Not authenticated')
    }

    // Use authStore.user.id
    const newPost = {
      ...post,
      user_id: authStore.user.id
    }

    // ... rest of implementation
  }

  return { createPost }
})
```

---

## Pinia DevTools

Pinia integrates with Vue DevTools:

- View all stores
- Inspect state in real-time
- Track actions and mutations
- Time-travel debugging
- Hot module replacement (HMR)

---

## Best Practices

### ✅ Do:
- Use Composition API style (`defineStore` with setup function)
- Keep stores focused (single responsibility)
- Use computed for derived state
- Type all state with TypeScript
- Handle errors in actions
- Reset state when needed (logout, etc.)
- Use stores for shared state only

### ❌ Don't:
- Put component-specific state in stores
- Mutate state directly from components
- Create circular dependencies between stores
- Forget to handle async errors
- Mix Options API and Composition API styles
- Store everything (use local state when appropriate)

---

## Common Patterns

### Pattern 1: Loading States

```typescript
const loading = ref(false)
const error = ref<string | null>(null)

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    // Fetch data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}
```

### Pattern 2: Optimistic Updates

```typescript
const toggleFavorite = async (postId: string) => {
  // Optimistically update UI
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    post.isFavorited = !post.isFavorited
  }

  try {
    await supabase.from('favorites').insert({ post_id: postId })
  } catch (error) {
    // Revert on error
    if (post) {
      post.isFavorited = !post.isFavorited
    }
    throw error
  }
}
```

### Pattern 3: Pagination

```typescript
const currentPage = ref(1)
const hasMore = ref(true)

const loadMore = async () => {
  if (!hasMore.value || loading.value) return

  const nextPage = currentPage.value + 1
  await fetchPosts(nextPage)
}
```

---

## Resources

- [Pinia Documentation](https://pinia.vuejs.org/)
- [Pinia vs Vuex](https://pinia.vuejs.org/introduction.html#comparison-with-vuex)
- [Vue Mastery Pinia Course](https://www.vuemastery.com/courses/pinia/)

---

## Impact on MuralMap

### State Management Benefits
- Centralized data source
- Predictable state updates
- Easy debugging with DevTools
- Type-safe with TypeScript
- Simple API compared to Vuex

### Store Count
MuralMap has 6 main stores:
- `auth` - Authentication & user
- `posts` - Posts CRUD & discovery
- `notifications` - Notifications & realtime
- `activity` - Friend activity feed
- `search` - Search functionality
- `app` - Global app state
