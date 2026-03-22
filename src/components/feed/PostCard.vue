<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePostsStore } from '@/stores/posts'
import { useAppStore } from '@/stores/app'
import type { Post } from '@/types'

interface Props {
  post: Post
}

const props = defineProps<Props>()

const router = useRouter()
const authStore = useAuthStore()
const postsStore = usePostsStore()
const appStore = useAppStore()

const isLoaded = ref(false)
const isFavoriting = ref(false)

const isOwnPost = computed(() => {
  return authStore.user?.id === props.post.user_id
})

const handleImageLoad = () => {
  isLoaded.value = true
}

const viewPost = () => {
  router.push(`/post/${props.post.id}`)
}

const viewProfile = (e: Event) => {
  e.stopPropagation()
  if (props.post.user?.username) {
    router.push(`/profile/${props.post.user.username}`)
  }
}

const toggleFavorite = async (e: Event) => {
  e.stopPropagation()

  if (!authStore.user) {
    appStore.showToast('Please sign in to favorite posts', 'info')
    router.push('/auth/signin')
    return
  }

  if (isFavoriting.value) return

  isFavoriting.value = true

  try {
    await postsStore.toggleFavorite(props.post.id, authStore.user.id)
  } catch (error) {
    appStore.showToast('Failed to update favorite', 'error')
  } finally {
    isFavoriting.value = false
  }
}
</script>

<template>
  <div
    class="group relative bg-surface-elevated rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-xl"
    @click="viewPost"
  >
    <!-- Image -->
    <div class="relative">
      <!-- Skeleton loader -->
      <div
        v-if="!isLoaded"
        class="w-full aspect-square bg-surface-elevated skeleton"
      ></div>

      <img
        :src="post.image_url"
        :alt="post.title || 'Mural'"
        class="w-full h-auto"
        :class="{ 'opacity-0': !isLoaded }"
        @load="handleImageLoad"
        loading="lazy"
      />

      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <!-- Top badges -->
      <div class="absolute top-12 left-12 flex gap-8">
        <span
          v-if="post.visibility === 'friends'"
          class="px-8 py-4 bg-surface/90 backdrop-blur-sm rounded-full text-xs font-medium text-text flex items-center gap-4"
        >
          <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          Friends
        </span>

        <span
          v-if="post.lat && post.lng"
          class="px-8 py-4 bg-success/90 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center gap-4"
        >
          <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
          GPS
        </span>
      </div>

      <!-- Favorite button -->
      <button
        v-if="authStore.isAuthenticated"
        @click="toggleFavorite"
        :disabled="isFavoriting"
        class="absolute top-12 right-12 p-8 bg-surface/90 backdrop-blur-sm rounded-full hover:bg-surface transition-colors"
        :class="{ 'opacity-50': isFavoriting }"
        aria-label="Toggle favorite"
      >
        <svg
          class="w-20 h-20 transition-colors"
          :class="post.is_favorited ? 'text-error fill-current' : 'text-text'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      <!-- Bottom info overlay (on hover) -->
      <div class="absolute bottom-0 left-0 right-0 p-16 translate-y-full group-hover:translate-y-0 transition-transform">
        <div class="flex items-center gap-16 text-white">
          <div class="flex items-center gap-6">
            <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm font-medium">{{ post.favorites_count || 0 }}</span>
          </div>

          <div class="flex items-center gap-6">
            <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm font-medium">{{ post.comments_count || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Card content -->
    <div class="p-16">
      <!-- Title & Artist -->
      <div class="mb-12">
        <h3 class="font-bold text-text line-clamp-2 mb-4">
          {{ post.title || 'Untitled' }}
        </h3>
        <p v-if="post.artist" class="text-sm text-text-muted">
          by {{ post.artist }}
        </p>
      </div>

      <!-- Tags -->
      <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-6 mb-12">
        <span
          v-for="tag in post.tags.slice(0, 3)"
          :key="tag.id"
          class="px-8 py-4 bg-primary/10 text-primary rounded text-xs font-medium"
        >
          {{ tag.label }}
        </span>
        <span
          v-if="post.tags.length > 3"
          class="px-8 py-4 bg-surface text-text-muted rounded text-xs font-medium"
        >
          +{{ post.tags.length - 3 }}
        </span>
      </div>

      <!-- User info -->
      <div class="flex items-center gap-8">
        <button
          @click="viewProfile"
          class="flex items-center gap-8 hover:opacity-75 transition-opacity"
        >
          <div class="w-24 h-24 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
            <img
              v-if="post.user?.avatar_url"
              :src="post.user.avatar_url"
              :alt="post.user.display_name || post.user.username"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-xs font-bold text-primary">
              {{ (post.user?.display_name || post.user?.username || '?').charAt(0).toUpperCase() }}
            </span>
          </div>
          <span class="text-sm font-medium text-text">
            {{ post.user?.display_name || post.user?.username || 'Unknown' }}
          </span>
        </button>

        <span v-if="post.city" class="text-sm text-text-muted ml-auto">
          {{ post.city }}
        </span>
      </div>
    </div>
  </div>
</template>
