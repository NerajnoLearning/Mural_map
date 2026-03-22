<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePostsStore } from '@/stores/posts'
import { useAppStore } from '@/stores/app'
import BaseButton from '@/components/ui/BaseButton.vue'
import CommentsList from '@/components/comments/CommentsList.vue'
import AddToCollectionModal from '@/components/collections/AddToCollectionModal.vue'
import type { Post } from '@/types'

const props = defineProps<{ id: string }>()

const router = useRouter()
const authStore = useAuthStore()
const postsStore = usePostsStore()
const appStore = useAppStore()

const post = ref<Post | null>(null)
const loading = ref(true)
const isFavoriting = ref(false)
const showDeleteConfirm = ref(false)
const showAddToCollection = ref(false)

const isOwnPost = computed(() => {
  return authStore.user?.id === post.value?.user_id
})

onMounted(async () => {
  await loadPost()
})

const loadPost = async () => {
  loading.value = true

  try {
    const data = await postsStore.getPostById(props.id)

    if (data) {
      post.value = data
    } else {
      appStore.showToast('Post not found', 'error')
      router.push('/discover')
    }
  } catch (error) {
    appStore.showToast('Failed to load post', 'error')
    router.push('/discover')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const viewProfile = () => {
  if (post.value?.user?.username) {
    router.push(`/profile/${post.value.user.username}`)
  }
}

const toggleFavorite = async () => {
  if (!authStore.user) {
    appStore.showToast('Please sign in to favorite posts', 'info')
    router.push('/auth/signin')
    return
  }

  if (!post.value || isFavoriting.value) return

  isFavoriting.value = true

  try {
    await postsStore.toggleFavorite(post.value.id, authStore.user.id)

    // Update local post state
    if (post.value.is_favorited) {
      post.value.is_favorited = false
      post.value.favorites_count = (post.value.favorites_count || 1) - 1
    } else {
      post.value.is_favorited = true
      post.value.favorites_count = (post.value.favorites_count || 0) + 1
    }
  } catch (error) {
    appStore.showToast('Failed to update favorite', 'error')
  } finally {
    isFavoriting.value = false
  }
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}

const deletePost = async () => {
  if (!post.value) return

  try {
    await postsStore.deletePost(post.value.id)
    appStore.showToast('Post deleted successfully', 'success')
    router.push('/discover')
  } catch (error) {
    appStore.showToast('Failed to delete post', 'error')
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const sharePost = async () => {
  if (!post.value) return

  const shareData = {
    title: post.value.title || 'Check out this mural on MuralMap',
    text: post.value.description || `${post.value.artist ? `by ${post.value.artist}` : 'Street art'} in ${post.value.city || 'the city'}`,
    url: window.location.href
  }

  // Check if Web Share API is supported
  if (navigator.share) {
    try {
      await navigator.share(shareData)
      appStore.showToast('Shared successfully!', 'success')
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error)
        fallbackShare()
      }
    }
  } else {
    // Fallback to clipboard
    fallbackShare()
  }
}

const fallbackShare = () => {
  if (!post.value) return

  // Copy URL to clipboard
  const url = window.location.href

  if (navigator.clipboard) {
    navigator.clipboard.writeText(url)
      .then(() => {
        appStore.showToast('Link copied to clipboard!', 'success')
      })
      .catch(() => {
        appStore.showToast('Failed to copy link', 'error')
      })
  } else {
    appStore.showToast('Sharing not supported on this browser', 'info')
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <svg class="animate-spin h-48 w-48 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Post content -->
    <div v-else-if="post" class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="sticky top-0 z-10 bg-surface-elevated border-b border-border px-16 py-16">
        <div class="flex items-center justify-between">
          <button
            @click="goBack"
            class="flex items-center gap-8 text-text hover:text-primary transition"
          >
            <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span class="font-medium">Back</span>
          </button>

          <div v-if="isOwnPost" class="flex gap-8">
            <BaseButton
              variant="outline"
              size="sm"
              @click="confirmDelete"
            >
              Delete
            </BaseButton>
          </div>
        </div>
      </header>

      <!-- Main image -->
      <div class="relative">
        <img
          :src="post.image_url"
          :alt="post.title || 'Mural'"
          class="w-full h-auto"
        />

        <!-- Badges -->
        <div class="absolute top-16 left-16 flex gap-8">
          <span
            v-if="post.visibility === 'friends'"
            class="px-12 py-6 bg-surface/90 backdrop-blur-sm rounded-full text-sm font-medium text-text flex items-center gap-6"
          >
            <svg class="w-14 h-14" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Friends Only
          </span>
        </div>
      </div>

      <!-- Post details -->
      <div class="p-24 space-y-24">
        <!-- User info & actions -->
        <div class="flex items-start justify-between">
          <button
            @click="viewProfile"
            class="flex items-center gap-12 hover:opacity-75 transition"
          >
            <div class="w-48 h-48 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
              <img
                v-if="post.user?.avatar_url"
                :src="post.user.avatar_url"
                :alt="post.user.display_name || post.user.username"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-xl font-bold text-primary">
                {{ (post.user?.display_name || post.user?.username || '?').charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <p class="font-bold text-text">{{ post.user?.display_name || post.user?.username || 'Unknown' }}</p>
              <p class="text-sm text-text-muted">{{ formatDate(post.created_at) }}</p>
            </div>
          </button>

          <div v-if="authStore.isAuthenticated" class="flex gap-8">
            <button
              @click="toggleFavorite"
              :disabled="isFavoriting"
              class="flex items-center gap-8 px-16 py-8 rounded-lg border-2 transition-colors"
              :class="post.is_favorited
                ? 'border-error text-error hover:bg-error/10'
                : 'border-border text-text hover:bg-surface-elevated'"
            >
              <svg
                class="w-24 h-24"
                :class="post.is_favorited ? 'fill-current' : ''"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span class="font-medium">{{ post.favorites_count || 0 }}</span>
            </button>

            <button
              @click="showAddToCollection = true"
              class="flex items-center gap-8 px-16 py-8 rounded-lg border-2 border-border text-text hover:bg-surface-elevated transition-colors"
            >
              <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="font-medium">Collection</span>
            </button>

            <button
              @click="sharePost"
              class="flex items-center gap-8 px-16 py-8 rounded-lg border-2 border-border text-text hover:bg-surface-elevated transition-colors"
            >
              <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span class="font-medium">Share</span>
            </button>
          </div>
        </div>

        <!-- Title & Artist -->
        <div>
          <h1 class="text-3xl font-bold text-text mb-8">{{ post.title || 'Untitled' }}</h1>
          <p v-if="post.artist" class="text-lg text-text-muted">by {{ post.artist }}</p>
        </div>

        <!-- Description -->
        <p v-if="post.description" class="text-text leading-relaxed">
          {{ post.description }}
        </p>

        <!-- Tags -->
        <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-8">
          <span
            v-for="tag in post.tags"
            :key="tag.id"
            class="px-12 py-6 bg-primary/10 text-primary rounded-lg text-sm font-medium"
          >
            {{ tag.label }}
          </span>
        </div>

        <!-- Location -->
        <div v-if="post.lat && post.lng" class="p-16 bg-surface-elevated rounded-lg">
          <div class="flex items-start gap-12">
            <svg class="w-20 h-20 text-primary mt-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
            <div class="flex-1">
              <h3 class="font-bold text-text mb-4">Location</h3>
              <p v-if="post.city" class="text-text mb-4">{{ post.city }}</p>
              <p class="text-sm text-text-muted font-mono">
                {{ post.lat.toFixed(6) }}, {{ post.lng.toFixed(6) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="flex items-center gap-24 pt-24 border-t border-border">
          <div class="flex items-center gap-8 text-text-muted">
            <svg class="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
            </svg>
            <span class="font-medium">{{ post.favorites_count || 0 }} favorites</span>
          </div>

          <div class="flex items-center gap-8 text-text-muted">
            <svg class="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
            </svg>
            <span class="font-medium">{{ post.comments_count || 0 }} comments</span>
          </div>
        </div>

        <!-- Comments section -->
        <div class="pt-24 border-t border-border mt-24">
          <h2 class="text-xl font-bold text-text mb-16">Comments</h2>
          <CommentsList :post-id="post.id" />
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-16"
      @click="cancelDelete"
    >
      <div
        class="bg-surface rounded-lg p-24 max-w-md w-full"
        @click.stop
      >
        <h3 class="text-xl font-bold text-text mb-12">Delete Post?</h3>
        <p class="text-text-muted mb-24">
          This action cannot be undone. The post and all its data will be permanently deleted.
        </p>

        <div class="flex gap-12">
          <BaseButton
            variant="outline"
            size="md"
            full-width
            @click="cancelDelete"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="danger"
            size="md"
            full-width
            @click="deletePost"
          >
            Delete
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Add to collection modal -->
    <AddToCollectionModal
      v-if="showAddToCollection && post"
      :post-id="post.id"
      @close="showAddToCollection = false"
      @added="showAddToCollection = false"
    />
  </div>
</template>
