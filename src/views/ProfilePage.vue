<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'
import { useFriendsStore } from '@/stores/friends'
import { useAppStore } from '@/stores/app'
import PostCard from '@/components/feed/PostCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { UserProfile, Post } from '@/types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const usersStore = useUsersStore()
const friendsStore = useFriendsStore()
const appStore = useAppStore()

const username = computed(() => route.params.username as string)
const profile = ref<UserProfile | null>(null)
const posts = ref<Post[]>([])
const loading = ref(true)
const postsLoading = ref(false)
const friendActionLoading = ref(false)
const activeTab = ref<'posts' | 'favorites'>('posts')

const isOwnProfile = computed(() => {
  return authStore.user?.username === username.value
})

onMounted(async () => {
  await loadProfile()
})

const loadProfile = async () => {
  loading.value = true

  try {
    const data = await usersStore.getProfile(username.value)

    if (!data) {
      appStore.showToast('User not found', 'error')
      router.push('/discover')
      return
    }

    profile.value = data

    // Check friend status if not own profile
    if (!isOwnProfile.value && authStore.user) {
      const { isFriend, status } = await usersStore.getFriendStatus(
        authStore.user.id,
        data.id
      )
      profile.value.is_friend = isFriend
      profile.value.friend_status = status
    }

    await loadPosts()

  } catch (error) {
    appStore.showToast('Failed to load profile', 'error')
  } finally {
    loading.value = false
  }
}

const loadPosts = async () => {
  if (!profile.value) return

  postsLoading.value = true

  try {
    const data = await usersStore.getUserPosts(
      profile.value.id,
      authStore.user?.id
    )
    posts.value = data
  } catch (error) {
    appStore.showToast('Failed to load posts', 'error')
  } finally {
    postsLoading.value = false
  }
}

const goToSettings = () => {
  router.push('/settings')
}

const handleAddFriend = async () => {
  if (!authStore.user || !profile.value || friendActionLoading.value) return

  friendActionLoading.value = true

  try {
    await friendsStore.sendRequest(authStore.user.id, profile.value.id)
    profile.value.friend_status = 'pending'
    appStore.showToast('Friend request sent', 'success')
  } catch (error) {
    appStore.showToast('Failed to send friend request', 'error')
  } finally {
    friendActionLoading.value = false
  }
}

const handleCancelRequest = async () => {
  if (!authStore.user || !profile.value || friendActionLoading.value) return

  friendActionLoading.value = true

  try {
    await friendsStore.cancelRequest(authStore.user.id, profile.value.id)
    profile.value.friend_status = null
    appStore.showToast('Request canceled', 'success')
  } catch (error) {
    appStore.showToast('Failed to cancel request', 'error')
  } finally {
    friendActionLoading.value = false
  }
}

const handleRemoveFriend = async () => {
  if (!authStore.user || !profile.value || friendActionLoading.value) return

  friendActionLoading.value = true

  try {
    await friendsStore.removeFriend(authStore.user.id, profile.value.id)
    profile.value.is_friend = false
    profile.value.friend_status = null
    profile.value.friends_count = (profile.value.friends_count || 1) - 1
    appStore.showToast('Friend removed', 'success')
  } catch (error) {
    appStore.showToast('Failed to remove friend', 'error')
  } finally {
    friendActionLoading.value = false
  }
}

const formatJoinDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })
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

    <!-- Profile content -->
    <div v-else-if="profile" class="max-w-content mx-auto">
      <!-- Header -->
      <header class="bg-surface-elevated border-b border-border">
        <div class="px-16 py-24 sm:px-24">
          <div class="flex items-start gap-16 sm:gap-24">
            <!-- Avatar -->
            <div class="w-80 h-80 sm:w-120 sm:h-120 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0">
              <img
                v-if="profile.avatar_url"
                :src="profile.avatar_url"
                :alt="profile.display_name || profile.username"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-4xl sm:text-5xl font-bold text-primary">
                {{ (profile.display_name || profile.username).charAt(0).toUpperCase() }}
              </span>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-12 mb-12">
                <div class="min-w-0">
                  <h1 class="text-2xl sm:text-3xl font-bold text-text truncate">
                    {{ profile.display_name || profile.username }}
                  </h1>
                  <p class="text-text-muted">@{{ profile.username }}</p>
                </div>

                <!-- Actions -->
                <div v-if="isOwnProfile" class="flex-shrink-0">
                  <BaseButton
                    variant="outline"
                    size="sm"
                    @click="goToSettings"
                  >
                    Edit Profile
                  </BaseButton>
                </div>
                <div v-else-if="authStore.isAuthenticated" class="flex-shrink-0 flex gap-8">
                  <BaseButton
                    v-if="profile.is_friend"
                    variant="outline"
                    size="sm"
                    @click="handleRemoveFriend"
                    :loading="friendActionLoading"
                  >
                    <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Friends
                  </BaseButton>
                  <BaseButton
                    v-else-if="profile.friend_status === 'pending'"
                    variant="outline"
                    size="sm"
                    @click="handleCancelRequest"
                    :loading="friendActionLoading"
                  >
                    Cancel Request
                  </BaseButton>
                  <BaseButton
                    v-else
                    variant="primary"
                    size="sm"
                    @click="handleAddFriend"
                    :loading="friendActionLoading"
                  >
                    <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Add Friend
                  </BaseButton>
                </div>
              </div>

              <!-- Bio -->
              <p v-if="profile.bio" class="text-text mb-16">
                {{ profile.bio }}
              </p>

              <!-- Stats -->
              <div class="flex items-center gap-24 text-sm">
                <div>
                  <span class="font-bold text-text">{{ profile.posts_count || 0 }}</span>
                  <span class="text-text-muted ml-4">posts</span>
                </div>
                <div>
                  <span class="font-bold text-text">{{ profile.friends_count || 0 }}</span>
                  <span class="text-text-muted ml-4">friends</span>
                </div>
                <div>
                  <span class="font-bold text-text">{{ profile.favorites_count || 0 }}</span>
                  <span class="text-text-muted ml-4">favorites</span>
                </div>
              </div>

              <!-- Join date -->
              <p class="text-sm text-text-muted mt-12">
                Joined {{ formatJoinDate(profile.created_at) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex border-t border-border">
          <button
            @click="activeTab = 'posts'"
            class="flex-1 px-16 py-12 text-sm font-medium transition border-b-2"
            :class="activeTab === 'posts'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text'"
          >
            Posts
          </button>
          <button
            @click="activeTab = 'favorites'"
            class="flex-1 px-16 py-12 text-sm font-medium transition border-b-2"
            :class="activeTab === 'favorites'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text'"
          >
            Favorites
          </button>
        </div>
      </header>

      <!-- Posts grid -->
      <main class="p-16 sm:p-24">
        <div v-if="postsLoading" class="flex items-center justify-center py-48">
          <svg class="animate-spin h-48 w-48 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <div v-else-if="posts.length === 0" class="text-center py-48">
          <svg class="w-64 h-64 text-text-muted mx-auto mb-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="text-lg font-bold text-text mb-8">No posts yet</h3>
          <p class="text-text-muted">
            {{ isOwnProfile ? "Share your first mural to get started!" : "This user hasn't posted any murals yet." }}
          </p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
          />
        </div>
      </main>
    </div>
  </div>
</template>
