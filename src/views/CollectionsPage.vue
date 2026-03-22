<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCollectionsStore } from '@/stores/collections'
import { useAppStore } from '@/stores/app'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const router = useRouter()
const authStore = useAuthStore()
const collectionsStore = useCollectionsStore()
const appStore = useAppStore()

const showCreateModal = ref(false)
const newCollectionName = ref('')
const newCollectionDescription = ref('')
const isCreating = ref(false)

onMounted(async () => {
  if (!authStore.user) return
  await collectionsStore.fetchCollections(authStore.user.id)
})

const openCreateModal = () => {
  showCreateModal.value = true
  newCollectionName.value = ''
  newCollectionDescription.value = ''
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newCollectionName.value = ''
  newCollectionDescription.value = ''
}

const handleCreate = async () => {
  if (!authStore.user || !newCollectionName.value.trim() || isCreating.value) return

  isCreating.value = true

  try {
    const collection = await collectionsStore.createCollection(
      authStore.user.id,
      newCollectionName.value.trim(),
      newCollectionDescription.value.trim() || null
    )

    appStore.showToast('Collection created', 'success')
    closeCreateModal()

    // Navigate to new collection
    if (collection) {
      router.push(`/collections/${collection.id}`)
    }
  } catch (error) {
    appStore.showToast('Failed to create collection', 'error')
  } finally {
    isCreating.value = false
  }
}

const goToCollection = (id: string) => {
  router.push(`/collections/${id}`)
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <div class="max-w-content mx-auto">
      <!-- Header -->
      <header class="bg-surface-elevated border-b border-border px-16 py-24">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-text">My Collections</h1>
            <p class="text-text-muted mt-4">Organize and curate your favorite murals</p>
          </div>
          <BaseButton
            variant="primary"
            @click="openCreateModal"
          >
            <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Collection
          </BaseButton>
        </div>
      </header>

      <!-- Collections grid -->
      <main class="p-16 sm:p-24">
        <div v-if="collectionsStore.loading && collectionsStore.collections.length === 0" class="flex items-center justify-center py-48">
          <svg class="animate-spin h-48 w-48 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <div v-else-if="collectionsStore.collections.length === 0" class="text-center py-48">
          <svg class="w-64 h-64 text-text-muted mx-auto mb-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 class="text-lg font-bold text-text mb-8">No collections yet</h3>
          <p class="text-text-muted mb-16">
            Create your first collection to organize murals
          </p>
          <BaseButton
            variant="primary"
            @click="openCreateModal"
          >
            Create Collection
          </BaseButton>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
          <button
            v-for="collection in collectionsStore.collections"
            :key="collection.id"
            @click="goToCollection(collection.id)"
            class="group bg-surface-elevated rounded-lg overflow-hidden border-2 border-border hover:border-primary transition text-left"
          >
            <!-- Cover image -->
            <div class="aspect-video bg-primary/10 relative overflow-hidden">
              <img
                v-if="collection.cover_image_url"
                :src="collection.cover_image_url"
                :alt="collection.name"
                class="w-full h-full object-cover group-hover:scale-105 transition"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-48 h-48 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>

              <!-- Posts count badge -->
              <div class="absolute top-8 right-8 px-8 py-4 bg-surface/90 backdrop-blur-sm rounded-full text-xs font-medium text-text">
                {{ collection.posts_count || 0 }} {{ collection.posts_count === 1 ? 'mural' : 'murals' }}
              </div>
            </div>

            <!-- Info -->
            <div class="p-16">
              <h3 class="text-lg font-bold text-text mb-4 group-hover:text-primary transition">
                {{ collection.name }}
              </h3>
              <p v-if="collection.description" class="text-sm text-text-muted line-clamp-2">
                {{ collection.description }}
              </p>
            </div>
          </button>
        </div>
      </main>
    </div>

    <!-- Create collection modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-16"
      @click="closeCreateModal"
    >
      <div
        class="bg-surface rounded-lg p-24 max-w-md w-full"
        @click.stop
      >
        <h2 class="text-2xl font-bold text-text mb-16">Create Collection</h2>

        <div class="space-y-16">
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

        <div class="flex gap-12 mt-24">
          <BaseButton
            variant="outline"
            size="md"
            full-width
            @click="closeCreateModal"
            :disabled="isCreating"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="primary"
            size="md"
            full-width
            @click="handleCreate"
            :loading="isCreating"
            :disabled="!newCollectionName.trim()"
          >
            Create
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
