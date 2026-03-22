import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ToastMessage, ModalState } from '@/types'

export const useAppStore = defineStore('app', () => {
  // State
  const theme = ref<'light' | 'dark'>('light')
  const toasts = ref<ToastMessage[]>([])
  const modal = ref<ModalState>({
    isOpen: false
  })
  const isOnline = ref(navigator.onLine)
  const bottomSheetOpen = ref(false)

  // Actions
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

    theme.value = (savedTheme as 'light' | 'dark') || systemPreference
    applyTheme(theme.value)

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        theme.value = e.matches ? 'dark' : 'light'
        applyTheme(theme.value)
      }
    })
  }

  const applyTheme = (newTheme: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
    applyTheme(theme.value)
  }

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 4000
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const toast: ToastMessage = {
      id,
      message,
      type,
      duration
    }

    toasts.value.push(toast)

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id)
      }, duration)
    }

    return id
  }

  const dismissToast = (id: string) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const clearAllToasts = () => {
    toasts.value = []
  }

  const openModal = (options: Omit<ModalState, 'isOpen'>) => {
    modal.value = {
      ...options,
      isOpen: true
    }
  }

  const closeModal = () => {
    if (modal.value.onCancel) {
      modal.value.onCancel()
    }
    modal.value = { isOpen: false }
  }

  const confirmModal = () => {
    if (modal.value.onConfirm) {
      modal.value.onConfirm()
    }
    modal.value = { isOpen: false }
  }

  const initializeOnlineStatus = () => {
    window.addEventListener('online', () => {
      isOnline.value = true
      showToast("You're back online", 'success')
    })

    window.addEventListener('offline', () => {
      isOnline.value = false
      showToast('No internet connection', 'warning', 0)
    })
  }

  const openBottomSheet = () => {
    bottomSheetOpen.value = true
  }

  const closeBottomSheet = () => {
    bottomSheetOpen.value = false
  }

  return {
    // State
    theme,
    toasts,
    modal,
    isOnline,
    bottomSheetOpen,
    // Actions
    initializeTheme,
    toggleTheme,
    setTheme,
    showToast,
    dismissToast,
    clearAllToasts,
    openModal,
    closeModal,
    confirmModal,
    initializeOnlineStatus,
    openBottomSheet,
    closeBottomSheet
  }
})
