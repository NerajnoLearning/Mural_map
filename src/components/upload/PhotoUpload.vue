<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import BaseButton from '@/components/ui/BaseButton.vue'
import {
  validateImageFile,
  compressImage,
  extractImageMetadata,
  formatFileSize,
  type CompressedImage,
  type ImageMetadata
} from '@/utils/imageProcessing'

interface Props {
  maxSizeMB?: number
  allowMultiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxSizeMB: 10,
  allowMultiple: false
})

const emit = defineEmits<{
  (e: 'upload', data: { image: CompressedImage; metadata: ImageMetadata }): void
  (e: 'remove'): void
}>()

const appStore = useAppStore()

// State
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const compressedImage = ref<CompressedImage | null>(null)
const metadata = ref<ImageMetadata | null>(null)
const isProcessing = ref(false)
const isDragging = ref(false)

// Computed
const hasImage = computed(() => !!compressedImage.value)

const originalSize = computed(() => {
  return selectedFile.value ? formatFileSize(selectedFile.value.size) : null
})

const compressedSize = computed(() => {
  return compressedImage.value ? formatFileSize(compressedImage.value.file.size) : null
})

const compressionRatio = computed(() => {
  if (!selectedFile.value || !compressedImage.value) return null

  const ratio = (1 - compressedImage.value.file.size / selectedFile.value.size) * 100
  return Math.round(ratio)
})

const hasGPS = computed(() => {
  return metadata.value?.latitude !== null && metadata.value?.longitude !== null
})

// Methods
const openFilePicker = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  await processFile(file)
}

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false
  event.preventDefault()

  const file = event.dataTransfer?.files[0]
  if (!file) return

  await processFile(file)
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const processFile = async (file: File) => {
  // Validate file
  const validation = validateImageFile(file, { maxSizeMB: props.maxSizeMB })

  if (!validation.valid) {
    appStore.showToast(validation.error || 'Invalid file', 'error')
    return
  }

  isProcessing.value = true
  selectedFile.value = file

  try {
    // Extract metadata first (before compression)
    const [imageMetadata, compressed] = await Promise.all([
      extractImageMetadata(file),
      compressImage(file)
    ])

    compressedImage.value = compressed
    metadata.value = imageMetadata

    // Emit upload event
    emit('upload', {
      image: compressed,
      metadata: imageMetadata
    })

    appStore.showToast('Photo processed successfully!', 'success')
  } catch (error) {
    console.error('Error processing file:', error)
    appStore.showToast('Failed to process image', 'error')
    reset()
  } finally {
    isProcessing.value = false
  }
}

const reset = () => {
  selectedFile.value = null
  compressedImage.value = null
  metadata.value = null

  if (fileInput.value) {
    fileInput.value.value = ''
  }

  emit('remove')
}
</script>

<template>
  <div class="w-full">
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
      :multiple="allowMultiple"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Upload Area -->
    <div
      v-if="!hasImage"
      :class="[
        'relative border-2 border-dashed rounded-lg p-32 text-center transition-all cursor-pointer',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary hover:bg-surface-elevated'
      ]"
      @click="openFilePicker"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <div v-if="isProcessing" class="flex flex-col items-center gap-16">
        <svg class="animate-spin h-48 w-48 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-text-muted">Processing image...</p>
      </div>

      <div v-else class="flex flex-col items-center gap-16">
        <!-- Upload Icon -->
        <div class="w-64 h-64 bg-primary/10 rounded-full flex items-center justify-center">
          <svg class="w-32 h-32 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <!-- Text -->
        <div>
          <p class="text-lg font-medium text-text mb-4">
            Drop your photo here or click to browse
          </p>
          <p class="text-sm text-text-muted">
            JPG, PNG, or WebP • Max {{ maxSizeMB }}MB
          </p>
        </div>

        <!-- Button -->
        <BaseButton variant="primary" size="md">
          Choose Photo
        </BaseButton>
      </div>
    </div>

    <!-- Preview Area -->
    <div v-else class="space-y-16">
      <!-- Image Preview -->
      <div class="relative rounded-lg overflow-hidden bg-surface-elevated">
        <img
          :src="compressedImage!.dataUrl"
          alt="Uploaded mural"
          class="w-full h-auto"
        />

        <!-- Remove Button -->
        <button
          @click="reset"
          class="absolute top-16 right-16 p-8 bg-surface/90 backdrop-blur-sm rounded-full hover:bg-error transition-colors group"
          aria-label="Remove photo"
        >
          <svg class="w-20 h-20 text-text group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- GPS Indicator -->
        <div
          v-if="hasGPS"
          class="absolute bottom-16 left-16 px-12 py-6 bg-success/90 backdrop-blur-sm rounded-full text-white text-sm font-medium flex items-center gap-6"
        >
          <svg class="w-14 h-14" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
          GPS Location Found
        </div>
      </div>

      <!-- Image Info -->
      <div class="grid grid-cols-2 gap-12 p-16 bg-surface-elevated rounded-lg">
        <div>
          <p class="text-sm text-text-muted mb-4">Dimensions</p>
          <p class="font-medium text-text">
            {{ compressedImage!.width }} × {{ compressedImage!.height }}
          </p>
        </div>

        <div>
          <p class="text-sm text-text-muted mb-4">File Size</p>
          <p class="font-medium text-text">
            {{ compressedSize }}
            <span v-if="compressionRatio && compressionRatio > 0" class="text-success text-sm ml-4">
              ({{ compressionRatio }}% smaller)
            </span>
          </p>
        </div>

        <div v-if="metadata?.dateTaken">
          <p class="text-sm text-text-muted mb-4">Date Taken</p>
          <p class="font-medium text-text">
            {{ new Date(metadata.dateTaken).toLocaleDateString() }}
          </p>
        </div>

        <div v-if="metadata?.camera">
          <p class="text-sm text-text-muted mb-4">Camera</p>
          <p class="font-medium text-text">
            {{ metadata.camera }}
          </p>
        </div>
      </div>

      <!-- GPS Info -->
      <div v-if="hasGPS" class="p-16 bg-success/10 border-2 border-success rounded-lg">
        <div class="flex items-start gap-12">
          <svg class="w-20 h-20 text-success mt-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
          <div class="flex-1">
            <h4 class="font-bold text-text mb-4">GPS Location Detected</h4>
            <p class="text-sm text-text-muted">
              Lat: {{ metadata!.latitude?.toFixed(6) }}, Lng: {{ metadata!.longitude?.toFixed(6) }}
            </p>
            <p class="text-sm text-success mt-4">
              We'll use this to pin your mural on the map!
            </p>
          </div>
        </div>
      </div>

      <!-- No GPS Warning -->
      <div v-else class="p-16 bg-warning/10 border-2 border-warning rounded-lg">
        <div class="flex items-start gap-12">
          <svg class="w-20 h-20 text-warning mt-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div class="flex-1">
            <h4 class="font-bold text-text mb-4">No GPS Data Found</h4>
            <p class="text-sm text-text-muted">
              This photo doesn't contain location information. You'll need to manually place it on the map.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
