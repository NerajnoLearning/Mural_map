// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { clerkPlugin } from '@clerk/vue'
import router from './router'
import App from './App.vue'
import './assets/main.css'
import { logger } from './utils/logger'
import { configureSanitizer } from './utils/sanitize'
import { getEnvironmentConfig } from './utils/env'

// Validate environment variables before app initialization
try {
  const env = getEnvironmentConfig()
  logger.info('Environment validated successfully', {
    isDev: env.isDevelopment,
    hasClerk: !!env.clerkPublishableKey
  })
} catch (error) {
  logger.error('Environment validation failed:', error)
  // Show error to user
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-center; min-height: 100vh; padding: 2rem; background: #f5f5f5;">
      <div style="max-width: 600px; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h1 style="color: #e53e3e; margin-bottom: 1rem;">Configuration Error</h1>
        <pre style="background: #f7fafc; padding: 1rem; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;">${(error as Error).message}</pre>
      </div>
    </div>
  `
  throw error
}

// Configure DOMPurify on app initialization
configureSanitizer()

const pinia = createPinia()
const app = createApp(App)

// CRITICAL: Install Pinia FIRST before any other plugins
app.use(pinia)

// Install Clerk
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  logger.warn('⚠️ VITE_CLERK_PUBLISHABLE_KEY is missing. Please add it to your .env file.')
  logger.warn('Get your key from: https://dashboard.clerk.com/')
} else {
  app.use(clerkPlugin, {
    publishableKey: clerkPubKey
  })
}

app.use(router)

// Mount app last
app.mount('#app')
