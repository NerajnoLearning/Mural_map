<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFriendsStore } from '@/stores/friends'
import { useAppStore } from '@/stores/app'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const friendsStore = useFriendsStore()
const appStore = useAppStore()

const activeTab = ref<'friends' | 'requests' | 'sent'>('friends')
const actionLoading = ref<string | null>(null)

const requestsCount = computed(() => friendsStore.requests.length)

onMounted(async () => {
  if (!authStore.user) return

  await Promise.all([
    friendsStore.fetchFriends(authStore.user.id),
    friendsStore.fetchRequests(authStore.user.id),
    friendsStore.fetchSentRequests(authStore.user.id)
  ])
})

const goToProfile = (username: string) => {
  router.push(`/profile/${username}`)
}

const handleAccept = async (requesterId: string) => {
  if (!authStore.user || actionLoading.value) return

  actionLoading.value = requesterId

  try {
    await friendsStore.acceptRequest(requesterId, authStore.user.id)
    appStore.showToast('Friend request accepted', 'success')
  } catch (error) {
    appStore.showToast('Failed to accept request', 'error')
  } finally {
    actionLoading.value = null
  }
}

const handleDecline = async (requesterId: string) => {
  if (!authStore.user || actionLoading.value) return

  actionLoading.value = requesterId

  try {
    await friendsStore.declineRequest(requesterId, authStore.user.id)
    appStore.showToast('Friend request declined', 'success')
  } catch (error) {
    appStore.showToast('Failed to decline request', 'error')
  } finally {
    actionLoading.value = null
  }
}

const handleCancelSent = async (addresseeId: string) => {
  if (!authStore.user || actionLoading.value) return

  actionLoading.value = addresseeId

  try {
    await friendsStore.cancelRequest(authStore.user.id, addresseeId)
    appStore.showToast('Request canceled', 'success')
  } catch (error) {
    appStore.showToast('Failed to cancel request', 'error')
  } finally {
    actionLoading.value = null
  }
}

