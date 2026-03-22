<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCollectionsStore } from '@/stores/collections'
import { useAppStore } from '@/stores/app'
import PostCard from '@/components/feed/PostCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import type { Post } from '@/types'

const props = defineProps<{ id: string }>()

const router = useRouter()
const authStore = useAuthStore()
const collectionsStore = useCollectionsStore()
const appStore = useAppStore()

const loading = ref(true)
const isEditing = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const editName = ref('')
const editDescription = ref('')
const isSaving = ref(false)

// Drag and drop state
const draggedIndex = ref<number | null>(null)
const dropTargetIndex = ref<number | null>(null)

const collection = computed(() => collectionsStore.currentCollection)

const isOwner = computed(() => {
  return authStore.user?.id === collection.value?.user_id
})

onMounted(async () => {
  await loadCollection()
})

const loadCollection = async () => {
  loading.value = true

  try {
    const data = await collectionsStore.getCollection(props.id, authStore.user?.id)

    if (!data) {
      appStore.showToast('Collection not found', 'error')
      router.push('/collections')
      return
    }
  } catch (error) {
    appStore.showToast('Failed to load collection', 'error')
    router.push('/collections')
  } finally {
    loading.value = false
  }
}

const openEditModal = () => {
  if (!collection.value) return
  editName.value = collection.value.name
  editDescription.value = collection.value.description || ''
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editName.value = ''
  editDescription.value = ''
}

