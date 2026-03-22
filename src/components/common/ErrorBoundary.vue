<script setup lang="ts">
import { ref, onErrorCaptured, provide } from 'vue'
import { useRouter } from 'vue-router'
import { createLogger } from '@/utils/logger'
import BaseButton from '@/components/ui/BaseButton.vue'

const logger = createLogger('ErrorBoundary')

interface Props {
  /**
   * Optional fallback component name for better error reporting
   */
  name?: string
  /**
   * Whether to show technical details (only in dev mode)
   */
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  name: 'Component',
  showDetails: false
})

const router = useRouter()
const error = ref<Error | null>(null)
const errorInfo = ref<string>('')
const isDev = import.meta.env.DEV

// Capture errors from child components
onErrorCaptured((err, instance, info) => {
  error.value = err
  errorInfo.value = info

  logger.error(`Error in ${props.name}:`, err)
  logger.error('Error info:', info)

  // TODO: Send to error tracking service (Sentry, etc.)
  if (!isDev) {
    // Example: Sentry.captureException(err, { extra: { info } })
  }

  // Prevent error from propagating up
  return false
})

const reset = () => {
  error.value = null
  errorInfo.value = ''
}

const goHome = () => {
  reset()
  router.push('/')
}

const reload = () => {
  window.location.reload()
}

// Provide a way for children to manually trigger error boundary
provide('reportError', (err: Error) => {
  error.value = err
  logger.error('Manually reported error:', err)
})
</script>

<template>
  <div v-if="error" class="min-h-screen flex items-center justify-center p-24 bg-surface">
    <div class="max-w-md w-full">
      <!-- Error Icon -->
      <div class="flex justify-center mb-24">
        <div class="w-80 h-80 rounded-full bg-error/10 flex items-center justify-center">
          <svg
            class="w-40 h-40 text-error"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      </div>

      <!-- Error Message -->
      <div class="text-center mb-32">
        <h1 class="text-2xl font-bold text-text mb-12">
          Something went wrong
        </h1>
        <p class="text-text-muted mb-16">
          We encountered an unexpected error. Please try refreshing the page or go back to the home page.
        </p>

        <!-- Technical Details (Dev Only) -->
        <div
          v-if="(props.showDetails || isDev) && error"
          class="mt-24 p-16 bg-surface-elevated border-2 border-border rounded-lg text-left"
        >
          <p class="text-xs font-mono text-error mb-8">
            {{ error.name }}: {{ error.message }}
          </p>
          <pre
            v-if="error.stack"
            class="text-xs font-mono text-text-muted overflow-x-auto whitespace-pre-wrap break-words"
          >{{ error.stack }}</pre>
          <p v-if="errorInfo" class="text-xs font-mono text-text-muted mt-8">
            Context: {{ errorInfo }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-12">
        <BaseButton
          variant="primary"
          full-width
          @click="reload"
        >
          Refresh Page
        </BaseButton>
        <BaseButton
          variant="outline"
          full-width
          @click="goHome"
        >
          Go to Home
        </BaseButton>
        <BaseButton
          variant="ghost"
          full-width
          @click="reset"
        >
          Try Again
        </BaseButton>
      </div>
    </div>
  </div>

  <!-- Render children if no error -->
  <slot v-else />
</template>
