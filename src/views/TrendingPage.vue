<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePostsStore } from '@/stores/posts'
import { useAppStore } from '@/stores/app'
import PostCard from '@/components/feed/PostCard.vue'
import type { Post } from '@/types'

const postsStore = usePostsStore()
const appStore = useAppStore()

const trendingPosts = ref<Post[]>([])
const loading = ref(true)
const timeRange = ref<'today' | 'week' | 'month'>('week')

onMounted(async () => {
  await loadTrending()
})

const loadTrending = async () => {
  loading.value = true

  try {
    const limit = timeRange.value === 'today' ? 10 : timeRange.value === 'week' ? 20 : 30
    trendingPosts.value = await postsStore.fetchTrendingPosts(limit)
  } catch (error) {
    appStore.showToast('Failed to load trending posts', 'error')
  } finally {
    loading.value = false
  }
}

const handleTimeRangeChange = async (range: 'today' | 'week' | 'month') => {
  timeRange.value = range
  await loadTrending()
}

const getEmoji = (index: number): string => {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return `${index + 1}.`
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <div class="max-w-content mx-auto">
      <!-- Header -->
      <header class="sticky top-0 z-10 bg-surface-elevated border-b border-border px-16 py-16">
        <div class="flex items-center justify-between mb-16">
          <div>
            <h1 class="text-2xl font-bold text-text">🔥 Trending</h1>
            <p class="text-sm text-text-muted mt-4">Most popular murals right now</p>
          </div>
        </div>

        <!-- Time range tabs -->
        <div class="flex gap-8">
          <button
            @click="handleTimeRangeChange('today')"
            class="px-16 py-8 rounded-lg text-sm font-medium transition"
            :class="timeRange === 'today'
              ? 'bg-primary text-white'
              : 'bg-surface text-text hover:bg-surface-overlay'"
          >
            Today
          </button>
          <button
            @click="handleTimeRangeChange('week')"
            class="px-16 py-8 rounded-lg text-sm font-medium transition"
            :class="timeRange === 'week'
              ? 'bg-primary text-white'
              : 'bg-surface text-text hover:bg-surface-overlay'"
          >
            This Week
          </button>
          <button
            @click="handleTimeRangeChange('month')"
            class="px-16 py-8 rounded-lg text-sm font-medium transition"
            :class="timeRange === 'month'
              ? 'bg-primary text-white'
              : 'bg-surface text-text hover:bg-surface-overlay'"
          >
            This Month
          </button>
        </div>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-48">
        <svg class="animate-spin h-32 w-32 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Empty state -->
      <div v-else-if="trendingPosts.length === 0" class="text-center py-48 px-16">
        <div class="text-6xl mb-16">📊</div>
        <h3 class="text-lg font-bold text-text mb-8">No trending posts yet</h3>
        <p class="text-text-muted mb-24">
          Check back soon to see what's hot in the community
        </p>
        <router-link
          to="/discover"
          class="inline-flex px-24 py-12 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
        >
          Explore All Posts
        </router-link>
      </div>

      <!-- Trending posts grid -->
      <div v-else class="p-16 sm:p-24">
        <!-- Top 3 posts - Featured -->
        <div v-if="trendingPosts.length >= 3" class="mb-32">
          <h2 class="text-xl font-bold text-text mb-16 flex items-center gap-8">
            <span>🏆</span>
            <span>Top 3</span>
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div
              v-for="(post, index) in trendingPosts.slice(0, 3)"
              :key="post.id"
              class="relative"
            >
              <!-- Rank badge -->
              <div class="absolute top-8 left-8 z-10 w-40 h-40 bg-surface-elevated rounded-full flex items-center justify-center text-2xl shadow-lg">
                {{ getEmoji(index) }}
              </div>

              <PostCard :post="post" />
            </div>
          </div>
        </div>

        <!-- Rest of trending posts -->
        <div v-if="trendingPosts.length > 3">
          <h2 class="text-xl font-bold text-text mb-16">More Trending</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
            <div
              v-for="(post, index) in trendingPosts.slice(3)"
              :key="post.id"
              class="relative"
            >
              <!-- Rank badge -->
              <div class="absolute top-8 left-8 z-10 w-32 h-32 bg-surface-elevated rounded-full flex items-center justify-center text-sm font-bold text-text shadow">
                {{ index + 4 }}
              </div>

              <PostCard :post="post" />
            </div>
          </div>
        </div>

        <!-- Info box -->
        <div class="mt-32 p-16 bg-primary/10 rounded-lg border border-primary/20">
          <h3 class="font-bold text-text mb-8 flex items-center gap-8">
            <svg class="w-20 h-20 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            How Trending Works
          </h3>
          <p class="text-sm text-text-muted">
            Trending posts are calculated based on recent engagement (likes and comments)
            combined with how recently they were posted. Fresh content with high engagement
            ranks higher!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
