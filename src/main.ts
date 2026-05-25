// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { clerkPlugin } from '@clerk/vue'
import * as Sentry from '@sentry/vue'
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
  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; background: #f5f5f5;'
  const card = document.createElement('div')
  card.style.cssText = 'max-width: 600px; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);'
  const heading = document.createElement('h1')
  heading.style.cssText = 'color: #e53e3e; margin-bottom: 1rem;'
  heading.textContent = 'Configuration Error'
  const pre = document.createElement('pre')
  pre.style.cssText = 'background: #f7fafc; padding: 1rem; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;'
  pre.textContent = (error as Error).message
  card.appendChild(heading)
  card.appendChild(pre)
  wrapper.appendChild(card)
  document.body.appendChild(wrapper)
  throw error
}

// Configure DOMPurify on app initialization
configureSanitizer()

const pinia = createPinia()
const app = createApp(App)

// Initialize Sentry (production only, DSN optional)
const sentryDsn = import.meta.env.VITE_SENTRY_DSN
if (sentryDsn && import.meta.env.PROD) {
  Sentry.init({
    app,
    dsn: sentryDsn,
    integrations: [Sentry.browserTracingIntegration({ router })],
    tracesSampleRate: 0.2,
    environment: 'production',
  })
}

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
