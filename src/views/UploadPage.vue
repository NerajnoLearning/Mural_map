<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import BaseButton from '@/components/ui/BaseButton.vue'
import PhotoUpload from '@/components/upload/PhotoUpload.vue'
import MuralDetailsForm from '@/components/upload/MuralDetailsForm.vue'
import type { CompressedImage, ImageMetadata } from '@/utils/imageProcessing'
import { uploadImage } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// State
const currentStep = ref<'upload' | 'details' | 'preview'>('upload')
const uploadedImage = ref<CompressedImage | null>(null)
const imageMetadata = ref<ImageMetadata | null>(null)
const muralDetails = ref<any>(null)
const isSubmitting = ref(false)

// Computed
const canProceedToDetails = computed(() => !!uploadedImage.value)
const canSubmit = computed(() => {
  return uploadedImage.value && muralDetails.value?.title?.trim()
})

// Methods
const handlePhotoUpload = (data: { image: CompressedImage; metadata: ImageMetadata }) => {
  uploadedImage.value = data.image
  imageMetadata.value = data.metadata
}

const handlePhotoRemove = () => {
  uploadedImage.value = null
  imageMetadata.value = null
  currentStep.value = 'upload'
}

const handleDetailsUpdate = (details: any) => {
  muralDetails.value = details
}

const proceedToDetails = () => {
  if (!canProceedToDetails.value) return
  currentStep.value = 'details'
}

const backToUpload = () => {
  currentStep.value = 'upload'
}

const proceedToPreview = () => {
  if (!canSubmit.value) return
  currentStep.value = 'preview'
}

const backToDetails = () => {
  currentStep.value = 'details'
}