const handleRemove = async (friendId: string) => {
  if (!authStore.user || actionLoading.value) return

  actionLoading.value = friendId

  try {
    await friendsStore.removeFriend(authStore.user.id, friendId)
    appStore.showToast('Friend removed', 'success')
  } catch (error) {
    appStore.showToast('Failed to remove friend', 'error')
  } finally {
    actionLoading.value = null
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <div class="max-w-content mx-auto">
      <!-- Header -->
      <header class="bg-surface-elevated border-b border-border px-16 py-24">
        <h1 class="text-3xl font-bold text-text">Friends</h1>
        <p class="text-text-muted mt-4">Manage your connections</p>
      </header>

      <!-- Tabs -->
      <div class="flex border-b border-border bg-surface-elevated sticky top-0 z-10">
        <button
          @click="activeTab = 'friends'"
          class="flex-1 px-16 py-12 text-sm font-medium transition border-b-2 relative"
          :class="activeTab === 'friends'
            ? 'border-primary text-primary'
            : 'border-transparent text-text-muted hover:text-text'"
        >
          Friends
          <span v-if="friendsStore.friends.length > 0" class="ml-6 text-xs">
            ({{ friendsStore.friends.length }})
          </span>
        </button>
        <button
          @click="activeTab = 'requests'"
          class="flex-1 px-16 py-12 text-sm font-medium transition border-b-2 relative"
          :class="activeTab === 'requests'
            ? 'border-primary text-primary'
            : 'border-transparent text-text-muted hover:text-text'"
        >
          Requests
          <span
            v-if="requestsCount > 0"
            class="ml-6 px-6 py-2 bg-error text-white text-xs rounded-full"
          >
            {{ requestsCount }}
          </span>
        </button>
        <button
          @click="activeTab = 'sent'"
          class="flex-1 px-16 py-12 text-sm font-medium transition border-b-2"
          :class="activeTab === 'sent'
            ? 'border-primary text-primary'
            : 'border-transparent text-text-muted hover:text-text'"
        >
          Sent
          <span v-if="friendsStore.sentRequests.length > 0" class="ml-6 text-xs">
            ({{ friendsStore.sentRequests.length }})
          </span>
        </button>
      </div>

      <!-- Content -->
      <main class="p-16 sm:p-24">
        <!-- Friends tab -->
        <div v-if="activeTab === 'friends'">
          <div v-if="friendsStore.loading" class="flex items-center justify-center py-48">
            <svg class="animate-spin h-48 w-48 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          <div v-else-if="friendsStore.friends.length === 0" class="text-center py-48">
            <svg class="w-64 h-64 text-text-muted mx-auto mb-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 class="text-lg font-bold text-text mb-8">No friends yet</h3>
            <p class="text-text-muted mb-16">
              Search for users to add friends
            </p>
            <BaseButton
              variant="primary"
              @click="router.push('/search')"
            >
              Find Friends
            </BaseButton>
          </div>

          <div v-else class="space-y-8">
            <div
              v-for="friend in friendsStore.friends"
              :key="friend.user.id"
              class="p-16 bg-surface-elevated rounded-lg flex items-center justify-between gap-12"
            >
              <button
                @click="goToProfile(friend.user.username)"
                class="flex items-center gap-12 hover:opacity-75 transition text-left min-w-0"
              >
                <!-- Avatar -->
                <div class="w-48 h-48 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img
                    v-if="friend.user.avatar_url"
                    :src="friend.user.avatar_url"
                    :alt="friend.user.display_name || friend.user.username"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-lg font-bold text-primary">
                    {{ (friend.user.display_name || friend.user.username).charAt(0).toUpperCase() }}
                  </span>
                </div>

                <!-- User info -->
                <div class="min-w-0">
                  <p class="font-medium text-text truncate">
                    {{ friend.user.display_name || friend.user.username }}
                  </p>
                  <p class="text-sm text-text-muted truncate">
                    @{{ friend.user.username }}
                  </p>
                  <p class="text-xs text-text-muted mt-2">
                    Friends since {{ formatDate(friend.created_at) }}
                  </p>
                </div>
              </button>

              <BaseButton
                variant="outline"
                size="sm"
                @click="handleRemove(friend.user.id)"
                :loading="actionLoading === friend.user.id"
              >
                Remove
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Requests tab -->
        <div v-else-if="activeTab === 'requests'">
          <div v-if="friendsStore.loading" class="flex items-center justify-center py-48">
            <svg class="animate-spin h-48 w-48 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          <div v-else-if="friendsStore.requests.length === 0" class="text-center py-48">
            <svg class="w-64 h-64 text-text-muted mx-auto mb-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
            <h3 class="text-lg font-bold text-text mb-8">No pending requests</h3>
            <p class="text-text-muted">
              You don't have any friend requests at the moment
            </p>
          </div>

          <div v-else class="space-y-8">
            <div
              v-for="request in friendsStore.requests"
              :key="request.user.id"
              class="p-16 bg-surface-elevated rounded-lg flex items-center justify-between gap-12"
            >
              <button
                @click="goToProfile(request.user.username)"
                class="flex items-center gap-12 hover:opacity-75 transition text-left min-w-0"
              >
                <!-- Avatar -->
                <div class="w-48 h-48 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img
                    v-if="request.user.avatar_url"
                    :src="request.user.avatar_url"
                    :alt="request.user.display_name || request.user.username"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-lg font-bold text-primary">
                    {{ (request.user.display_name || request.user.username).charAt(0).toUpperCase() }}
                  </span>
                </div>

                <!-- User info -->
                <div class="min-w-0">
                  <p class="font-medium text-text truncate">
                    {{ request.user.display_name || request.user.username }}
                  </p>
                  <p class="text-sm text-text-muted truncate">
                    @{{ request.user.username }}
                  </p>
                  <p class="text-xs text-text-muted mt-2">
                    Sent {{ formatDate(request.created_at) }}
                  </p>
                </div>
              </button>

              <div class="flex gap-8 flex-shrink-0">
                <BaseButton
                  variant="primary"
                  size="sm"
                  @click="handleAccept(request.user.id)"
                  :loading="actionLoading === request.user.id"
                >
                  Accept
                </BaseButton>
                <BaseButton
                  variant="outline"
                  size="sm"
                  @click="handleDecline(request.user.id)"
                  :loading="actionLoading === request.user.id"
                >
                  Decline
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Sent requests tab -->
        <div v-else-if="activeTab === 'sent'">
          <div v-if="friendsStore.loading" class="flex items-center justify-center py-48">
            <svg class="animate-spin h-48 w-48 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          <div v-else-if="friendsStore.sentRequests.length === 0" class="text-center py-48">
            <svg class="w-64 h-64 text-text-muted mx-auto mb-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <h3 class="text-lg font-bold text-text mb-8">No sent requests</h3>
            <p class="text-text-muted">
              You haven't sent any friend requests
            </p>
          </div>

          <div v-else class="space-y-8">
            <div
              v-for="sent in friendsStore.sentRequests"
              :key="sent.user.id"
              class="p-16 bg-surface-elevated rounded-lg flex items-center justify-between gap-12"
            >
              <button
                @click="goToProfile(sent.user.username)"
                class="flex items-center gap-12 hover:opacity-75 transition text-left min-w-0"
              >
                <!-- Avatar -->
                <div class="w-48 h-48 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img
                    v-if="sent.user.avatar_url"
                    :src="sent.user.avatar_url"
                    :alt="sent.user.display_name || sent.user.username"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-lg font-bold text-primary">
                    {{ (sent.user.display_name || sent.user.username).charAt(0).toUpperCase() }}
                  </span>
                </div>

                <!-- User info -->
                <div class="min-w-0">
                  <p class="font-medium text-text truncate">
                    {{ sent.user.display_name || sent.user.username }}
                  </p>
                  <p class="text-sm text-text-muted truncate">
                    @{{ sent.user.username }}
                  </p>
                  <p class="text-xs text-text-muted mt-2">
                    Sent {{ formatDate(sent.created_at) }}
                  </p>
                </div>
              </button>

              <BaseButton
                variant="outline"
                size="sm"
                @click="handleCancelSent(sent.user.id)"
                :loading="actionLoading === sent.user.id"
              >
                Cancel
              </BaseButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
