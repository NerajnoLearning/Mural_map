<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import type { UserProfile } from '@/types'

const emit = defineEmits<{
  (e: 'select', user: UserProfile): void
}>()

const usersStore = useUsersStore()
const router = useRouter()

const searchQuery = ref('')
const showResults = ref(false)
const debounceTimeout = ref<number | null>(null)

// Watch for search query changes with debounce
watch(searchQuery, (newQuery) => {
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value)
  }

  if (!newQuery.trim()) {
    showResults.value = false
    usersStore.searchResults = []
    return
  }

  debounceTimeout.value = window.setTimeout(async () => {
    await usersStore.searchUsers(newQuery)
    showResults.value = true
  }, 300)
})

const selectUser = (user: UserProfile) => {
  emit('select', user)
  router.push(`/profile/${user.username}`)
  searchQuery.value = ''
  showResults.value = false
}

const handleBlur = () => {
  // Delay to allow click on results
  setTimeout(() => {
    showResults.value = false
  }, 200)
}

const handleFocus = () => {
  if (searchQuery.value.trim() && usersStore.searchResults.length > 0) {
    showResults.value = true
  }
}
</script>

<template>
  <div class="relative">
    <!-- Search input -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search users..."
        class="w-full px-40 py-12 bg-surface-elevated border-2 border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:border-primary transition"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <svg
        class="absolute left-12 top-1/2 -translate-y-1/2 w-20 h-20 text-text-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      <!-- Loading spinner -->
      <svg
        v-if="usersStore.searchLoading"
        class="absolute right-12 top-1/2 -translate-y-1/2 animate-spin h-20 w-20 text-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Results dropdown -->
    <div
      v-if="showResults && usersStore.searchResults.length > 0"
      class="absolute top-full left-0 right-0 mt-8 bg-surface-elevated border-2 border-border rounded-lg shadow-lg overflow-hidden z-50"
    >
      <button
        v-for="user in usersStore.searchResults"
        :key="user.id"
        @click="selectUser(user)"
        class="w-full px-16 py-12 flex items-center gap-12 hover:bg-surface-overlay transition text-left"
      >
        <!-- Avatar -->
        <div class="w-40 h-40 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0">
          <img
            v-if="user.avatar_url"
            :src="user.avatar_url"
            :alt="user.display_name || user.username"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-sm font-bold text-primary">
            {{ (user.display_name || user.username).charAt(0).toUpperCase() }}
          </span>
        </div>

        <!-- User info -->
        <div class="flex-1 min-w-0">
          <p class="font-medium text-text truncate">
            {{ user.display_name || user.username }}
          </p>
          <p class="text-sm text-text-muted truncate">
            @{{ user.username }}
          </p>
        </div>
      </button>
    </div>

    <!-- No results -->
    <div
      v-else-if="showResults && searchQuery.trim() && !usersStore.searchLoading && usersStore.searchResults.length === 0"
      class="absolute top-full left-0 right-0 mt-8 bg-surface-elevated border-2 border-border rounded-lg shadow-lg p-24 z-50 text-center"
    >
      <svg class="w-48 h-48 text-text-muted mx-auto mb-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p class="text-text-muted">No users found</p>
    </div>
  </div>
</template>
