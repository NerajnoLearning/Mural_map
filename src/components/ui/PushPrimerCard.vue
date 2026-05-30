<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'

interface Props {
  onEnable: () => Promise<void>
  onDismiss: () => void
}

const props = defineProps<Props>()
const enabling = ref(false)

async function handleEnable() {
  enabling.value = true
  try {
    await props.onEnable()
  } finally {
    enabling.value = false
  }
}
</script>

<template>
  <div class="bg-primary/10 border border-primary/20 rounded-lg p-16 flex gap-12">
    <div class="flex-1">
      <p class="font-semibold text-text mb-4">
        🔔 Stay in the loop
      </p>
      <p class="text-sm text-text-muted mb-12">
        Get notified about likes, comments, and new murals from friends.
      </p>
      <BaseButton
        data-testid="primer-enable"
        variant="primary"
        size="sm"
        :loading="enabling"
        @click="handleEnable"
      >
        Enable Notifications
      </BaseButton>
    </div>
    <button
      data-testid="primer-dismiss"
      class="text-text-muted hover:text-text self-start text-xl leading-none"
      aria-label="Dismiss"
      @click="onDismiss"
    >
      ×
    </button>
  </div>
</template>
