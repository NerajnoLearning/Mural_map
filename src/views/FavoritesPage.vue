<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import MasonryGrid from '@/components/feed/MasonryGrid.vue'
import type { Post } from '@/types'
import { createLogger } from '@/utils/logger'

const logger = createLogger('FavoritesPage')
const authStore = useAuthStore()

const posts = ref<Post[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

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
      .map((row: any) => row.post)
      .filter(Boolean)
      .map((p: any) => ({
        ...p,
        is_favorited: true,
        favorites_count: p.favorites_count?.[0]?.count ?? 0,
        comments_count: p.comments_count?.[0]?.count ?? 0,
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
      <h1 class="text-xl font-bold text-text">Favorites</h1>
    </div>

    <div class="p-16">
      <!-- Error -->
      <div v-if="error" class="text-center py-48 text-error text-sm">{{ error }}</div>

      <!-- Grid -->
      <MasonryGrid v-else :posts="posts" :loading="loading" />

      <!-- Empty state -->
      <div
        v-if="!loading && posts.length === 0 && !error"
        class="flex flex-col items-center justify-center py-64 text-center"
      >
        <svg class="w-48 h-48 text-text-muted mb-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <p class="text-text font-semibold text-lg mb-8">No favorites yet</p>
        <p class="text-text-muted text-sm">Tap the heart on any mural to save it here.</p>
      </div>
    </div>
  </div>
</template>
