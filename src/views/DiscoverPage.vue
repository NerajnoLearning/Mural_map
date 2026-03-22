<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePostsStore } from '@/stores/posts'
import { useAppStore } from '@/stores/app'
import MasonryGrid from '@/components/feed/MasonryGrid.vue'
import type { Post } from '@/types'

const postsStore = usePostsStore()
const appStore = useAppStore()

const filterTab = ref<'all' | 'public' | 'friends'>('all')
const trendingPosts = ref<(Post & { trending_score?: number })[]>([])
const loadingTrending = ref(false)

onMounted(async () => {
  // Initialize theme and app
  appStore.initializeTheme()
  appStore.initializeOnlineStatus()

  // Fetch initial posts and trending in parallel
  await Promise.all([loadPosts(true), loadTrending()])
})

const loadTrending = async () => {
  loadingTrending.value = true
  try {
    trendingPosts.value = await postsStore.fetchTrendingPosts(12)
  } catch {
    // Non-critical — trending section simply won't show
  } finally {
    loadingTrending.value = false
  }
}

const loadPosts = async (reset = false) => {
  try {
    await postsStore.fetchPosts({
      reset,
      visibility: filterTab.value === 'all' ? 'all' : filterTab.value
    })
  } catch (error) {
    appStore.showToast('Failed to load posts', 'error')
  }
}

const handleFilterChange = async (filter: 'all' | 'public' | 'friends') => {
  filterTab.value = filter
  await loadPosts(true)
}

const handleLoadMore = async () => {
  if (!postsStore.loading && postsStore.hasMore) {
    await loadPosts(false)
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <!-- Header -->
    <header class="bg-surface-elevated border-b border-border sticky top-0 z-10">
      <div class="max-w-content mx-auto px-16 py-16">
        <div class="flex items-center justify-between mb-16">
          <h1 class="text-2xl font-bold text-text">Discover</h1>

          <router-link
            to="/upload"
            class="px-16 py-8 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
          >
            Upload
          </router-link>
        </div>

        <!-- Filter tabs -->
        <div class="flex gap-8">
          <button
            @click="handleFilterChange('all')"
            :class="[
              'px-16 py-8 rounded-lg font-medium transition',
              filterTab === 'all'
                ? 'bg-primary text-white'
                : 'bg-surface text-text-muted hover:bg-surface-elevated'
            ]"
          >
            All
          </button>

          <button
            @click="handleFilterChange('public')"
            :class="[
              'px-16 py-8 rounded-lg font-medium transition',
              filterTab === 'public'
                ? 'bg-primary text-white'
                : 'bg-surface text-text-muted hover:bg-surface-elevated'
            ]"
          >
            Public
          </button>

          <button
            @click="handleFilterChange('friends')"
            :class="[
              'px-16 py-8 rounded-lg font-medium transition',
              filterTab === 'friends'
                ? 'bg-primary text-white'
                : 'bg-surface text-text-muted hover:bg-surface-elevated'
            ]"
          >
            Friends Only
          </button>
        </div>
      </div>
    </header>

    <!-- Trending This Week -->
    <section v-if="trendingPosts.length > 0" class="max-w-content mx-auto px-16 pt-24">
      <div class="flex items-center justify-between mb-12">
        <h2 class="text-lg font-bold text-text flex items-center gap-8">
          <span>🔥</span>
          <span>Trending This Week</span>
        </h2>
        <router-link to="/trending" class="text-sm text-primary hover:text-primary-dark transition font-medium">
          See all
        </router-link>
      </div>

      <!-- Horizontal scrollable card rail -->
      <div class="flex gap-12 overflow-x-auto pb-12 -mx-16 px-16 scrollbar-hide">
        <router-link
          v-for="post in trendingPosts"
          :key="post.id"
          :to="`/post/${post.id}`"
          class="flex-shrink-0 w-180 rounded-lg overflow-hidden border border-border bg-surface-elevated hover:border-primary/50 transition group"
        >
          <!-- Photo -->
          <div class="aspect-square bg-surface-overlay overflow-hidden">
            <img
              v-if="post.image_url"
              :src="post.image_url"
              :alt="post.title"
              class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              loading="lazy"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-4xl">🎨</div>
          </div>
          <!-- Info -->
          <div class="p-8">
            <p class="text-sm font-semibold text-text truncate">{{ post.title || 'Untitled' }}</p>
            <p v-if="post.city" class="text-xs text-text-muted truncate mt-2">{{ post.city }}</p>
            <p class="text-xs text-primary mt-4 font-medium">
              {{ post.favorites_count }} favorites this week
            </p>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Feed -->
    <main class="max-w-content mx-auto px-16 py-24">
      <MasonryGrid
        :posts="postsStore.posts"
        :loading="postsStore.loading"
        @load-more="handleLoadMore"
      />
    </main>
  </div>
</template>
