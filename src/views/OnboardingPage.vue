<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClerkAuthStore } from '@/stores/clerkAuth'
import { useAppStore } from '@/stores/app'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { validateUsername } from '@/utils/validation'
import { uploadImage, supabase } from '@/lib/supabase'

const router = useRouter()
const authStore = useClerkAuthStore()
const appStore = useAppStore()

// Form state
const displayName = ref('')
const username = ref('')
const bio = ref('')
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)

// UI state
const currentStep = ref(1)
const isLoading = ref(false)
const isCheckingUsername = ref(false)

// Validation
const usernameError = ref<string | null>(null)
const usernameAvailable = ref<boolean | null>(null)

// Load user profile and pre-fill form
onMounted(async () => {
  await authStore.initialize()

  const user = authStore.user
  if (!user) return

  if (user.username) username.value = user.username
  if (user.display_name) displayName.value = user.display_name
  if (user.bio) bio.value = user.bio
  if (user.avatar_url) avatarPreview.value = user.avatar_url
})

// Form validation
const isStep1Valid = computed(() => {
  return displayName.value.trim().length > 0
})

const isStep2Valid = computed(() => {
  return username.value && !usernameError.value && usernameAvailable.value
})

// Handle avatar upload
const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    appStore.showToast('Please select an image file', 'error')
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    appStore.showToast('Image must be less than 5MB', 'error')
    return
  }

  avatarFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// Debounce timer for username check
let usernameCheckTimer: ReturnType<typeof setTimeout> | null = null

// Check username availability with 400ms debounce
const checkUsernameAvailability = () => {
  if (usernameCheckTimer) clearTimeout(usernameCheckTimer)

  const value = username.value
  usernameError.value = validateUsername(value)

  if (!value || usernameError.value) {
    usernameAvailable.value = false
    isCheckingUsername.value = false
    return
  }

  isCheckingUsername.value = true
  usernameAvailable.value = null

  usernameCheckTimer = setTimeout(async () => {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('username', value)
      .maybeSingle()

    usernameAvailable.value = !data
    isCheckingUsername.value = false
  }, 400)
}

// Handle username blur (also triggers the check immediately)
const handleUsernameBlur = () => {
  if (username.value) checkUsernameAvailability()
}

