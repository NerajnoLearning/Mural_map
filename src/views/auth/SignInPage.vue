<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import BaseDivider from '@/components/ui/BaseDivider.vue'
import OAuthButton from '@/components/auth/OAuthButton.vue'
import { validateEmail } from '@/utils/validation'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

// Form state
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

// Loading states
const isLoading = ref(false)
const isGoogleLoading = ref(false)
const isAppleLoading = ref(false)

// Validation errors
const emailError = ref<string | null>(null)
const passwordError = ref<string | null>(null)

// Form validation
const isFormValid = computed(() => {
  return email.value && password.value && !emailError.value && !passwordError.value
})

const validateForm = () => {
  emailError.value = validateEmail(email.value)
  passwordError.value = password.value ? null : 'Password is required'

  return !emailError.value && !passwordError.value
}

// Handle sign in
const handleSignIn = async () => {
  if (!validateForm()) return

  isLoading.value = true

  const { error } = await authStore.signIn(email.value, password.value)

  if (error) {
    appStore.showToast(error.message || 'Failed to sign in', 'error')
    isLoading.value = false
    return
  }

  appStore.showToast('Welcome back!', 'success')

  // Redirect to intended page or home
  const redirect = route.query.redirect as string
  router.push(redirect || '/')
}

// Handle OAuth sign in
const handleGoogleSignIn = async () => {
  isGoogleLoading.value = true

  const { error } = await authStore.signInWithOAuth('google')

  if (error) {
    appStore.showToast(error.message || 'Failed to sign in with Google', 'error')
    isGoogleLoading.value = false
  }
}

const handleAppleSignIn = async () => {
  isAppleLoading.value = true

  const { error } = await authStore.signInWithOAuth('apple')

  if (error) {
    appStore.showToast(error.message || 'Failed to sign in with Apple', 'error')
    isAppleLoading.value = false
  }
}

// Handle email blur
const handleEmailBlur = () => {
  if (email.value) {
    emailError.value = validateEmail(email.value)
  }
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
        <h2 class="text-2xl font-bold text-text mb-8">Welcome back</h2>
        <p class="text-text-muted">Sign in to continue exploring street art</p>
      </div>

      <!-- OAuth Buttons -->
      <div class="space-y-12 mb-24">
        <OAuthButton
          provider="google"
          :loading="isGoogleLoading"
          @click="handleGoogleSignIn"
        />
        <OAuthButton
          provider="apple"
          :loading="isAppleLoading"
          @click="handleAppleSignIn"
        />
      </div>

      <BaseDivider text="or continue with email" />

      <!-- Sign In Form -->
      <form @submit.prevent="handleSignIn" class="space-y-16">
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
            placeholder="Enter your password"
            autocomplete="current-password"
            required
            :error="passwordError"
          />

          <div class="flex items-center justify-between mt-12">
            <BaseCheckbox
              v-model="showPassword"
              label="Show password"
            />
            <router-link
              to="/auth/forgot-password"
              class="text-sm text-primary hover:text-primary-dark transition"
            >
              Forgot password?
            </router-link>
          </div>
        </div>

        <BaseCheckbox
          v-model="rememberMe"
          label="Remember me"
        />

        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          full-width
          :loading="isLoading"
          :disabled="!isFormValid || isLoading"
        >
          Sign In
        </BaseButton>
      </form>

      <!-- Sign Up Link -->
      <div class="mt-24 text-center">
        <p class="text-text-muted">
          Don't have an account?
          <router-link
            to="/auth/signup"
            class="text-primary hover:text-primary-dark font-medium transition"
          >
            Sign up
          </router-link>
        </p>
      </div>

      <!-- Terms & Privacy -->
      <div class="mt-32 text-center text-xs text-text-muted">
        <p>
          By signing in, you agree to our
          <a href="#" class="text-primary hover:underline">Terms of Service</a>
          and
          <a href="#" class="text-primary hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  </div>
</template>
