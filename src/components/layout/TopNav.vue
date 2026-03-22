<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const appStore = useAppStore()

const realtimeChannel = ref<any>(null)
const showUserMenu = ref(false)

const user = computed(() => authStore.user)

onMounted(async () => {
  if (user.value?.id) {
    await notificationsStore.fetchNotifications(user.value.id)
    realtimeChannel.value = notificationsStore.subscribeToNotifications(user.value.id)
  }
})

onUnmounted(() => {
  if (realtimeChannel.value) {
    notificationsStore.unsubscribe(realtimeChannel.value)
  }
})

const handleSignOut = async () => {
  showUserMenu.value = false
  await authStore.signOut()
  router.push('/')
}
</script>

<template>
  <header class="bg-surface-elevated border-b border-border">
    <div class="max-w-content mx-auto px-16 py-16">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="text-2xl font-bold text-primary flex items-center gap-8">
          <span>🎨</span>
          <span>MuralMap</span>
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-24">
          <router-link
            to="/discover"
            class="text-text hover:text-primary transition font-medium"
            :class="{ 'text-primary': route.path === '/discover' }"
          >
            Discover
          </router-link>

          <router-link
            to="/trending"
            class="text-text hover:text-primary transition font-medium flex items-center gap-6"
            :class="{ 'text-primary': route.path === '/trending' }"
          >
            <span>🔥</span>
            <span>Trending</span>
          </router-link>

          <router-link
            to="/map"
            class="text-text hover:text-primary transition font-medium"
            :class="{ 'text-primary': route.path === '/map' }"
          >
            Map
          </router-link>

          <router-link
            to="/search"
            class="text-text hover:text-primary transition font-medium"
            :class="{ 'text-primary': route.path === '/search' }"
          >
            Search
          </router-link>

          <router-link
            v-if="authStore.isAuthenticated"
            to="/collections"
            class="text-text hover:text-primary transition font-medium"
            :class="{ 'text-primary': route.path.startsWith('/collections') }"
          >
            Collections
          </router-link>

          <router-link
            v-if="authStore.isAuthenticated"
            to="/friends"
            class="text-text hover:text-primary transition font-medium"
            :class="{ 'text-primary': route.path === '/friends' }"
          >
            Friends
          </router-link>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-12">
          <!-- Theme Toggle -->
          <button
            @click="appStore.toggleTheme"
            class="p-8 rounded-lg hover:bg-surface-overlay transition"
            aria-label="Toggle theme"
          >
            {{ appStore.theme === 'light' ? '🌙' : '☀️' }}
          </button>

          <!-- Notifications (authenticated users) -->
          <router-link
            v-if="authStore.isAuthenticated"
            to="/notifications"
            class="relative p-8 rounded-lg hover:bg-surface-overlay transition"
            :class="{ 'bg-surface-overlay': route.path === '/notifications' }"
          >
            <svg class="w-24 h-24 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>

            <!-- Badge -->
            <span
              v-if="notificationsStore.unreadCount > 0"
              class="absolute top-4 right-4 w-16 h-16 bg-error rounded-full flex items-center justify-center text-white text-[10px] font-bold"
            >
              {{ notificationsStore.unreadCount > 9 ? '9+' : notificationsStore.unreadCount }}
            </span>
          </router-link>

          <!-- Upload Button -->
          <router-link
            v-if="authStore.isAuthenticated"
            to="/upload"
            class="px-16 py-8 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
          >
            Upload
          </router-link>

          <!-- User Menu (authenticated) -->
          <div v-if="authStore.isAuthenticated" class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="w-40 h-40 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-primary transition"
            >
              <img
                v-if="user?.imageUrl"
                :src="user.imageUrl"
                :alt="user.fullName || user.username || ''"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-lg font-bold text-primary">
                {{ (user?.fullName || user?.username || '?').charAt(0).toUpperCase() }}
              </span>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showUserMenu"
              @click="showUserMenu = false"
              class="absolute right-0 mt-8 w-200 bg-surface-elevated rounded-lg shadow-lg border border-border overflow-hidden"
            >
              <router-link
                v-if="user"
                :to="`/profile/${user.username}`"
                class="block px-16 py-12 hover:bg-surface-overlay transition text-text"
              >
                <div class="font-medium">{{ user.fullName || user.username }}</div>
                <div class="text-sm text-text-muted">@{{ user.username }}</div>
              </router-link>

              <div class="border-t border-border"></div>

              <router-link
                to="/settings"
                class="block px-16 py-12 hover:bg-surface-overlay transition text-text"
              >
                Settings
              </router-link>

              <div class="border-t border-border"></div>

              <button
                @click="handleSignOut"
                class="w-full text-left px-16 py-12 hover:bg-surface-overlay transition text-error"
              >
                Sign Out
              </button>
            </div>
          </div>

          <!-- Sign In Button (guest) -->
          <router-link
            v-else
            to="/sign-in"
            class="px-16 py-8 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
          >
            Sign In
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>
