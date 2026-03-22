<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

const realtimeChannel = ref<any>(null)

const isActive = (path: string): boolean => {
  return route.path === path || route.path.startsWith(path + '/')
}

onMounted(async () => {
  if (authStore.user) {
    // Fetch notifications for badge count
    await notificationsStore.fetchNotifications(authStore.user.id)

    // Subscribe to realtime updates for badge
    realtimeChannel.value = notificationsStore.subscribeToNotifications(authStore.user.id)
  }
})

onUnmounted(() => {
  if (realtimeChannel.value) {
    notificationsStore.unsubscribe(realtimeChannel.value)
  }
})
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-surface-elevated border-t border-border z-50 md:hidden">
    <div class="flex items-center justify-around h-64">
      <!-- Home -->
      <router-link
        to="/discover"
        class="flex flex-col items-center justify-center flex-1 py-8 transition"
        :class="isActive('/discover') ? 'text-primary' : 'text-text-muted hover:text-text'"
      >
        <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-xs mt-4">Home</span>
      </router-link>

      <!-- Map -->
      <router-link
        to="/map"
        class="flex flex-col items-center justify-center flex-1 py-8 transition"
        :class="isActive('/map') ? 'text-primary' : 'text-text-muted hover:text-text'"
      >
        <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span class="text-xs mt-4">Map</span>
      </router-link>

      <!-- Upload -->
      <router-link
        to="/upload"
        class="flex flex-col items-center justify-center flex-1 py-8 transition"
        :class="isActive('/upload') ? 'text-primary' : 'text-text-muted hover:text-text'"
      >
        <div
          class="w-48 h-48 rounded-full flex items-center justify-center -mt-24 shadow-lg"
          :class="isActive('/upload') ? 'bg-primary' : 'bg-accent'"
        >
          <svg class="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span class="text-xs mt-8">Upload</span>
      </router-link>

      <!-- Notifications -->
      <router-link
        to="/notifications"
        class="flex flex-col items-center justify-center flex-1 py-8 transition relative"
        :class="isActive('/notifications') ? 'text-primary' : 'text-text-muted hover:text-text'"
      >
        <div class="relative">
          <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>

          <!-- Badge -->
          <span
            v-if="notificationsStore.unreadCount > 0"
            class="absolute -top-8 -right-8 w-16 h-16 bg-error rounded-full flex items-center justify-center text-white text-[10px] font-bold"
          >
            {{ notificationsStore.unreadCount > 9 ? '9+' : notificationsStore.unreadCount }}
          </span>
        </div>
        <span class="text-xs mt-4">Alerts</span>
      </router-link>

      <!-- Profile -->
      <router-link
        v-if="authStore.user"
        :to="`/profile/${authStore.user.username}`"
        class="flex flex-col items-center justify-center flex-1 py-8 transition"
        :class="route.path.includes(`/profile/${authStore.user.username}`) ? 'text-primary' : 'text-text-muted hover:text-text'"
      >
        <div class="w-24 h-24 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
          <img
            v-if="authStore.user.avatar_url"
            :src="authStore.user.avatar_url"
            :alt="authStore.user.display_name || authStore.user.username"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-xs font-bold text-primary">
            {{ (authStore.user.display_name || authStore.user.username).charAt(0).toUpperCase() }}
          </span>
        </div>
        <span class="text-xs mt-4">Profile</span>
      </router-link>
    </div>
  </nav>
</template>