const submitPost = async () => {
  if (!canSubmit.value || !authStore.user || !uploadedImage.value) return

  isSubmitting.value = true

  try {
    // 1. Upload image to Supabase Storage
    const fileName = `${Date.now()}-${uploadedImage.value.file.name}`
    const { url: imageUrl, error: uploadError } = await uploadImage(
      uploadedImage.value.file,
      'murals',
      `${authStore.user.id}/${fileName}`
    )

    if (uploadError || !imageUrl) {
      throw new Error('Failed to upload image')
    }

    // 2. Create post in database
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: authStore.user.id,
        image_url: imageUrl,
        title: muralDetails.value.title,
        description: muralDetails.value.description || null,
        artist: muralDetails.value.artist || null,
        lat: muralDetails.value.location.lat,
        lng: muralDetails.value.location.lng,
        city: muralDetails.value.location.city,
        visibility: muralDetails.value.visibility
      })
      .select()
      .single()

    if (postError) throw postError

    // 3. Add tags if any
    if (muralDetails.value.tags.length > 0) {
      // First, insert tags (on conflict do nothing)
      const tagObjects = muralDetails.value.tags.map((label: string) => ({ label }))

      const { data: insertedTags, error: tagsError } = await supabase
        .from('tags')
        .upsert(tagObjects, { onConflict: 'label', ignoreDuplicates: true })
        .select()

      if (tagsError) console.error('Error inserting tags:', tagsError)

      // Get all tag IDs (including existing ones)
      const { data: allTags } = await supabase
        .from('tags')
        .select('id, label')
        .in('label', muralDetails.value.tags)

      if (allTags) {
        const postTags = allTags.map(tag => ({
          post_id: post.id,
          tag_id: tag.id
        }))

        const { error: postTagsError } = await supabase
          .from('post_tags')
          .insert(postTags)

        if (postTagsError) console.error('Error linking tags:', postTagsError)
      }
    }

    appStore.showToast('Mural posted successfully!', 'success')
    router.push(`/post/${post.id}`)
  } catch (error) {
    console.error('Error creating post:', error)
    appStore.showToast((error as Error).message || 'Failed to create post', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const cancel = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <!-- Header -->
    <header class="bg-surface-elevated border-b border-border sticky top-0 z-10">
      <div class="max-w-content mx-auto px-16 py-16">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-16">
            <button
              @click="cancel"
              class="p-8 hover:bg-surface-overlay rounded-lg transition"
              aria-label="Cancel"
            >
              <svg class="w-20 h-20 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h1 class="text-xl font-bold text-text">Upload Mural</h1>
          </div>

          <div class="flex items-center gap-12">
            <BaseButton
              v-if="currentStep === 'upload' && canProceedToDetails"
              variant="primary"
              size="md"
              @click="proceedToDetails"
            >
              Continue
            </BaseButton>

            <BaseButton
              v-if="currentStep === 'details'"
              variant="outline"
              size="md"
              @click="backToUpload"
            >
              Back
            </BaseButton>

            <BaseButton
              v-if="currentStep === 'details' && canSubmit"
              variant="primary"
              size="md"
              @click="proceedToPreview"
            >
              Preview
            </BaseButton>

            <BaseButton
              v-if="currentStep === 'preview'"
              variant="outline"
              size="md"
              @click="backToDetails"
            >
              Back
            </BaseButton>

            <BaseButton
              v-if="currentStep === 'preview' && canSubmit"
              variant="primary"
              size="md"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              @click="submitPost"
            >
              Post Mural
            </BaseButton>
          </div>
        </div>
      </div>
    </header>

    <!-- Progress Indicator -->
    <div class="bg-surface-elevated border-b border-border">
      <div class="max-w-content mx-auto px-16 py-12">
        <div class="flex items-center justify-center gap-8">
          <div :class="['flex items-center gap-8', currentStep === 'upload' ? 'text-primary' : 'text-success']">
            <div :class="['w-24 h-24 rounded-full flex items-center justify-center font-bold text-sm', currentStep === 'upload' ? 'bg-primary text-white' : 'bg-success text-white']">
              1
            </div>
            <span class="text-sm font-medium">Upload Photo</span>
          </div>

          <div class="w-32 h-1 bg-border"></div>

          <div :class="['flex items-center gap-8', currentStep === 'details' ? 'text-primary' : currentStep === 'preview' ? 'text-success' : 'text-text-muted']">
            <div :class="['w-24 h-24 rounded-full flex items-center justify-center font-bold text-sm', currentStep === 'details' ? 'bg-primary text-white' : currentStep === 'preview' ? 'bg-success text-white' : 'bg-border text-text-muted']">
              2
            </div>
            <span class="text-sm font-medium">Add Details</span>
          </div>

          <div class="w-32 h-1 bg-border"></div>

          <div :class="['flex items-center gap-8', currentStep === 'preview' ? 'text-primary' : 'text-text-muted']">
            <div :class="['w-24 h-24 rounded-full flex items-center justify-center font-bold text-sm', currentStep === 'preview' ? 'bg-primary text-white' : 'bg-border text-text-muted']">
              3
            </div>
            <span class="text-sm font-medium">Preview & Post</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <main class="max-w-2xl mx-auto px-16 py-32">
      <!-- Step 1: Upload Photo -->
      <div v-if="currentStep === 'upload'">
        <PhotoUpload
          @upload="handlePhotoUpload"
          @remove="handlePhotoRemove"
        />
      </div>

      <!-- Step 2: Mural Details -->
      <div v-if="currentStep === 'details'">
        <MuralDetailsForm
          :metadata="imageMetadata"
          @update="handleDetailsUpdate"
        />
      </div>

      <!-- Step 3: Preview -->
      <div v-if="currentStep === 'preview'" class="space-y-24">
        <div>
          <h3 class="text-xl font-bold text-text mb-8">Preview Your Post</h3>
          <p class="text-text-muted">Review before posting</p>
        </div>

        <!-- Image Preview -->
        <div class="rounded-lg overflow-hidden">
          <img
            :src="uploadedImage!.dataUrl"
            :alt="muralDetails?.title"
            class="w-full h-auto"
          />
        </div>

        <!-- Details -->
        <div class="space-y-16">
          <div>
            <h4 class="text-2xl font-bold text-text">{{ muralDetails?.title }}</h4>
            <p v-if="muralDetails?.artist" class="text-text-muted mt-4">
              by {{ muralDetails.artist }}
            </p>
          </div>

          <p v-if="muralDetails?.description" class="text-text">
            {{ muralDetails.description }}
          </p>

          <div v-if="muralDetails?.tags?.length" class="flex flex-wrap gap-8">
            <span
              v-for="tag in muralDetails.tags"
              :key="tag"
              class="px-12 py-6 bg-primary/10 text-primary rounded-lg text-sm font-medium"
            >
              {{ tag }}
            </span>
          </div>

          <div v-if="muralDetails?.location?.city" class="flex items-center gap-8 text-text-muted">
            <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
            <span>{{ muralDetails.location.city }}</span>
          </div>

          <div class="flex items-center gap-8 text-text-muted">
            <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
            <span>{{ muralDetails?.visibility === 'public' ? 'Public' : 'Friends Only' }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
