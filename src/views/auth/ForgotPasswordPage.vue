<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { validateEmail } from '@/utils/validation'

const authStore = useAuthStore()
const appStore = useAppStore()

// Form state
const email = ref('')
const isLoading = ref(false)
const emailSent = ref(false)

// Validation
const emailError = ref<string | null>(null)

const isFormValid = computed(() => {
  return email.value && !emailError.value
})

// Handle email blur
const handleEmailBlur = () => {
  if (email.value) {
    emailError.value = validateEmail(email.value)
  }
}

// Handle password reset
const handleResetPassword = async () => {
  emailError.value = validateEmail(email.value)

  if (emailError.value) return

  isLoading.value = true

  const { error } = await authStore.resetPassword(email.value)

  isLoading.value = false

  if (error) {
    appStore.showToast(error.message || 'Failed to send reset email', 'error')
    return
  }

  emailSent.value = true
  appStore.showToast('Password reset email sent! Check your inbox.', 'success')
}
</script>

<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-16">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-32">
        <router-link to="/" class="inline-block mb-16">
          <h1 class="text-3xl font-bold text-primary">MuralMap</h1>
        </router-link>
        <h2 class="text-2xl font-bold text-text mb-8">Reset your password</h2>
        <p class="text-text-muted">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <!-- Success Message -->
      <div v-if="emailSent" class="bg-success/10 border-2 border-success rounded-lg p-16 mb-24">
        <div class="flex items-start gap-12">
          <span class="text-2xl">✉️</span>
          <div>
            <h3 class="font-bold text-text mb-4">Check your email</h3>
            <p class="text-sm text-text-muted">
              We've sent a password reset link to <strong>{{ email }}</strong>.
              Click the link in the email to reset your password.
            </p>
          </div>
        </div>
      </div>

      <!-- Reset Form -->
      <form v-if="!emailSent" @submit.prevent="handleResetPassword" class="space-y-16">
        <BaseInput
          v-model="email"
          type="email"
          label="Email"
          placeholder="your@email.com"
          autocomplete="email"
          required
          :error="emailError"
          @blur="handleEmailBlur"
        />

        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          full-width
          :loading="isLoading"
          :disabled="!isFormValid || isLoading"
        >
          Send Reset Link
        </BaseButton>
      </form>

      <!-- Resend Option -->
      <div v-if="emailSent" class="space-y-16">
        <BaseButton
          variant="outline"
          size="lg"
          full-width
          :loading="isLoading"
          @click="handleResetPassword"
        >
          Resend Email
        </BaseButton>
      </div>

      <!-- Back to Sign In -->
      <div class="mt-24 text-center">
        <router-link
          to="/auth/signin"
          class="inline-flex items-center text-text-muted hover:text-primary transition"
        >
          <svg class="w-16 h-16 mr-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to sign in
        </router-link>
      </div>

      <!-- Help Text -->
      <div class="mt-32 p-16 bg-surface-elevated rounded-lg">
        <h3 class="font-medium text-text mb-8">Didn't receive the email?</h3>
        <ul class="text-sm text-text-muted space-y-4">
          <li>• Check your spam or junk folder</li>
          <li>• Make sure you entered the correct email address</li>
          <li>• Wait a few minutes and try resending</li>
        </ul>
      </div>
    </div>
  </div>
</template>
