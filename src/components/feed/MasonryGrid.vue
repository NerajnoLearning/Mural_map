<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import PostCard from './PostCard.vue'
import type { Post } from '@/types'

interface Props {
  posts: Post[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  (e: 'loadMore'): void
}>()

const gridRef = ref<HTMLElement | null>(null)
const observer = ref<IntersectionObserver | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)

// Setup infinite scroll
onMounted(() => {
  if ('IntersectionObserver' in window) {
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !props.loading) {
            emit('loadMore')
          }
        })
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0
      }
    )

    if (loadMoreTrigger.value) {
      observer.value.observe(loadMoreTrigger.value)
    }
  }
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})
</script>

<template>
  <div>
    <!-- Masonry Grid using CSS -->
    <div
      ref="gridRef"
      class="grid gap-16 md:gap-24"
      style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); grid-auto-rows: 10px;"
    >
      <div
        v-for="post in posts"
        :key="post.id"
        style="grid-row-end: span var(--row-span);"
      >
        <PostCard :post="post" />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-32">
      <svg class="animate-spin h-48 w-48 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Empty state -->
    <div
      v-if="!loading && posts.length === 0"
      class="text-center py-64"
    >
      <div class="w-64 h-64 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-24">
        <svg class="w-32 h-32 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="text-xl font-bold text-text mb-8">No murals yet</h3>
      <p class="text-text-muted">Be the first to share street art!</p>
    </div>

    <!-- Intersection Observer trigger -->
    <div ref="loadMoreTrigger" class="h-1"></div>
  </div>
</template>

<style scoped>
/* Masonry grid using CSS Grid */
.grid > div {
  --row-span: 30; /* Default span, will be overridden by JS if needed */
}
</style>
