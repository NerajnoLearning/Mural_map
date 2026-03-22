<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useActivityStore } from '@/stores/activity'
import type { ActivityItem } from '@/stores/activity'

const router = useRouter()
const authStore = useAuthStore()
const activityStore = useActivityStore()

const observer = ref<IntersectionObserver | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!authStore.user) {
    router.push('/auth/signin')
    return
  }

  await activityStore.fetchFriendActivity(authStore.user.id)

  // Setup intersection observer for infinite scroll
  observer.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !activityStore.loading && activityStore.hasMore) {
        loadMore()
      }
    },
    { threshold: 0.5 }
  )

  if (loadMoreTrigger.value) {
    observer.value.observe(loadMoreTrigger.value)
  }
})

const loadMore = async () => {
  if (!authStore.user) return
  await activityStore.fetchFriendActivity(authStore.user.id, false)
}

const getActivityText = (activity: ActivityItem): string => {
  const userName = activity.user.display_name || activity.user.username

  switch (activity.type) {
    case 'post_created':
      return `posted a new mural`
    case 'post_liked':
      return `liked a mural`
    case 'comment_added':
      return `commented on a mural`
    case 'friend_added':
      return `became friends with ${activity.target_user?.display_name || activity.target_user?.username || 'someone'}`
    default:
      return 'activity'
  }
}

const getActivityIcon = (type: ActivityItem['type']): string => {
  switch (type) {
    case 'post_created':
      return '📸'
    case 'post_liked':
      return '❤️'
    case 'comment_added':
      return '💬'
    case 'friend_added':
      return '👥'
    default:
      return '📌'
  }
}

const formatRelativeTime = (dateString: string): string => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const goToProfile = (username: string) => {
  router.push(`/profile/${username}`)
}

const goToPost = (postId: string) => {
  router.push(`/post/${postId}`)
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <header class="sticky top-0 z-10 bg-surface-elevated border-b border-border px-16 py-16">
        <h1 class="text-2xl font-bold text-text">Activity</h1>
        <p class="text-sm text-text-muted mt-4">What your friends have been up to</p>
      </header>

      <!-- Loading -->
      <div v-if="activityStore.loading && activityStore.activities.length === 0" class="flex items-center justify-center py-48">
        <svg class="animate-spin h-32 w-32 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Empty state -->
      <div v-else-if="activityStore.activities.length === 0" class="text-center py-48 px-16">
        <div class="text-6xl mb-16">👥</div>
        <h3 class="text-lg font-bold text-text mb-8">No activity yet</h3>
        <p class="text-text-muted mb-24">
          Connect with friends to see their activity here
        </p>
        <router-link
          to="/search"
          class="inline-flex px-24 py-12 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
        >
          Find Friends
        </router-link>
      </div>

      <!-- Activity feed -->
      <div v-else class="divide-y divide-border">
        <div
          v-for="activity in activityStore.activities"
          :key="activity.id"
          class="p-16 hover:bg-surface-elevated transition"
        >
          <div class="flex gap-12">
            <!-- Icon -->
            <div class="flex-shrink-0 w-40 h-40 rounded-full bg-primary/10 flex items-center justify-center text-xl">
              {{ getActivityIcon(activity.type) }}
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-12 mb-8">
                <div class="flex-1">
                  <button
                    @click="goToProfile(activity.user.username)"
                    class="font-bold text-text hover:text-primary transition"
                  >
                    {{ activity.user.display_name || activity.user.username }}
                  </button>
                  <span class="text-text-muted mx-4">{{ getActivityText(activity) }}</span>
                </div>
                <span class="text-sm text-text-muted flex-shrink-0">
                  {{ formatRelativeTime(activity.created_at) }}
                </span>
              </div>

              <!-- Post preview (if applicable) -->
              <button
                v-if="activity.post"
                @click="goToPost(activity.post.id)"
                class="flex gap-12 p-12 bg-surface rounded-lg hover:bg-surface-overlay transition text-left w-full"
              >
                <img
                  v-if="activity.post.image_url"
                  :src="activity.post.image_url"
                  :alt="activity.post.title || 'Mural'"
                  class="w-64 h-64 rounded object-cover flex-shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-text truncate">
                    {{ activity.post.title || 'Untitled' }}
                  </p>
                  <p v-if="activity.post.artist" class="text-sm text-text-muted truncate">
                    by {{ activity.post.artist }}
                  </p>
                  <p v-if="activity.post.city" class="text-sm text-text-muted truncate">
                    📍 {{ activity.post.city }}
                  </p>
                </div>
              </button>

              <!-- Friend addition preview -->
              <div
                v-else-if="activity.type === 'friend_added' && activity.target_user"
                class="flex items-center gap-12 p-12 bg-surface rounded-lg"
              >
                <div class="w-48 h-48 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
                  <img
                    v-if="activity.target_user.avatar_url"
                    :src="activity.target_user.avatar_url"
                    :alt="activity.target_user.display_name || activity.target_user.username"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-lg font-bold text-primary">
                    {{ (activity.target_user.display_name || activity.target_user.username).charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div>
                  <p class="font-medium text-text">
                    {{ activity.target_user.display_name || activity.target_user.username }}
                  </p>
                  <p class="text-sm text-text-muted">
                    @{{ activity.target_user.username }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Load more trigger -->
        <div
          v-if="activityStore.hasMore"
          ref="loadMoreTrigger"
          class="py-16 text-center"
        >
          <svg class="animate-spin h-24 w-24 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
