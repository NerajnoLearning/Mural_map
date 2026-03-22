<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCollectionsStore } from '@/stores/collections'
import { useAppStore } from '@/stores/app'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const props = defineProps<{
  postId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'added'): void
}>()

const authStore = useAuthStore()
const collectionsStore = useCollectionsStore()
const appStore = useAppStore()

const loading = ref(true)
const selectedCollectionId = ref<string | null>(null)
const isAdding = ref(false)
const showCreateNew = ref(false)
const newCollectionName = ref('')
const newCollectionDescription = ref('')
const isCreating = ref(false)

const collections = computed(() => collectionsStore.collections)

onMounted(async () => {
  if (!authStore.user) return

  loading.value = true
  try {
    await collectionsStore.fetchCollections(authStore.user.id)

    // Check which collections already contain this post
    for (const collection of collections.value) {
      const isIn = await collectionsStore.isPostInCollection(collection.id, props.postId)
      if (isIn) {
        // Mark as already added (we'll show a checkmark)
        collection.contains_post = true
      }
    }
  } catch (error) {
    console.error('Error loading collections:', error)
  } finally {
    loading.value = false
  }
})

const handleSelectCollection = (collectionId: string) => {
  selectedCollectionId.value = collectionId
}

const handleAddToCollection = async () => {
  if (!selectedCollectionId.value || isAdding.value) return

  isAdding.value = true

  try {
    await collectionsStore.addPostToCollection(selectedCollectionId.value, props.postId)
    appStore.showToast('Added to collection', 'success')
    emit('added')
    emit('close')
  } catch (error: any) {
    // Handle duplicate error gracefully
    if (error?.message?.includes('duplicate') || error?.code === '23505') {
      appStore.showToast('Already in this collection', 'info')
    } else {
      appStore.showToast('Failed to add to collection', 'error')
    }
  } finally {
    isAdding.value = false
  }
}

const toggleCreateNew = () => {
  showCreateNew.value = !showCreateNew.value
  if (showCreateNew.value) {
    newCollectionName.value = ''
    newCollectionDescription.value = ''
  }
}

const handleCreateAndAdd = async () => {
  if (!authStore.user || !newCollectionName.value.trim() || isCreating.value) return

  isCreating.value = true

  try {
    const collection = await collectionsStore.createCollection(
      authStore.user.id,
      newCollectionName.value.trim(),
      newCollectionDescription.value.trim() || null
    )

    if (collection) {
      await collectionsStore.addPostToCollection(collection.id, props.postId)
      appStore.showToast('Collection created and mural added', 'success')
      emit('added')
      emit('close')
    }
  } catch (error) {
    appStore.showToast('Failed to create collection', 'error')
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-16"
    @click="$emit('close')"
  >
    <div
      class="bg-surface rounded-lg max-w-md w-full max-h-[80vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="p-24 border-b border-border flex items-center justify-between">
        <h2 class="text-2xl font-bold text-text">Add to Collection</h2>
        <button
          @click="$emit('close')"
          class="p-8 hover:bg-surface-overlay rounded-lg transition"
          aria-label="Close"
        >
          <svg class="w-20 h-20 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-24">
        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-32">
          <svg class="animate-spin h-32 w-32 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <!-- Collections list -->
        <div v-else-if="collections.length > 0 && !showCreateNew" class="space-y-8">
          <button
            v-for="collection in collections"
            :key="collection.id"
            @click="handleSelectCollection(collection.id)"
            class="w-full p-16 rounded-lg border-2 transition text-left flex items-center gap-12"
            :class="selectedCollectionId === collection.id
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'"
            :disabled="collection.contains_post"
          >
            <!-- Thumbnail -->
            <div class="w-48 h-48 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                v-if="collection.cover_image_url"
                :src="collection.cover_image_url"
                :alt="collection.name"
                class="w-full h-full object-cover"
              />
              <svg v-else class="w-24 h-24 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-text truncate">{{ collection.name }}</h3>
              <p class="text-sm text-text-muted">{{ collection.posts_count || 0 }} {{ collection.posts_count === 1 ? 'mural' : 'murals' }}</p>
            </div>

            <!-- Checkmark if already in collection -->
            <div v-if="collection.contains_post" class="flex-shrink-0">
              <svg class="w-24 h-24 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>

            <!-- Radio indicator -->
            <div v-else class="flex-shrink-0">
              <div
                class="w-20 h-20 rounded-full border-2 transition"
                :class="selectedCollectionId === collection.id
                  ? 'border-primary bg-primary'
                  : 'border-border'"
              >
                <div
                  v-if="selectedCollectionId === collection.id"
                  class="w-full h-full rounded-full bg-white scale-50"
                ></div>
              </div>
            </div>
          </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="collections.length === 0 && !showCreateNew" class="text-center py-32">
          <svg class="w-64 h-64 text-text-muted mx-auto mb-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 class="text-lg font-bold text-text mb-8">No collections yet</h3>
          <p class="text-text-muted mb-16">
            Create your first collection to organize murals
          </p>
        </div>

        <!-- Create new form -->
        <div v-if="showCreateNew" class="space-y-16">
          <BaseInput
            v-model="newCollectionName"
            label="Collection Name"
            placeholder="e.g., Street Art in NYC"
            required
            maxlength="100"
          />

          <div>
            <label class="block text-sm font-medium text-text mb-8">
              Description (optional)
            </label>
            <textarea
              v-model="newCollectionDescription"
              class="w-full px-12 py-8 bg-surface-elevated border-2 border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:border-primary transition resize-none"
              rows="3"
              maxlength="500"
              placeholder="Describe your collection..."
            />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-24 border-t border-border space-y-12">
        <!-- Create new button (when viewing list) -->
        <BaseButton
          v-if="!showCreateNew"
          variant="outline"
          size="md"
          full-width
          @click="toggleCreateNew"
        >
          <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create New Collection
        </BaseButton>

        <!-- Action buttons -->
        <div class="flex gap-12">
          <BaseButton
            v-if="showCreateNew"
            variant="outline"
            size="md"
            full-width
            @click="toggleCreateNew"
            :disabled="isCreating"
          >
            Back
          </BaseButton>

          <BaseButton
            v-if="showCreateNew"
            variant="primary"
            size="md"
            full-width
            @click="handleCreateAndAdd"
            :loading="isCreating"
            :disabled="!newCollectionName.trim()"
          >
            Create & Add
          </BaseButton>

          <BaseButton
            v-if="!showCreateNew"
            variant="primary"
            size="md"
            full-width
            @click="handleAddToCollection"
            :loading="isAdding"
            :disabled="!selectedCollectionId"
          >
            Add to Collection
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
