<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { useOfflineDrafts } from '@/composables/useOfflineDrafts'
import TopNav from '@/components/layout/TopNav.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import ReconnectBanner from '@/components/ui/ReconnectBanner.vue'

const route = useRoute()

// Initialize store
const appStore = useAppStore()
const { toasts } = storeToRefs(appStore)

const router = useRouter()
const { pendingPosts, getAllPendingPosts } = useOfflineDrafts()
const showReconnectBanner = ref(false)

watch(() => appStore.isOnline, async (online, wasOnline) => {
  if (online && wasOnline === false) {
    await getAllPendingPosts()
    if (pendingPosts.value.length > 0) {
      showReconnectBanner.value = true
    }
  }
})

function handleSync() {
  showReconnectBanner.value = false
  router.push('/drafts')
}

// Check if user is signed in - safely handle Clerk
const isSignedIn = ref(false)

// Try to get Clerk auth status (this runs at component setup)
onMounted(async () => {
  try {
    const { useAuth } = await import('@clerk/vue')
    const auth = useAuth()
    isSignedIn.value = auth.isSignedIn.value ?? false

    // Watch for changes
    watch(() => auth.isSignedIn.value, (newValue) => {
      isSignedIn.value = newValue ?? false
    })
  } catch (err) {
    const { logger } = await import('@/utils/logger')
    logger.warn('Clerk not initialized. Please check your VITE_CLERK_PUBLISHABLE_KEY in .env')
  }

  appStore.initializeTheme()
  appStore.initializeOnlineStatus()
})

// Routes where we don't show navigation
const noNavRoutes = ['/sign-in', '/sign-up', '/auth/signin', '/auth/signup', '/']

const shouldShowNav = computed(() => {
  return !noNavRoutes.includes(route.path) && isSignedIn.value
})

onMounted(() => {
  appStore.initializeTheme()
  appStore.initializeOnlineStatus()
})
</script>

<template>
  <ErrorBoundary name="App">
    <div
      id="app"
      class="min-h-screen bg-surface text-text"
    >
      <!-- Top Navigation (Desktop) -->
      <TopNav v-if="shouldShowNav" />

      <!-- Main Content -->
      <div :class="{ 'pb-64 md:pb-0': shouldShowNav }">
        <ErrorBoundary name="RouterView">
          <RouterView />
        </ErrorBoundary>
      </div>

      <!-- Reconnect Banner -->
      <ReconnectBanner
        v-if="showReconnectBanner && shouldShowNav"
        :count="pendingPosts.length"
        :on-sync="handleSync"
        :on-dismiss="() => (showReconnectBanner = false)"
      />

      <!-- Bottom Navigation (Mobile) -->
      <BottomNav v-if="shouldShowNav" />

      <!-- Toast Container -->
      <div class="fixed bottom-80 md:bottom-24 left-1/2 transform -translate-x-1/2 z-50 space-y-8 max-w-md w-full px-16">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="px-16 py-12 rounded-lg shadow-lg text-white flex items-center justify-between"
          :class="{
            'bg-success': toast.type === 'success',
            'bg-error': toast.type === 'error',
            'bg-warning': toast.type === 'warning',
            'bg-info': toast.type === 'info'
          }"
        >
          <span>{{ toast.message }}</span>
          <button
            class="ml-16 text-white font-bold text-xl"
            aria-label="Dismiss"
            @click="appStore.dismissToast(toast.id)"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </ErrorBoundary>
</template>

<style scoped>
</style>
