<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClerk } from '@clerk/vue'
import { useClerkAuthStore } from '@/stores/clerkAuth'
import { useAppStore } from '@/stores/app'
import { usePushNotifications } from '@/composables/usePushNotifications'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const router = useRouter()
const { signOut: clerkSignOut } = useClerk()
const authStore = useClerkAuthStore()
const appStore = useAppStore()

const activeTab = ref<'account' | 'privacy' | 'notifications' | 'appearance'>('account')

// Account settings
const displayName = ref('')
const bio = ref('')
const savingProfile = ref(false)

// Privacy settings
const defaultVisibility = ref<'public' | 'friends'>('public')
const showLocation = ref(true)
const savingPrivacy = ref(false)

// Notification preferences
const emailNotifications = ref(true)
const pushNotifications = ref(false)
const { supported: pushSupported, loading: pushLoading, isSubscribed, toggle: togglePush } = usePushNotifications()

onMounted(async () => {
  pushNotifications.value = await isSubscribed()
})

async function handlePushToggle(val: boolean) {
  const ok = await togglePush(val)
  pushNotifications.value = ok ? val : !val
}

// Appearance settings
const theme = ref<'light' | 'dark' | 'system'>('system')

// Delete account
const showDeleteConfirm = ref(false)
const deleteConfirmText = ref('')

onMounted(async () => {
  await authStore.initialize()

  const user = authStore.user
  if (user) {
    displayName.value = user.display_name || ''
    bio.value = user.bio || ''
  }

  // Load theme
  const savedTheme = localStorage.getItem('theme')
  theme.value = savedTheme ? (savedTheme as 'light' | 'dark') : 'system'
})

const handleSaveProfile = async () => {
  if (!authStore.user) return

  savingProfile.value = true

  try {
    await authStore.updateProfile({
      display_name: displayName.value.trim() || null,
      bio: bio.value.trim() || null
    })

    appStore.showToast('Profile updated successfully', 'success')
  } catch (error) {
    appStore.showToast('Failed to update profile', 'error')
  } finally {
    savingProfile.value = false
  }
}

const handleSavePrivacy = async () => {
  savingPrivacy.value = true

  try {
    // Save privacy preferences to localStorage for now
    localStorage.setItem('defaultVisibility', defaultVisibility.value)
    localStorage.setItem('showLocation', showLocation.value.toString())

    appStore.showToast('Privacy settings saved', 'success')
  } catch (error) {
    appStore.showToast('Failed to save privacy settings', 'error')
  } finally {
    savingPrivacy.value = false
  }
}

const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
  theme.value = newTheme

  if (newTheme === 'system') {
    localStorage.removeItem('theme')
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    appStore.setTheme(systemPreference)
  } else {
    appStore.setTheme(newTheme)
  }

  appStore.showToast(`Theme set to ${newTheme}`, 'success')
}

const confirmDeleteAccount = () => {
  showDeleteConfirm.value = true
}

const cancelDeleteAccount = () => {
  showDeleteConfirm.value = false
  deleteConfirmText.value = ''
}

const handleDeleteAccount = async () => {
  if (deleteConfirmText.value !== 'delete my account') {
    appStore.showToast('Please type exactly "delete my account" to confirm', 'warning')
    return
  }

  try {
    const clerkId = authStore.clerkUser?.id
    if (!clerkId) throw new Error('Not authenticated')

    const res = await fetch('/.netlify/functions/delete-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerk_id: clerkId }),
    })

    if (!res.ok) throw new Error('Deletion failed')

    await clerkSignOut()
    router.push('/')
  } catch (error) {
    appStore.showToast('Failed to delete account', 'error')
  }
}

