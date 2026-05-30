<script setup lang="ts">
interface Props {
  count: number
  onSync: () => void
  onDismiss: () => void
}

defineProps<Props>()
</script>

<template>
  <div class="fixed bottom-64 md:bottom-0 left-0 right-0 z-40 bg-amber-500 text-white flex items-center justify-between px-16 py-10 shadow-lg">
    <span class="text-sm font-medium">
      Back online · {{ count }} {{ count === 1 ? 'draft' : 'drafts' }} ready to sync
    </span>
    <div class="flex items-center gap-8">
      <button
        data-testid="sync-btn"
        class="text-sm font-semibold underline hover:no-underline"
        @click="onSync"
      >
        Sync now
      </button>
      <button
        data-testid="dismiss-btn"
        class="text-lg font-bold leading-none hover:opacity-75"
        aria-label="Dismiss"
        @click="onDismiss"
      >
        ×
      </button>
    </div>
  </div>
</template>
