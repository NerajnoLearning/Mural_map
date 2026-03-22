<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSearchStore } from '@/stores/search'
import PostCard from '@/components/feed/PostCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const searchStore = useSearchStore()

const searchQuery = ref('')
const activeTab = ref<'all' | 'users' | 'posts' | 'tags'>('all')
const debounceTimeout = ref<number | null>(null)

// Debounced search
watch(searchQuery, (newQuery) => {
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value)
  }

  if (!newQuery.trim()) {
    searchStore.clear()
    return
  }

  debounceTimeout.value = window.setTimeout(async () => {
    await searchStore.search(newQuery, authStore.user?.id)
  }, 300)
})

const goToProfile = (username: string) => {
  router.push(`/profile/${username}`)
}

const goToPost = (postId: string) => {
  router.push(`/post/${postId}`)
}

const searchByTag = async (tagLabel: string) => {
  searchQuery.value = tagLabel
  activeTab.value = 'posts'
  await searchStore.searchByTag(tagLabel, authStore.user?.id)
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <div class="max-w-content mx-auto">
      <!-- Header -->
      <header class="sticky top-0 z-10 bg-surface-elevated border-b border-border px-16 py-16">
        <div class="flex items-center gap-12">
          <div class="relative flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search users, posts, or tags..."
              class="w-full px-40 py-12 bg-surface border-2 border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:border-primary transition"
            />
            <svg
              class="absolute left-12 top-1/2 -translate-y-1/2 w-20 h-20 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            <svg
              v-if="searchStore.loading"
              class="absolute right-12 top-1/2 -translate-y-1/2 animate-spin h-20 w-20 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>

        <!-- Tabs -->
        <div v-if="searchQuery" class="flex gap-4 mt-16">
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
            @click="activeTab = 'users'"
            class="px-16 py-8 rounded-lg text-sm font-medium transition"
            :class="activeTab === 'users'
              ? 'bg-primary text-white'
              : 'bg-surface text-text hover:bg-surface-overlay'"
          >
            Users ({{ searchStore.results.users.length }})
          </button>
          <button
            @click="activeTab = 'posts'"
            class="px-16 py-8 rounded-lg text-sm font-medium transition"
            :class="activeTab === 'posts'
              ? 'bg-primary text-white'
              : 'bg-surface text-text hover:bg-surface-overlay'"
          >
            Posts ({{ searchStore.results.posts.length }})
          </button>
          <button
            @click="activeTab = 'tags'"
            class="px-16 py-8 rounded-lg text-sm font-medium transition"
            :class="activeTab === 'tags'
              ? 'bg-primary text-white'
              : 'bg-surface text-text hover:bg-surface-overlay'"
          >
            Tags ({{ searchStore.results.tags.length }})
          </button>
        </div>
      </header>

      <!-- Results -->
      <main class="p-16 sm:p-24">
        <!-- Empty state (no query) -->
        <div v-if="!searchQuery" class="text-center py-48">
          <svg class="w-64 h-64 text-text-muted mx-auto mb-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 class="text-lg font-bold text-text mb-8">Start searching</h3>
          <p class="text-text-muted">
            Search for users, posts, or tags
          </p>
        </div>

        <!-- All results -->
        <div v-else-if="activeTab === 'all'" class="space-y-32">
          <!-- Users section -->
          <div v-if="searchStore.results.users.length > 0">
            <h2 class="text-lg font-bold text-text mb-12">Users</h2>
            <div class="space-y-8">
              <button
                v-for="user in searchStore.results.users.slice(0, 5)"
                :key="user.id"
                @click="goToProfile(user.username)"
                class="w-full px-16 py-12 bg-surface-elevated rounded-lg flex items-center gap-12 hover:bg-surface-overlay transition text-left"
              >
                <div class="w-48 h-48 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img
                    v-if="user.avatar_url"
                    :src="user.avatar_url"
                    :alt="user.display_name || user.username"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-lg font-bold text-primary">
                    {{ (user.display_name || user.username).charAt(0).toUpperCase() }}
                  </span>
                </div>
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
          </div>

          <!-- Posts section -->
          <div v-if="searchStore.results.posts.length > 0">
            <h2 class="text-lg font-bold text-text mb-12">Posts</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
              <PostCard
                v-for="post in searchStore.results.posts.slice(0, 6)"
                :key="post.id"
                :post="post"
              />
            </div>
          </div>

          <!-- Tags section -->
          <div v-if="searchStore.results.tags.length > 0">
            <h2 class="text-lg font-bold text-text mb-12">Tags</h2>
            <div class="flex flex-wrap gap-8">
              <button
                v-for="tag in searchStore.results.tags"
                :key="tag.id"
                @click="searchByTag(tag.label)"
                class="px-12 py-6 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition"
              >
                #{{ tag.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Users only -->
        <div v-else-if="activeTab === 'users' && searchStore.results.users.length > 0" class="space-y-8">
          <button
            v-for="user in searchStore.results.users"
            :key="user.id"
            @click="goToProfile(user.username)"
            class="w-full px-16 py-12 bg-surface-elevated rounded-lg flex items-center gap-12 hover:bg-surface-overlay transition text-left"
          >
            <div class="w-48 h-48 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0">
              <img
                v-if="user.avatar_url"
                :src="user.avatar_url"
                :alt="user.display_name || user.username"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-lg font-bold text-primary">
                {{ (user.display_name || user.username).charAt(0).toUpperCase() }}
              </span>
            </div>
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

        <!-- Posts only -->
        <div v-else-if="activeTab === 'posts' && searchStore.results.posts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
          <PostCard
            v-for="post in searchStore.results.posts"
            :key="post.id"
            :post="post"
          />
        </div>

        <!-- Tags only -->
        <div v-else-if="activeTab === 'tags' && searchStore.results.tags.length > 0" class="flex flex-wrap gap-12">
          <button
            v-for="tag in searchStore.results.tags"
            :key="tag.id"
            @click="searchByTag(tag.label)"
            class="px-16 py-12 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition"
          >
            #{{ tag.label }}
          </button>
        </div>

        <!-- No results for current tab -->
        <div v-else-if="searchQuery && !searchStore.loading" class="text-center py-48">
          <svg class="w-64 h-64 text-text-muted mx-auto mb-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 class="text-lg font-bold text-text mb-8">No results found</h3>
          <p class="text-text-muted">
            Try different keywords or search in another tab
          </p>
        </div>
      </main>
    </div>
  </div>
</template>
