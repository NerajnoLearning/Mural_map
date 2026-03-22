<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { useAppStore } from '@/stores/app'
import type { Notification } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const appStore = useAppStore()

const activeTab = ref<'all' | 'unread'>('all')
const realtimeChannel = ref<any>(null)

const filteredNotifications = computed(() => {
  if (activeTab.value === 'unread') {
    return notificationsStore.notifications.filter(n => !n.read)
  }
  return notificationsStore.notifications
})

onMounted(async () => {
  if (!authStore.user) {
    router.push('/auth/signin')
    return
  }

  await notificationsStore.fetchNotifications(authStore.user.id)

  // Subscribe to realtime notifications
  realtimeChannel.value = notificationsStore.subscribeToNotifications(authStore.user.id)
})

onUnmounted(() => {
  if (realtimeChannel.value) {
    notificationsStore.unsubscribe(realtimeChannel.value)
  }
})

const handleMarkAsRead = async (notification: Notification) => {
  if (notification.read) return

  try {
    await notificationsStore.markAsRead(notification.id)
  } catch (error) {
    appStore.showToast('Failed to mark as read', 'error')
  }
}

const handleMarkAllAsRead = async () => {
  if (!authStore.user) return

  try {
    await notificationsStore.markAllAsRead(authStore.user.id)
    appStore.showToast('All notifications marked as read', 'success')
  } catch (error) {
    appStore.showToast('Failed to mark all as read', 'error')
  }
}

const handleDelete = async (notificationId: string) => {
  try {
    await notificationsStore.deleteNotification(notificationId)
    appStore.showToast('Notification deleted', 'success')
  } catch (error) {
    appStore.showToast('Failed to delete notification', 'error')
  }
}

const handleNotificationClick = async (notification: Notification) => {
  // Mark as read
  await handleMarkAsRead(notification)

  // Navigate based on notification type
  switch (notification.type) {
    case 'like':
    case 'comment':
      if (notification.reference_id) {
        router.push(`/post/${notification.reference_id}`)
      }
      break
    case 'mention':
      if (notification.reference_id) {
        router.push(`/post/${notification.reference_id}`)
      }
      break
    case 'friend_request':
      router.push('/friends')
      break
    case 'friend_accepted':
      if (notification.actor?.username) {
        router.push(`/profile/${notification.actor.username}`)
      }
      break
  }
}

const getNotificationText = (notification: Notification): string => {
  const actorName = notification.actor?.display_name || notification.actor?.username || 'Someone'

  switch (notification.type) {
    case 'like':
      return `${actorName} liked your mural`
    case 'comment':
      return `${actorName} commented on your mural`
    case 'mention':
      return `${actorName} mentioned you in a comment`
    case 'friend_request':
      return `${actorName} sent you a friend request`
    case 'friend_accepted':
      return `${actorName} accepted your friend request`
    default:
      return 'You have a new notification'
  }
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return '❤️'
    case 'comment':
      return '💬'
    case 'mention':
      return '@'
    case 'friend_request':
      return '👋'
    case 'friend_accepted':
      return '✅'
    default:
      return '🔔'
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

const loadMore = async () => {
  if (!authStore.user || notificationsStore.loading || !notificationsStore.hasMore) return
  await notificationsStore.fetchNotifications(authStore.user.id, false)
}

// Intersection observer for infinite scroll
const observer = ref<IntersectionObserver | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)

onMounted(() => {
  observer.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    },
    { threshold: 0.5 }
  )

  if (loadMoreTrigger.value) {
    observer.value.observe(loadMoreTrigger.value)
  }
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})
</script>

<template>
  <div class="min-h-screen bg-surface">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <header class="sticky top-0 z-10 bg-surface-elevated border-b border-border px-16 py-16">
        <div class="flex items-center justify-between mb-16">
          <h1 class="text-2xl font-bold text-text">Notifications</h1>

          <button
            v-if="notificationsStore.unreadCount > 0"
            @click="handleMarkAllAsRead"
            class="text-sm font-medium text-primary hover:text-primary/80 transition"
          >
            Mark all as read
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-4">
          <button
            @click="activeTab = 'all'"
            class="px-16 py-8 rounded-lg text-sm font-medium transition"
            :class="activeTab === 'all'
              ? 'bg-primary text-white'
              : 'bg-surface text-text hover:bg-surface-overlay'"
          >
            All
          </button>
          <button
            @click="activeTab = 'unread'"
            class="px-16 py-8 rounded-lg text-sm font-medium transition flex items-center gap-6"
            :class="activeTab === 'unread'
              ? 'bg-primary text-white'
              : 'bg-surface text-text hover:bg-surface-overlay'"
          >
            Unread
            <span
              v-if="notificationsStore.unreadCount > 0"
              class="px-6 py-1 rounded-full text-xs font-bold"
              :class="activeTab === 'unread' ? 'bg-white text-primary' : 'bg-primary text-white'"
            >
              {{ notificationsStore.unreadCount }}
            </span>
          </button>
        </div>
      </header>

      <!-- Loading state -->
      <div v-if="notificationsStore.loading && filteredNotifications.length === 0" class="flex items-center justify-center py-48">
        <svg class="animate-spin h-32 w-32 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredNotifications.length === 0" class="text-center py-48 px-16">
        <div class="text-6xl mb-16">🔔</div>
        <h3 class="text-lg font-bold text-text mb-8">
          {{ activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet' }}
        </h3>
        <p class="text-text-muted">
          {{ activeTab === 'unread'
            ? "You're all caught up!"
            : "When someone interacts with your content, you'll see it here" }}
        </p>
      </div>

      <!-- Notifications list -->
      <div v-else class="divide-y divide-border">
        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          class="relative group"
        >
          <button
            @click="handleNotificationClick(notification)"
            class="w-full px-16 py-16 hover:bg-surface-overlay transition text-left flex items-start gap-12"
            :class="!notification.read ? 'bg-primary/5' : ''"
          >
            <!-- Unread indicator -->
            <div
              v-if="!notification.read"
              class="w-8 h-8 rounded-full bg-primary flex-shrink-0 mt-8"
            ></div>
            <div v-else class="w-8 flex-shrink-0"></div>

            <!-- Avatar -->
            <div class="w-48 h-48 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0">
              <img
                v-if="notification.actor?.avatar_url"
                :src="notification.actor.avatar_url"
                :alt="notification.actor.display_name || notification.actor.username"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-lg font-bold text-primary">
                {{ getNotificationIcon(notification.type) }}
              </span>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="text-text mb-4">
                <span class="font-medium">{{ getNotificationText(notification) }}</span>
              </p>
              <p class="text-sm text-text-muted">
                {{ formatRelativeTime(notification.created_at) }}
              </p>
            </div>

            <!-- Delete button -->
            <button
              @click.stop="handleDelete(notification.id)"
              class="opacity-0 group-hover:opacity-100 p-8 hover:bg-surface-elevated rounded-lg transition flex-shrink-0"
              aria-label="Delete notification"
            >
              <svg class="w-16 h-16 text-text-muted hover:text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </button>
        </div>

        <!-- Load more trigger -->
        <div
          v-if="notificationsStore.hasMore"
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
