<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import TagsInput from '@/components/ui/TagsInput.vue'
import type { ImageMetadata } from '@/utils/imageProcessing'
import { reverseGeocode } from '@/utils/imageProcessing'

interface Props {
  metadata: ImageMetadata | null
}

interface MuralDetails {
  title: string
  artist: string
  description: string
  tags: string[]
  visibility: 'public' | 'friends'
  location: {
    lat: number | null
    lng: number | null
    city: string | null
    address: string | null
    manuallySet: boolean
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update', details: MuralDetails): void
}>()

// Form state
const title = ref('')
const artist = ref('')
const description = ref('')
const tags = ref<string[]>([])
const visibility = ref<'public' | 'friends'>('public')
const city = ref<string | null>(null)
const address = ref<string | null>(null)
const isLoadingLocation = ref(false)

// Initialize location from metadata
watch(() => props.metadata, async (newMetadata) => {
  if (newMetadata?.latitude && newMetadata?.longitude) {
    isLoadingLocation.value = true

    try {
      const { city: geoCity, address: geoAddress } = await reverseGeocode(
        newMetadata.latitude,
        newMetadata.longitude
      )

      city.value = geoCity
      address.value = geoAddress
    } catch (error) {
      console.error('Error fetching location:', error)
    } finally {
      isLoadingLocation.value = false
    }
  }
}, { immediate: true })

// Computed
const details = computed<MuralDetails>(() => ({
  title: title.value,
  artist: artist.value,
  description: description.value,
  tags: tags.value,
  visibility: visibility.value,
  location: {
    lat: props.metadata?.latitude || null,
    lng: props.metadata?.longitude || null,
    city: city.value,
    address: address.value,
    manuallySet: false
  }
}))

const isFormValid = computed(() => {
  return title.value.trim().length > 0
})

// Watch details and emit updates
watch(details, (newDetails) => {
  emit('update', newDetails)
}, { deep: true })
</script>

<template>
  <div class="space-y-24">
    <div>
      <h3 class="text-xl font-bold text-text mb-8">Mural Details</h3>
      <p class="text-text-muted">Tell us about this street art</p>
    </div>

    <!-- Title (Required) -->
    <BaseInput
      v-model="title"
      type="text"
      label="Title"
      placeholder="e.g., Colorful Phoenix Mural"
      required
      maxlength="80"
    />

    <!-- Artist -->
    <BaseInput
      v-model="artist"
      type="text"
      label="Artist"
      placeholder="e.g., Banksy, Unknown, etc."
      maxlength="100"
    />

    <!-- Description -->
    <div>
      <label class="block mb-8 font-medium text-text">
        Description
      </label>
      <textarea
        v-model="description"
        placeholder="Describe the mural, its style, themes, or any interesting details..."
        maxlength="500"
        rows="4"
        class="w-full px-16 py-12 rounded-lg border-2 border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
      ></textarea>
      <p class="mt-8 text-sm text-text-muted text-right">
        {{ description.length }} / 500
      </p>
    </div>

    <!-- Tags -->
    <TagsInput
      v-model="tags"
      label="Tags"
      placeholder="Add tags (e.g., abstract, portrait, political)"
      :max-tags="5"
    />

    <!-- Location Info -->
    <div class="p-16 bg-surface-elevated rounded-lg">
      <h4 class="font-bold text-text mb-12 flex items-center gap-8">
        <svg class="w-18 h-18 text-primary" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
        </svg>
        Location
      </h4>

      <div v-if="isLoadingLocation" class="flex items-center gap-12 text-text-muted">
        <svg class="animate-spin h-16 w-16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Finding location...</span>
      </div>

      <div v-else-if="metadata?.latitude && metadata?.longitude" class="space-y-8">
        <div>
          <p class="text-sm text-text-muted">Coordinates</p>
          <p class="text-text font-mono text-sm">
            {{ metadata.latitude.toFixed(6) }}, {{ metadata.longitude.toFixed(6) }}
          </p>
        </div>

        <div v-if="city">
          <p class="text-sm text-text-muted">City</p>
          <p class="text-text">{{ city }}</p>
        </div>

        <div v-if="address">
          <p class="text-sm text-text-muted">Address</p>
          <p class="text-text text-sm">{{ address }}</p>
        </div>
      </div>

      <div v-else class="text-text-muted">
        <p class="text-sm">No GPS data available. You can set the location on the map manually.</p>
      </div>
    </div>

    <!-- Visibility -->
    <div class="p-16 bg-surface-elevated rounded-lg">
      <h4 class="font-bold text-text mb-12">Privacy</h4>

      <div class="space-y-12">
        <label class="flex items-start gap-12 cursor-pointer group">
          <input
            type="radio"
            v-model="visibility"
            value="public"
            class="mt-4 w-18 h-18 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
          <div class="flex-1">
            <p class="font-medium text-text group-hover:text-primary transition">Public</p>
            <p class="text-sm text-text-muted">Anyone can see this mural</p>
          </div>
        </label>

        <label class="flex items-start gap-12 cursor-pointer group">
          <input
            type="radio"
            v-model="visibility"
            value="friends"
            class="mt-4 w-18 h-18 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
          <div class="flex-1">
            <p class="font-medium text-text group-hover:text-primary transition">Friends Only</p>
            <p class="text-sm text-text-muted">Only your friends can see this mural</p>
          </div>
        </label>
      </div>
    </div>

    <!-- Validation Status -->
    <div v-if="!isFormValid" class="text-sm text-warning flex items-center gap-8">
      <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <span>Please add a title to continue</span>
    </div>
  </div>
</template>
