<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import BaseDivider from '@/components/ui/BaseDivider.vue'
import OAuthButton from '@/components/auth/OAuthButton.vue'
import PasswordStrength from '@/components/auth/PasswordStrength.vue'
import { validateEmail, validatePassword, validateUsername } from '@/utils/validation'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// Form state
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeToTerms = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Loading states
const isLoading = ref(false)
const isGoogleLoading = ref(false)
const isAppleLoading = ref(false)

// Validation errors
const usernameError = ref<string | null>(null)
const emailError = ref<string | null>(null)
const passwordError = ref<string | null>(null)
const confirmPasswordError = ref<string | null>(null)

// Form validation
const isFormValid = computed(() => {
  return (
    username.value &&
    email.value &&
    password.value &&
    confirmPassword.value &&
    agreeToTerms.value &&
    !usernameError.value &&
    !emailError.value &&
    !passwordError.value &&
    !confirmPasswordError.value
  )
})

const validateForm = () => {
  usernameError.value = validateUsername(username.value)
  emailError.value = validateEmail(email.value)
  passwordError.value = validatePassword(password.value)

  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
  } else {
    confirmPasswordError.value = null
  }

  return !usernameError.value && !emailError.value && !passwordError.value && !confirmPasswordError.value
}

// Handle sign up
const handleSignUp = async () => {
  if (!validateForm()) return

  if (!agreeToTerms.value) {
    appStore.showToast('Please agree to the Terms of Service and Privacy Policy', 'error')
    return
  }

  isLoading.value = true

  const { error } = await authStore.signUp(email.value, password.value, username.value)

  if (error) {
    appStore.showToast(error.message || 'Failed to create account', 'error')
    isLoading.value = false
    return
  }

  appStore.showToast('Account created! Please check your email to verify your account.', 'success', 6000)

  // Redirect to onboarding
  router.push('/onboarding')
}

// Handle OAuth sign up
const handleGoogleSignUp = async () => {
  isGoogleLoading.value = true

  const { error } = await authStore.signInWithOAuth('google')

  if (error) {
    appStore.showToast(error.message || 'Failed to sign up with Google', 'error')
    isGoogleLoading.value = false
  }
}

const handleAppleSignUp = async () => {
  isAppleLoading.value = true

  const { error } = await authStore.signInWithOAuth('apple')

  if (error) {
    appStore.showToast(error.message || 'Failed to sign up with Apple', 'error')
    isAppleLoading.value = false
  }
}

// Handle field blur events
const handleUsernameBlur = () => {
  if (username.value) {
    usernameError.value = validateUsername(username.value)
  }
}

const handleEmailBlur = () => {
  if (email.value) {
    emailError.value = validateEmail(email.value)
  }
}

const handlePasswordBlur = () => {
  if (password.value) {
    passwordError.value = validatePassword(password.value)
  }
}

const handleConfirmPasswordBlur = () => {
  if (confirmPassword.value) {
    if (password.value !== confirmPassword.value) {
      confirmPasswordError.value = 'Passwords do not match'
    } else {
      confirmPasswordError.value = null
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-16 py-48">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-32">
        <router-link to="/" class="inline-block mb-16">
          <h1 class="text-3xl font-bold text-primary">MuralMap</h1>
        </router-link>
        <h2 class="text-2xl font-bold text-text mb-8">Create your account</h2>
        <p class="text-text-muted">Join the community of street art enthusiasts</p>
      </div>

      <!-- OAuth Buttons -->
      <div class="space-y-12 mb-24">
        <OAuthButton
          provider="google"
          :loading="isGoogleLoading"
          @click="handleGoogleSignUp"
        />
        <OAuthButton
          provider="apple"
          :loading="isAppleLoading"
          @click="handleAppleSignUp"
        />
      </div>

      <BaseDivider text="or sign up with email" />

      <!-- Sign Up Form -->
      <form @submit.prevent="handleSignUp" class="space-y-16">
        <BaseInput
          v-model="username"
          type="text"
          label="Username"
          placeholder="streetartlover"
          autocomplete="username"
          required
          :error="usernameError"
          :maxlength="20"
          @blur="handleUsernameBlur"
        />

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

        <div>
          <BaseInput
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            placeholder="Create a strong password"
            autocomplete="new-password"
            required
            :error="passwordError"
            @blur="handlePasswordBlur"
          />

          <BaseCheckbox
            v-model="showPassword"
            label="Show password"
            class="mt-12"
          />

          <PasswordStrength :password="password" />
        </div>

        <div>
          <BaseInput
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            label="Confirm Password"
            placeholder="Re-enter your password"
            autocomplete="new-password"
            required
            :error="confirmPasswordError"
            @blur="handleConfirmPasswordBlur"
          />

          <BaseCheckbox
            v-model="showConfirmPassword"
            label="Show password"
            class="mt-12"
          />
        </div>

        <BaseCheckbox v-model="agreeToTerms" required>
          <span class="text-sm">
            I agree to the
            <a href="#" class="text-primary hover:underline">Terms of Service</a>
            and
            <a href="#" class="text-primary hover:underline">Privacy Policy</a>
          </span>
        </BaseCheckbox>

        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          full-width
          :loading="isLoading"
          :disabled="!isFormValid || isLoading"
        >
          Create Account
        </BaseButton>
      </form>

      <!-- Sign In Link -->
      <div class="mt-24 text-center">
        <p class="text-text-muted">
          Already have an account?
          <router-link
            to="/auth/signin"
            class="text-primary hover:text-primary-dark font-medium transition"
          >
            Sign in
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