// Navigate steps
const nextStep = () => {
  if (currentStep.value === 1 && !isStep1Valid.value) return
  if (currentStep.value === 2 && !isStep2Valid.value) return

  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Complete onboarding
const completeOnboarding = async () => {
  const user = authStore.user
  if (!user) return

  isLoading.value = true

  try {
    let avatarUrl = user.avatar_url

    // Upload avatar if changed
    if (avatarFile.value) {
      const { url, error } = await uploadImage(
        avatarFile.value,
        'avatars',
        `${user.id}/avatar.jpg`
      )

      if (error) throw error
      avatarUrl = url
    }

    // Update profile in Supabase
    const { error } = await authStore.updateProfile({
      username: username.value,
      display_name: displayName.value || username.value,
      bio: bio.value || null,
      avatar_url: avatarUrl
    })

    if (error) throw error

    appStore.showToast('Profile completed!', 'success')
    router.push('/')
  } catch (error) {
    appStore.showToast((error as Error).message || 'Failed to update profile', 'error')
  } finally {
    isLoading.value = false
  }
}

// Skip onboarding
const skipOnboarding = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-16">
    <div class="w-full max-w-lg">
      <!-- Header -->
      <div class="text-center mb-32">
        <h1 class="text-3xl font-bold text-primary mb-8">Welcome to MuralMap! 🎨</h1>
        <p class="text-text-muted">Let's set up your profile</p>
      </div>

      <!-- Progress Indicator -->
      <div class="flex items-center justify-center gap-8 mb-32">
        <div
          v-for="step in 3"
          :key="step"
          :class="[
            'w-32 h-8 rounded-full transition-all',
            step === currentStep ? 'bg-primary' : step < currentStep ? 'bg-success' : 'bg-border'
          ]"
        ></div>
      </div>

      <!-- Step 1: Display Name -->
      <div v-if="currentStep === 1" class="space-y-24">
        <div>
          <h2 class="text-2xl font-bold text-text mb-8">What should we call you?</h2>
          <p class="text-text-muted">This is how other users will see your name</p>
        </div>

        <BaseInput
          v-model="displayName"
          type="text"
          label="Display Name"
          placeholder="Your Name"
          required
          maxlength="50"
        />

        <div class="flex gap-12">
          <BaseButton
            variant="ghost"
            size="lg"
            full-width
            @click="skipOnboarding"
          >
            Skip for now
          </BaseButton>
          <BaseButton
            variant="primary"
            size="lg"
            full-width
            :disabled="!isStep1Valid"
            @click="nextStep"
          >
            Continue
          </BaseButton>
        </div>
      </div>

      <!-- Step 2: Username -->
      <div v-if="currentStep === 2" class="space-y-24">
        <div>
          <h2 class="text-2xl font-bold text-text mb-8">Choose a username</h2>
          <p class="text-text-muted">Your unique identifier on MuralMap</p>
        </div>

        <div>
          <BaseInput
            v-model="username"
            type="text"
            label="Username"
            placeholder="streetartlover"
            required
            :maxlength="20"
            :error="usernameError"
            @input="checkUsernameAvailability"
            @blur="handleUsernameBlur"
          />

          <div v-if="isCheckingUsername" class="mt-8 text-sm text-text-muted flex items-center gap-8">
            <svg class="animate-spin h-14 w-14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Checking availability...
          </div>

          <div v-if="usernameAvailable && username && !usernameError" class="mt-8 text-sm text-success flex items-center gap-8">
            ✓ Username available
          </div>
        </div>

        <div class="flex gap-12">
          <BaseButton
            variant="outline"
            size="lg"
            @click="previousStep"
          >
            Back
          </BaseButton>
          <BaseButton
            variant="primary"
            size="lg"
            full-width
            :disabled="!isStep2Valid"
            @click="nextStep"
          >
            Continue
          </BaseButton>
        </div>
      </div>

      <!-- Step 3: Avatar & Bio -->
      <div v-if="currentStep === 3" class="space-y-24">
        <div>
          <h2 class="text-2xl font-bold text-text mb-8">Personalize your profile</h2>
          <p class="text-text-muted">Add a photo and tell us about yourself (optional)</p>
        </div>

        <!-- Avatar Upload -->
        <div>
          <label class="block mb-8 font-medium text-text">Profile Photo</label>
          <div class="flex items-center gap-16">
            <div class="relative">
              <div class="w-80 h-80 rounded-full bg-surface-elevated overflow-hidden border-2 border-border">
                <img
                  v-if="avatarPreview"
                  :src="avatarPreview"
                  alt="Avatar preview"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-4xl text-text-muted">
                  {{ displayName?.charAt(0).toUpperCase() || '?' }}
                </div>
              </div>
            </div>

            <div class="flex-1">
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                class="hidden"
                @change="handleAvatarChange"
              />
              <label for="avatar-upload">
                <BaseButton
                  variant="outline"
                  size="md"
                  as="span"
                  class="cursor-pointer"
                >
                  Choose Photo
                </BaseButton>
              </label>
              <p class="text-sm text-text-muted mt-8">JPG, PNG or GIF. Max 5MB</p>
            </div>
          </div>
        </div>

        <!-- Bio -->
        <div>
          <label class="block mb-8 font-medium text-text">Bio (optional)</label>
          <textarea
            v-model="bio"
            placeholder="Tell the community about yourself and your love for street art..."
            maxlength="160"
            rows="4"
            class="w-full px-16 py-12 rounded-lg border-2 border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
          ></textarea>
          <p class="mt-8 text-sm text-text-muted text-right">
            {{ bio.length }} / 160
          </p>
        </div>

        <div class="flex gap-12">
          <BaseButton
            variant="outline"
            size="lg"
            @click="previousStep"
          >
            Back
          </BaseButton>
          <BaseButton
            variant="primary"
            size="lg"
            full-width
            :loading="isLoading"
            @click="completeOnboarding"
          >
            Complete Profile
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
