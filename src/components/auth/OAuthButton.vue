<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'

interface Props {
  provider: 'google' | 'apple'
  loading?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  fullWidth: true
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const providerConfig = {
  google: {
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.183l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.335z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>`,
    label: 'Continue with Google',
    bgColor: 'bg-white hover:bg-gray-50 border-2 border-border',
    textColor: 'text-text'
  },
  apple: {
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.55 15.3c-.49.68-1.02 1.34-1.84 1.35-.81.02-1.07-.48-2-.48-.92 0-1.21.46-1.98.49-.79.03-1.41-.72-1.9-1.4-1.01-1.38-1.78-3.91-0.74-5.62.51-.85 1.43-1.39 2.42-1.4.76-.02 1.47.51 1.93.51.46 0 1.33-.63 2.24-.54.38.02 1.45.15 2.14 1.16-.06.03-1.28.75-1.26 2.23.02 1.77 1.55 2.36 1.57 2.37-.02.05-.25.83-.81 1.63zm-2.48-11.02c.41-.5.69-1.19.61-1.88-.59.02-1.31.4-1.73.9-.38.43-.71 1.13-.62 1.79.66.05 1.33-.34 1.74-.81z"/>
    </svg>`,
    label: 'Continue with Apple',
    bgColor: 'bg-[#000000] hover:bg-[#1a1a1a]',
    textColor: 'text-white'
  }
}

const config = providerConfig[props.provider]
</script>

<template>
  <button
    :class="[
      'inline-flex items-center justify-center px-16 py-12 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed',
      config.bgColor,
      config.textColor,
      fullWidth ? 'w-full' : ''
    ]"
    :disabled="loading"
    @click="emit('click')"
  >
    <span v-if="!loading" class="mr-12" v-html="config.icon"></span>
    <span v-if="loading" class="mr-12">
      <svg class="animate-spin h-16 w-16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    <span>{{ config.label }}</span>
  </button>
</template>
