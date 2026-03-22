<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCommentsStore } from '@/stores/comments'
import { useAppStore } from '@/stores/app'
import CommentItem from './CommentItem.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps<{
  postId: string
}>()

const authStore = useAuthStore()
const commentsStore = useCommentsStore()
const appStore = useAppStore()

const newCommentBody = ref('')
const isSubmitting = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)
const observer = ref<IntersectionObserver | null>(null)

onMounted(async () => {
  await commentsStore.fetchComments(props.postId)

  // Set up infinite scroll
  if (loadMoreTrigger.value) {
    observer.value = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !commentsStore.loading && commentsStore.hasMore) {
          handleLoadMore()
        }
      })
    }, { rootMargin: '200px' })

    observer.value.observe(loadMoreTrigger.value)
  }
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})

const handleLoadMore = async () => {
  await commentsStore.fetchComments(props.postId, false)
}

const handleSubmit = async () => {
  if (!authStore.user || !newCommentBody.value.trim() || isSubmitting.value) return

  isSubmitting.value = true

  try {
    await commentsStore.createComment(
      props.postId,
      authStore.user.id,
      newCommentBody.value.trim()
    )
    newCommentBody.value = ''
    appStore.showToast('Comment posted', 'success')
  } catch (error) {
    appStore.showToast('Failed to post comment', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  // Submit on Cmd/Ctrl + Enter
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault()
    handleSubmit()
  }
}
</script>

<template>
  <div class="space-y-16">
    <!-- Comment form -->
    <div v-if="authStore.isAuthenticated" class="p-16 bg-surface-elevated rounded-lg">
      <textarea
        v-model="newCommentBody"
        @keydown="handleKeyDown"
        class="w-full px-12 py-8 bg-surface border-2 border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:border-primary transition resize-none"
        rows="3"
        maxlength="500"
        placeholder="Add a comment... (Cmd/Ctrl + Enter to post)"
      />
      <div class="flex justify-between items-center mt-12">
        <span class="text-sm text-text-muted">
          {{ newCommentBody.length }}/500
        </span>
        <BaseButton
          variant="primary"
          size="sm"
          @click="handleSubmit"
          :loading="isSubmitting"
          :disabled="!newCommentBody.trim()"
        >
          Post Comment
        </BaseButton>
      </div>
    </div>

    <!-- Sign in prompt -->
    <div v-else class="p-24 bg-surface-elevated rounded-lg text-center">
      <p class="text-text-muted mb-12">Sign in to leave a comment</p>
      <BaseButton
        variant="primary"
        @click="$router.push('/auth/signin')"
      >
        Sign In
      </BaseButton>
    </div>

    <!-- Comments list -->
    <div class="space-y-12">
      <CommentItem
        v-for="comment in commentsStore.comments"
        :key="comment.id"
        :comment="comment"
      />

      <!-- Loading -->
      <div v-if="commentsStore.loading" class="flex justify-center py-24">
        <svg class="animate-spin h-32 w-32 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Load more trigger -->
      <div ref="loadMoreTrigger" class="h-1"></div>

      <!-- Empty state -->
      <div v-if="!commentsStore.loading && commentsStore.comments.length === 0" class="text-center py-48">
        <svg class="w-64 h-64 text-text-muted mx-auto mb-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 class="text-lg font-bold text-text mb-8">No comments yet</h3>
        <p class="text-text-muted">
          Be the first to comment on this mural
        </p>
      </div>
    </div>
  </div>
</template>
