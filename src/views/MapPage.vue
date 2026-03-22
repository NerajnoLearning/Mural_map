<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePostsStore } from '@/stores/posts'
import { useAppStore } from '@/stores/app'
import MapView from '@/components/map/MapView.vue'
import type { Post } from '@/types'

const postsStore = usePostsStore()
const appStore = useAppStore()

const selectedPost = ref<Post | null>(null)
const showClustering = ref(true)

onMounted(async () => {
  appStore.initializeTheme()

  // Fetch all public posts for map
  if (postsStore.posts.length === 0) {
    await loadPosts()
  }
})

const loadPosts = async () => {
  try {
    await postsStore.fetchPosts({
      reset: true,
      visibility: 'public'
    })

    // Load more until we have all posts with location
    while (postsStore.hasMore) {
      await postsStore.fetchPosts({
        reset: false,
        visibility: 'public'
      })
    }
  } catch (error) {
    appStore.showToast('Failed to load murals', 'error')
  }
}

const handleMarkerClick = (post: Post) => {
  selectedPost.value = post
}

const closeSelectedPost = () => {
  selectedPost.value = null
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <!-- Header -->
    <header class="bg-surface-elevated border-b border-border">
      <div class="max-w-content mx-auto px-16 py-16">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-text">Mural Map</h1>
            <p class="text-sm text-text-muted mt-4">
              Explore street art around the world
            </p>
          </div>

          <div class="flex items-center gap-12">
            <label class="flex items-center gap-8 cursor-pointer">
              <input
                type="checkbox"
                v-model="showClustering"
                class="w-18 h-18 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary"
              />
              <span class="text-sm font-medium text-text">Clustering</span>
            </label>

            <router-link
              to="/upload"
              class="px-16 py-8 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
            >
              Upload
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Map -->
    <main class="p-16" style="height: calc(100vh - 140px);">
      <div v-if="postsStore.loading && postsStore.posts.length === 0" class="flex items-center justify-center h-full">
        <div class="text-center">
          <svg class="animate-spin h-48 w-48 text-primary mx-auto mb-16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-text-muted">Loading murals...</p>
        </div>
      </div>

      <MapView
        v-else
        :posts="postsStore.posts"
        :show-clustering="showClustering"
        height="100%"
        @marker-click="handleMarkerClick"
      />
    </main>

    <!-- Selected post sidebar (mobile bottom sheet) -->
    <div
      v-if="selectedPost"
      class="fixed inset-x-0 bottom-0 md:right-0 md:top-0 md:left-auto md:w-96 bg-surface-elevated border-t md:border-l border-border p-24 z-[1001] overflow-y-auto"
      style="max-height: 50vh; md:max-height: 100vh;"
    >
      <div class="flex items-start justify-between mb-16">
        <h3 class="text-lg font-bold text-text">{{ selectedPost.title }}</h3>
        <button
          @click="closeSelectedPost"
          class="p-8 hover:bg-surface-overlay rounded-lg transition"
          aria-label="Close"
        >
          <svg class="w-20 h-20 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <img
        :src="selectedPost.image_url"
        :alt="selectedPost.title || 'Mural'"
        class="w-full h-48 object-cover rounded-lg mb-16"
      />

      <div class="space-y-12">
        <div v-if="selectedPost.artist">
          <p class="text-sm text-text-muted">Artist</p>
          <p class="font-medium text-text">{{ selectedPost.artist }}</p>
        </div>

        <div v-if="selectedPost.description">
          <p class="text-sm text-text-muted">Description</p>
          <p class="text-text">{{ selectedPost.description }}</p>
        </div>

        <div v-if="selectedPost.city">
          <p class="text-sm text-text-muted">Location</p>
          <p class="text-text">{{ selectedPost.city }}</p>
        </div>

        <div v-if="selectedPost.tags && selectedPost.tags.length > 0">
          <p class="text-sm text-text-muted mb-8">Tags</p>
          <div class="flex flex-wrap gap-6">
            <span
              v-for="tag in selectedPost.tags"
              :key="tag.id"
              class="px-8 py-4 bg-primary/10 text-primary rounded text-xs font-medium"
            >
              {{ tag.label }}
            </span>
          </div>
        </div>

        <router-link
          :to="`/post/${selectedPost.id}`"
          class="block w-full px-16 py-12 bg-primary text-white text-center rounded-lg hover:bg-primary-dark transition font-medium"
        >
          View Details
        </router-link>
      </div>
    </div>
  </div>
</template>
