import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { createLogger } from '@/utils/logger'

const logger = createLogger('PushNotifications')
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export function usePushNotifications() {
  const authStore = useAuthStore()
  const supported = 'serviceWorker' in navigator && 'PushManager' in window
  const loading = ref(false)

  async function getSubscription(): Promise<PushSubscription | null> {
    if (!supported) return null
    const reg = await navigator.serviceWorker.ready
    return reg.pushManager.getSubscription()
  }

  async function isSubscribed(): Promise<boolean> {
    return !!(await getSubscription())
  }

  async function subscribe(): Promise<boolean> {
    if (!supported || !VAPID_PUBLIC_KEY) return false
    loading.value = true
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return false

      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const clerkId = authStore.user?.id
      if (!clerkId) return false

      const res = await fetch('/.netlify/functions/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerk_id: clerkId, subscription: subscription.toJSON() }),
      })

      return res.ok
    } catch (err) {
      logger.error('Subscribe error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function unsubscribe(): Promise<boolean> {
    loading.value = true
    try {
      const subscription = await getSubscription()
      if (!subscription) return true

      const clerkId = authStore.user?.id
      if (clerkId) {
        await fetch('/.netlify/functions/push-subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clerk_id: clerkId, subscription: subscription.toJSON() }),
        })
      }

      await subscription.unsubscribe()
      return true
    } catch (err) {
      logger.error('Unsubscribe error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function toggle(enabled: boolean): Promise<boolean> {
    return enabled ? subscribe() : unsubscribe()
  }

  return { supported, loading, isSubscribed, subscribe, unsubscribe, toggle }
}
