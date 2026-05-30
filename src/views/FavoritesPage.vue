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
  return list
})

async function fetchFavorites() {
  loading.value = true
  error.value = null
  try {
    const client = await authStore.getAuthenticatedClient()
    const { data, error: err } = await client
      .from('favorites')
      .select(`
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
        is_favorited: true,
        favorites_created_at: row.created_at,
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