const handleSignOut = async () => {
  authStore.signOut()
  await clerkSignOut()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="sticky top-0 z-10 bg-surface-elevated border-b border-border px-16 py-16">
        <h1 class="text-2xl font-bold text-text">
          Settings
        </h1>
        <p class="text-sm text-text-muted mt-4">
          Manage your account and preferences
        </p>
      </header>

      <div class="flex flex-col md:flex-row gap-24 p-16 sm:p-24">
        <!-- Sidebar tabs -->
        <aside class="md:w-240 flex-shrink-0">
          <nav class="space-y-4">
            <button
              class="w-full px-16 py-12 rounded-lg text-left font-medium transition"
              :class="activeTab === 'account'
                ? 'bg-primary text-white'
                : 'bg-surface-elevated text-text hover:bg-surface-overlay'"
              @click="activeTab = 'account'"
            >
              Account
            </button>
            <button
              class="w-full px-16 py-12 rounded-lg text-left font-medium transition"
              :class="activeTab === 'privacy'
                ? 'bg-primary text-white'
                : 'bg-surface-elevated text-text hover:bg-surface-overlay'"
              @click="activeTab = 'privacy'"
            >
              Privacy
            </button>
            <button
              class="w-full px-16 py-12 rounded-lg text-left font-medium transition"
              :class="activeTab === 'notifications'
                ? 'bg-primary text-white'
                : 'bg-surface-elevated text-text hover:bg-surface-overlay'"
              @click="activeTab = 'notifications'"
            >
              Notifications
            </button>
            <button
              class="w-full px-16 py-12 rounded-lg text-left font-medium transition"
              :class="activeTab === 'appearance'
                ? 'bg-primary text-white'
                : 'bg-surface-elevated text-text hover:bg-surface-overlay'"
              @click="activeTab = 'appearance'"
            >
              Appearance
            </button>
          </nav>
        </aside>

        <!-- Content -->
        <main class="flex-1">
          <!-- Account Tab -->
          <div
            v-if="activeTab === 'account'"
            class="space-y-24"
          >
            <section class="bg-surface-elevated p-24 rounded-lg">
              <h2 class="text-xl font-bold text-text mb-16">
                Profile Information
              </h2>

              <div class="space-y-16">
                <BaseInput
                  v-model="displayName"
                  label="Display Name"
                  placeholder="Your display name"
                  maxlength="50"
                />

                <div>
                  <label class="block text-sm font-medium text-text mb-8">Bio</label>
                  <textarea
                    v-model="bio"
                    class="w-full px-12 py-8 bg-surface border-2 border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:border-primary transition resize-none"
                    rows="4"
                    maxlength="200"
                    placeholder="Tell us about yourself..."
                  />
                  <p class="text-xs text-text-muted mt-4">
                    {{ bio.length }}/200 characters
                  </p>
                </div>

                <BaseButton
                  variant="primary"
                  :loading="savingProfile"
                  @click="handleSaveProfile"
                >
                  Save Changes
                </BaseButton>
              </div>
            </section>

            <section class="bg-surface-elevated p-24 rounded-lg">
              <h2 class="text-xl font-bold text-text mb-16">
                Account Actions
              </h2>
              <BaseButton
                variant="outline"
                full-width
                @click="handleSignOut"
              >
                Sign Out
              </BaseButton>
            </section>

            <!-- Danger Zone -->
            <section class="p-24 rounded-lg border-2 border-error/40">
              <h2 class="text-xl font-bold text-error mb-4">
                Danger Zone
              </h2>
              <p class="text-sm text-text-muted mb-16">
                These actions are permanent and cannot be undone.
              </p>
              <BaseButton
                variant="danger"
                full-width
                @click="confirmDeleteAccount"
              >
                Delete Account
              </BaseButton>
            </section>
          </div>

          <!-- Privacy Tab -->
          <div
            v-else-if="activeTab === 'privacy'"
            class="space-y-24"
          >
            <section class="bg-surface-elevated p-24 rounded-lg">
              <h2 class="text-xl font-bold text-text mb-16">
                Privacy Settings
              </h2>

              <div class="space-y-16">
                <div>
                  <label class="block text-sm font-medium text-text mb-8">Default Post Visibility</label>
                  <select
                    v-model="defaultVisibility"
                    class="w-full px-12 py-8 bg-surface border-2 border-border rounded-lg text-text focus:outline-none focus:border-primary transition"
                  >
                    <option value="public">
                      Public - Anyone can see
                    </option>
                    <option value="friends">
                      Friends Only - Only friends can see
                    </option>
                  </select>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-text">
                      Show Location on Posts
                    </p>
                    <p class="text-sm text-text-muted">
                      Display city/location on your murals
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="showLocation"
                      type="checkbox"
                      class="sr-only peer"
                    >
                    <div class="w-48 h-24 bg-surface-overlay rounded-full peer peer-checked:bg-primary transition" />
                    <div class="absolute left-4 top-4 w-16 h-16 bg-white rounded-full transition peer-checked:translate-x-24" />
                  </label>
                </div>

                <BaseButton
                  variant="primary"
                  :loading="savingPrivacy"
                  @click="handleSavePrivacy"
                >
                  Save Privacy Settings
                </BaseButton>
              </div>
            </section>
          </div>

          <!-- Notifications Tab -->
          <div
            v-else-if="activeTab === 'notifications'"
            class="space-y-24"
          >
            <section class="bg-surface-elevated p-24 rounded-lg">
              <h2 class="text-xl font-bold text-text mb-16">
                Notifications
              </h2>
              <div class="space-y-16">
                <!-- Email -->
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-text">
                      Email notifications
                    </p>
                    <p class="text-sm text-text-muted">
                      Receive activity updates via email
                    </p>
                  </div>
                  <button
                    role="switch"
                    :aria-checked="emailNotifications"
                    class="relative w-44 h-24 rounded-full transition-colors"
                    :class="emailNotifications ? 'bg-primary' : 'bg-border'"
                    @click="emailNotifications = !emailNotifications"
                  >
                    <span
                      class="absolute top-2 left-2 w-20 h-20 bg-white rounded-full shadow transition-transform"
                      :class="emailNotifications ? 'translate-x-20' : 'translate-x-0'"
                    />
                  </button>
                </div>
                <!-- Push -->
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-text">
                      Push notifications
                    </p>
                    <p class="text-sm text-text-muted">
                      {{ pushSupported ? 'Get notified about likes, comments, and friends' : 'Not supported in this browser' }}
                    </p>
                  </div>
                  <button
                    role="switch"
                    :aria-checked="pushNotifications"
                    :disabled="!pushSupported || pushLoading"
                    class="relative w-44 h-24 rounded-full transition-colors disabled:opacity-40"
                    :class="pushNotifications ? 'bg-primary' : 'bg-border'"
                    @click="handlePushToggle(!pushNotifications)"
                  >
                    <span
                      class="absolute top-2 left-2 w-20 h-20 bg-white rounded-full shadow transition-transform"
                      :class="pushNotifications ? 'translate-x-20' : 'translate-x-0'"
                    />
                  </button>
                </div>
              </div>
            </section>
          </div>

          <!-- Appearance Tab -->
          <div
            v-else-if="activeTab === 'appearance'"
            class="space-y-24"
          >
            <section class="bg-surface-elevated p-24 rounded-lg">
              <h2 class="text-xl font-bold text-text mb-16">
                Theme
              </h2>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-12">
                <button
                  class="p-16 rounded-lg border-2 transition text-center"
                  :class="theme === 'light'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'"
                  @click="handleThemeChange('light')"
                >
                  <div class="text-3xl mb-8">
                    ☀️
                  </div>
                  <p class="font-medium text-text">
                    Light
                  </p>
                </button>

                <button
                  class="p-16 rounded-lg border-2 transition text-center"
                  :class="theme === 'dark'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'"
                  @click="handleThemeChange('dark')"
                >
                  <div class="text-3xl mb-8">
                    🌙
                  </div>
                  <p class="font-medium text-text">
                    Dark
                  </p>
                </button>

                <button
                  class="p-16 rounded-lg border-2 transition text-center"
                  :class="theme === 'system'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'"
                  @click="handleThemeChange('system')"
                >
                  <div class="text-3xl mb-8">
                    💻
                  </div>
                  <p class="font-medium text-text">
                    System
                  </p>
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>

    <!-- Delete account confirmation modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-16"
      @click="cancelDeleteAccount"
    >
      <div
        class="bg-surface rounded-lg p-24 max-w-md w-full"
        @click.stop
      >
        <h3 class="text-xl font-bold text-text mb-12">
          Delete Account?
        </h3>
        <p class="text-text-muted mb-16">
          This action cannot be undone. All your posts, collections, and data will be permanently deleted.
        </p>

        <div class="p-12 bg-error/10 rounded-lg border border-error/20 mb-16">
          <p class="text-sm text-error">
            ⚠️ Warning: This will delete all your content and cannot be reversed.
          </p>
        </div>

        <div class="mb-24">
          <label class="block text-sm font-medium text-text mb-8">
            Type <span class="font-bold">delete my account</span> to confirm
          </label>
          <input
            v-model="deleteConfirmText"
            type="text"
            class="w-full px-12 py-8 bg-surface-elevated border-2 border-border rounded-lg text-text focus:outline-none focus:border-error transition"
            placeholder="delete my account"
          >
        </div>

        <div class="flex gap-12">
          <BaseButton
            variant="outline"
            size="md"
            full-width
            @click="cancelDeleteAccount"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="danger"
            size="md"
            full-width
            :disabled="deleteConfirmText !== 'delete my account'"
            @click="handleDeleteAccount"
          >
            Delete Account
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
