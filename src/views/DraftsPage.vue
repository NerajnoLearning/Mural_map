<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOfflineDrafts, type Draft } from '@/composables/useOfflineDrafts'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const { drafts, loading, getAllDrafts, deleteDraft } = useOfflineDrafts()
const appStore = useAppStore()

const showDeleteConfirm = ref(false)
const draftToDelete = ref<Draft | null>(null)

onMounted(async () => {
  await loadDrafts()
})

const loadDrafts = async () => {
  try {
    await getAllDrafts()
  } catch (error) {
    appStore.showToast('Failed to load drafts', 'error')
  }
}

const handleEditDraft = (draft: Draft) => {
  router.push(`/upload?draft=${draft.id}`)
}

const confirmDelete = (draft: Draft) => {
  draftToDelete.value = draft
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  draftToDelete.value = null
  showDeleteConfirm.value = false
}

const handleDelete = async () => {
  if (!draftToDelete.value) return

  try {
    await deleteDraft(draftToDelete.value.id)
    appStore.showToast('Draft deleted', 'success')
    showDeleteConfirm.value = false
    draftToDelete.value = null
  } catch (error) {
    appStore.showToast('Failed to delete draft', 'error')
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="sticky top-0 z-10 bg-surface-elevated border-b border-border px-16 py-16">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-text">Drafts</h1>

          <router-link
            to="/upload"
            class="px-16 py-8 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
          >
            New Upload
          </router-link>
        </div>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-48">
        <svg class="animate-spin h-32 w-32 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Empty state -->
      <div v-else-if="drafts.length === 0" class="text-center py-48 px-16">
        <div class="text-6xl mb-16">📝</div>
        <h3 class="text-lg font-bold text-text mb-8">No drafts yet</h3>
        <p class="text-text-muted mb-24">
          Start uploading murals and save them as drafts when you're offline
        </p>
        <router-link
          to="/upload"
          class="inline-flex px-24 py-12 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
        >
          Upload Mural
        </router-link>
      </div>

      <!-- Drafts list -->
      <div v-else class="p-16 space-y-16">
        <div
          v-for="draft in drafts"
          :key="draft.id"
          class="bg-surface-elevated rounded-lg overflow-hidden hover:shadow-lg transition"
        >
          <div class="flex gap-16">
            <!-- Image preview -->
            <div class="w-120 h-120 bg-surface flex-shrink-0 overflow-hidden">
              <img
                v-if="draft.image_data"
                :src="draft.image_data"
                :alt="draft.title || 'Draft'"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-text-muted">
                <svg class="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 p-16 min-w-0">
              <div class="flex items-start justify-between gap-16">
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold text-text mb-4 truncate">
                    {{ draft.title || 'Untitled Draft' }}
                  </h3>
                  <p v-if="draft.description" class="text-text-muted text-sm mb-8 line-clamp-2">
                    {{ draft.description }}
                  </p>
                  <div class="flex flex-wrap gap-8 mb-8">
                    <span
                      v-if="draft.artist"
                      class="text-xs px-8 py-4 bg-surface rounded text-text-muted"
                    >
                      by {{ draft.artist }}
                    </span>
                    <span
                      v-if="draft.city"
                      class="text-xs px-8 py-4 bg-surface rounded text-text-muted flex items-center gap-4"
                    >
                      <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                      </svg>
                      {{ draft.city }}
                    </span>
                  </div>
                  <p class="text-xs text-text-muted">
                    Last saved: {{ formatDate(draft.updated_at) }}
                  </p>
                </div>

                <!-- Actions -->
                <div class="flex gap-8 flex-shrink-0">
                  <button
                    @click="handleEditDraft(draft)"
                    class="px-12 py-8 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    @click="confirmDelete(draft)"
                    class="px-12 py-8 border-2 border-error text-error rounded-lg hover:bg-error hover:text-white transition text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-16"
      @click="cancelDelete"
    >
      <div
        class="bg-surface rounded-lg p-24 max-w-md w-full"
        @click.stop
      >
        <h3 class="text-xl font-bold text-text mb-12">Delete Draft?</h3>
        <p class="text-text-muted mb-24">
          This action cannot be undone. The draft will be permanently deleted.
        </p>

        <div class="flex gap-12">
          <button
            @click="cancelDelete"
            class="flex-1 px-16 py-12 border-2 border-border text-text rounded-lg hover:bg-surface-elevated transition font-medium"
          >
            Cancel
          </button>
          <button
            @click="handleDelete"
            class="flex-1 px-16 py-12 bg-error text-white rounded-lg hover:bg-error/90 transition font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
