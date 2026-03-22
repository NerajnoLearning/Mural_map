<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const authStore = useAuthStore()
const appStore = useAppStore()

onMounted(() => {
  // Auth store auto-initializes on first use
  // Sync user to Supabase if authenticated
  if (authStore.isAuthenticated && !authStore.synced) {
    authStore.syncUserToSupabase()
  }

  appStore.initializeTheme()
  appStore.initializeOnlineStatus()
})
</script>

<template>
  <div class="min-h-screen bg-surface">
    <!-- Header -->
    <header class="bg-surface-elevated border-b border-border">
      <div class="max-w-content mx-auto px-16 py-16">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-primary">MuralMap</h1>

          <nav class="flex items-center gap-16">
            <router-link
              v-if="authStore.isAuthenticated"
              to="/upload"
              class="px-16 py-8 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              Upload
            </router-link>

            <router-link
              v-else
              to="/auth/signin"
              class="px-16 py-8 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              Sign In
            </router-link>

            <button
              @click="appStore.toggleTheme"
              class="p-8 rounded-lg hover:bg-surface-overlay transition"
              aria-label="Toggle theme"
            >
              {{ appStore.theme === 'light' ? '🌙' : '☀️' }}
            </button>
          </nav>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="max-w-content mx-auto px-16 py-48">
      <div class="text-center">
        <h2 class="text-3xl font-bold mb-24">
          Discover Street Art Around You
        </h2>
        <p class="text-lg text-text-muted mb-32 max-w-2xl mx-auto">
          MuralMap is a mobile-first, social photo-logging web application that allows you to discover,
          photograph, and share street murals. Document art before it disappears, connect with fellow
          enthusiasts, and explore murals on an interactive map.
        </p>

        <div class="flex gap-16 justify-center">
          <router-link
            to="/discover"
            class="px-24 py-12 bg-accent text-white rounded-lg hover:bg-accent-dark transition text-lg font-semibold"
          >
            Explore Murals
          </router-link>
          <router-link
            to="/map"
            class="px-24 py-12 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition text-lg font-semibold"
          >
            View Map
          </router-link>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="mt-64 grid grid-cols-1 md:grid-cols-3 gap-24">
        <div class="bg-surface-elevated p-24 rounded-lg">
          <div class="text-3xl mb-12">📸</div>
          <h3 class="text-xl font-bold mb-8">Document Art</h3>
          <p class="text-text-muted">
            Log murals with GPS data, artist credits, and detailed descriptions. Preserve street art history.
          </p>
        </div>

        <div class="bg-surface-elevated p-24 rounded-lg">
          <div class="text-3xl mb-12">🗺️</div>
          <h3 class="text-xl font-bold mb-8">Explore Maps</h3>
          <p class="text-text-muted">
            Discover murals near you with our interactive map. Filter by style, artist, or location.
          </p>
        </div>

        <div class="bg-surface-elevated p-24 rounded-lg">
          <div class="text-3xl mb-12">👥</div>
          <h3 class="text-xl font-bold mb-8">Connect</h3>
          <p class="text-text-muted">
            Follow friends, share collections, and join a community of street art enthusiasts.
          </p>
        </div>
      </div>
    </main>

    <!-- Toast Container -->
    <div class="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 space-y-8">
      <div
        v-for="toast in appStore.toasts"
        :key="toast.id"
        class="toast"
        :class="{
          'bg-success': toast.type === 'success',
          'bg-error': toast.type === 'error',
          'bg-warning': toast.type === 'warning',
          'bg-info': toast.type === 'info'
        }"
      >
        <span>{{ toast.message }}</span>
        <button
          @click="appStore.dismissToast(toast.id)"
          class="ml-16 text-white font-bold"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toast {
  @apply text-white;
}
</style>
