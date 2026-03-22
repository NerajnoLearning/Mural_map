<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCommentsStore } from '@/stores/comments'
import { useAppStore } from '@/stores/app'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { Comment } from '@/types'
import { sanitizeText } from '@/utils/sanitize'

const props = defineProps<{
  comment: Comment
}>()

const emit = defineEmits<{
  (e: 'delete'): void
}>()

const router = useRouter()
const authStore = useAuthStore()
const commentsStore = useCommentsStore()
const appStore = useAppStore()

const isEditing = ref(false)
const editBody = ref(props.comment.body)
const isSubmitting = ref(false)

const isOwnComment = computed(() => {
  return authStore.user?.id === props.comment.user_id
})

// Sanitize comment body for safe display
const safeCommentBody = computed(() => {
  return sanitizeText(props.comment.body)
})

const reactionCounts = computed(() => {
  return commentsStore.getReactionCounts(props.comment.id)
})

const commonEmojis = ['👍', '❤️', '😂', '🎉', '🤔', '👏']

const goToProfile = () => {
  if (props.comment.user?.username) {
    router.push(`/profile/${props.comment.user.username}`)
  }
}

const startEdit = () => {
  isEditing.value = true
  editBody.value = props.comment.body
}

const cancelEdit = () => {
  isEditing.value = false
  editBody.value = props.comment.body
}

const saveEdit = async () => {
  if (!editBody.value.trim() || isSubmitting.value) return

  isSubmitting.value = true

  try {
    // Sanitize the input before saving
    const sanitized = sanitizeText(editBody.value.trim())
    await commentsStore.updateComment(props.comment.id, sanitized)
    isEditing.value = false
    appStore.showToast('Comment updated', 'success')
  } catch (error) {
    appStore.showToast('Failed to update comment', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async () => {
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    await commentsStore.deleteComment(props.comment.id)
    emit('delete')
    appStore.showToast('Comment deleted', 'success')
  } catch (error) {
    appStore.showToast('Failed to delete comment', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleReaction = async (emoji: string) => {
  if (!authStore.user) {
    appStore.showToast('Please sign in to react', 'info')
    return
  }

  try {
    await commentsStore.toggleReaction(props.comment.id, authStore.user.id, emoji)
  } catch (error) {
    appStore.showToast('Failed to add reaction', 'error')
  }
}

const hasReacted = (emoji: string) => {
  if (!authStore.user) return false
  return commentsStore.hasUserReacted(props.comment.id, authStore.user.id, emoji)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="p-16 bg-surface-elevated rounded-lg">
    <div class="flex items-start gap-12">
      <!-- Avatar -->
      <button
        @click="goToProfile"
        class="w-40 h-40 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0 hover:opacity-75 transition"
      >
        <img
          v-if="comment.user?.avatar_url"
          :src="comment.user.avatar_url"
          :alt="comment.user.display_name || comment.user.username"
          class="w-full h-full object-cover"
        />
        <span v-else class="text-sm font-bold text-primary">
          {{ (comment.user?.display_name || comment.user?.username || '?').charAt(0).toUpperCase() }}
        </span>
      </button>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <!-- Header -->
        <div class="flex items-start justify-between gap-12 mb-8">
          <div class="min-w-0">
            <button
              @click="goToProfile"
              class="font-medium text-text hover:text-primary transition truncate"
            >
              {{ comment.user?.display_name || comment.user?.username || 'Unknown' }}
            </button>
            <span class="text-sm text-text-muted ml-8">
              {{ formatDate(comment.created_at) }}
              <span v-if="comment.edited" class="ml-4">(edited)</span>
            </span>
          </div>

          <!-- Actions -->
          <div v-if="isOwnComment && !isEditing" class="flex gap-4 flex-shrink-0">
            <button
              @click="startEdit"
              class="p-4 text-text-muted hover:text-primary transition"
              aria-label="Edit"
            >
              <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="handleDelete"
              class="p-4 text-text-muted hover:text-error transition"
              aria-label="Delete"
              :disabled="isSubmitting"
            >
              <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Body (edit mode) -->
        <div v-if="isEditing" class="mb-12">
          <textarea
            v-model="editBody"
            class="w-full px-12 py-8 bg-surface border-2 border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:border-primary transition resize-none"
            rows="3"
            maxlength="500"
            placeholder="Edit your comment..."
          />
          <div class="flex justify-end gap-8 mt-8">
            <BaseButton
              variant="outline"
              size="sm"
              @click="cancelEdit"
              :disabled="isSubmitting"
            >
              Cancel
            </BaseButton>
            <BaseButton
              variant="primary"
              size="sm"
              @click="saveEdit"
              :loading="isSubmitting"
              :disabled="!editBody.trim()"
            >
              Save
            </BaseButton>
          </div>
        </div>

        <!-- Body (view mode) -->
        <p v-else class="text-text whitespace-pre-wrap break-words mb-12">
          {{ safeCommentBody }}
        </p>

        <!-- Reactions -->
        <div class="flex items-center gap-8 flex-wrap">
          <!-- Existing reactions -->
          <button
            v-for="(count, emoji) in reactionCounts"
            :key="emoji"
            @click="handleReaction(String(emoji))"
            class="px-8 py-4 rounded-full text-sm transition flex items-center gap-4"
            :class="hasReacted(String(emoji))
              ? 'bg-primary/20 text-primary'
              : 'bg-surface hover:bg-surface-overlay text-text'"
          >
            <span>{{ emoji }}</span>
            <span class="text-xs font-medium">{{ count }}</span>
          </button>

          <!-- Add reaction dropdown -->
          <div v-if="authStore.isAuthenticated" class="relative group">
            <button
              class="p-6 text-text-muted hover:text-primary hover:bg-surface-overlay rounded-full transition"
              aria-label="Add reaction"
            >
              <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            <!-- Reaction picker -->
            <div class="absolute bottom-full left-0 mb-4 p-8 bg-surface-elevated border-2 border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <div class="flex gap-4">
                <button
                  v-for="emoji in commonEmojis"
                  :key="emoji"
                  @click="handleReaction(emoji)"
                  class="text-xl hover:scale-125 transition-transform"
                  :class="hasReacted(emoji) ? 'opacity-50' : ''"
                >
                  {{ emoji }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