const handleSaveEdit = async () => {
  if (!collection.value || !editName.value.trim() || isSaving.value) return

  isSaving.value = true

  try {
    await collectionsStore.updateCollection(collection.value.id, {
      name: editName.value.trim(),
      description: editDescription.value.trim() || null
    })

    appStore.showToast('Collection updated', 'success')
    closeEditModal()
  } catch (error) {
    appStore.showToast('Failed to update collection', 'error')
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}

const handleDelete = async () => {
  if (!collection.value) return

  try {
    await collectionsStore.deleteCollection(collection.value.id)
    appStore.showToast('Collection deleted', 'success')
    router.push('/collections')
  } catch (error) {
    appStore.showToast('Failed to delete collection', 'error')
  }
}

const handleRemovePost = async (postId: string) => {
  if (!collection.value) return

  try {
    await collectionsStore.removePostFromCollection(collection.value.id, postId)
    appStore.showToast('Mural removed from collection', 'success')
  } catch (error) {
    appStore.showToast('Failed to remove mural', 'error')
  }
}

// Drag and drop handlers
const handleDragStart = (index: number) => {
  if (!isOwner.value) return
  draggedIndex.value = index
  isEditing.value = true
}

const handleDragOver = (e: DragEvent, index: number) => {
  if (!isOwner.value || draggedIndex.value === null) return
  e.preventDefault()
  dropTargetIndex.value = index
}

const handleDragLeave = () => {
  dropTargetIndex.value = null
}

const handleDrop = async (e: DragEvent, targetIndex: number) => {
  e.preventDefault()

  if (!isOwner.value || draggedIndex.value === null || !collection.value?.posts) return

  const posts = [...collection.value.posts]
  const [draggedPost] = posts.splice(draggedIndex.value, 1)
  posts.splice(targetIndex, 0, draggedPost)

  // Update order
  const postIds = posts.map(p => p.id)

  try {
    await collectionsStore.reorderPosts(collection.value.id, postIds)
    appStore.showToast('Order updated', 'success')
  } catch (error) {
    appStore.showToast('Failed to reorder murals', 'error')
  } finally {
    draggedIndex.value = null
    dropTargetIndex.value = null
    setTimeout(() => {
      isEditing.value = false
    }, 100)
  }
}

const handleDragEnd = () => {
  draggedIndex.value = null
  dropTargetIndex.value = null
  setTimeout(() => {
    isEditing.value = false
  }, 100)
}

const goBack = () => {
  router.push('/collections')
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

    <!-- Collection content -->
    <div v-else-if="collection" class="max-w-content mx-auto">
      <!-- Header -->
      <header class="sticky top-0 z-10 bg-surface-elevated border-b border-border px-16 py-16">
        <div class="flex items-center justify-between">
          <button
            @click="goBack"
            class="flex items-center gap-8 text-text hover:text-primary transition"
          >
            <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span class="font-medium">Back</span>
          </button>

          <div v-if="isOwner" class="flex gap-8">
            <BaseButton
              variant="outline"
              size="sm"
              @click="openEditModal"
            >
              Edit
            </BaseButton>
            <BaseButton
              variant="outline"
              size="sm"
              @click="confirmDelete"
            >
              Delete
            </BaseButton>
          </div>
        </div>
      </header>

      <!-- Collection info -->
      <div class="p-24">
        <h1 class="text-3xl font-bold text-text mb-8">{{ collection.name }}</h1>
        <p v-if="collection.description" class="text-text-muted mb-16">
          {{ collection.description }}
        </p>
        <div class="flex items-center gap-16 text-sm text-text-muted">
          <span>{{ collection.posts_count || 0 }} {{ collection.posts_count === 1 ? 'mural' : 'murals' }}</span>
          <span v-if="collection.user">by {{ collection.user.display_name || collection.user.username }}</span>
        </div>

        <!-- Drag hint -->
        <div v-if="isOwner && collection.posts && collection.posts.length > 1" class="mt-16 p-12 bg-primary/10 rounded-lg">
          <p class="text-sm text-primary font-medium">
            💡 Drag murals to reorder them in this collection
          </p>
        </div>
      </div>

      <!-- Posts grid -->
      <main class="px-24 pb-24">
        <div v-if="!collection.posts || collection.posts.length === 0" class="text-center py-48">
          <svg class="w-64 h-64 text-text-muted mx-auto mb-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="text-lg font-bold text-text mb-8">No murals yet</h3>
          <p class="text-text-muted">
            {{ isOwner ? 'Add murals to this collection from the mural detail pages' : 'This collection is empty' }}
          </p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
          <div
            v-for="(post, index) in collection.posts"
            :key="post.id"
            :draggable="isOwner"
            @dragstart="handleDragStart(index)"
            @dragover="(e) => handleDragOver(e, index)"
            @dragleave="handleDragLeave"
            @drop="(e) => handleDrop(e, index)"
            @dragend="handleDragEnd"
            class="relative"
            :class="{
              'opacity-50': draggedIndex === index,
              'ring-2 ring-primary': dropTargetIndex === index,
              'cursor-move': isOwner && !isEditing,
              'cursor-grabbing': isOwner && isEditing
            }"
          >
            <PostCard :post="post" />

            <!-- Remove button (owner only) -->
            <button
              v-if="isOwner"
              @click="handleRemovePost(post.id)"
              class="absolute top-8 right-8 p-8 bg-error text-white rounded-lg hover:bg-error/90 transition shadow-lg z-10"
              aria-label="Remove from collection"
            >
              <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Edit collection modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-16"
      @click="closeEditModal"
    >
      <div
        class="bg-surface rounded-lg p-24 max-w-md w-full"
        @click.stop
      >
        <h2 class="text-2xl font-bold text-text mb-16">Edit Collection</h2>

        <div class="space-y-16">
          <BaseInput
            v-model="editName"
            label="Collection Name"
            required
            maxlength="100"
          />

          <div>
            <label class="block text-sm font-medium text-text mb-8">
              Description (optional)
            </label>
            <textarea
              v-model="editDescription"
              class="w-full px-12 py-8 bg-surface-elevated border-2 border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:border-primary transition resize-none"
              rows="3"
              maxlength="500"
              placeholder="Describe your collection..."
            />
          </div>
        </div>

        <div class="flex gap-12 mt-24">
          <BaseButton
            variant="outline"
            size="md"
            full-width
            @click="closeEditModal"
            :disabled="isSaving"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="primary"
            size="md"
            full-width
            @click="handleSaveEdit"
            :loading="isSaving"
            :disabled="!editName.trim()"
          >
            Save
          </BaseButton>
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
        <h3 class="text-xl font-bold text-text mb-12">Delete Collection?</h3>
        <p class="text-text-muted mb-24">
          This action cannot be undone. The collection will be permanently deleted, but the murals will remain.
        </p>

        <div class="flex gap-12">
          <BaseButton
            variant="outline"
            size="md"
            full-width
            @click="cancelDelete"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="danger"
            size="md"
            full-width
            @click="handleDelete"
          >
            Delete
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
