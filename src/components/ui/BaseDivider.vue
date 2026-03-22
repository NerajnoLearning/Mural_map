<script setup lang="ts">
interface Props {
  text?: string
}

defineProps<Props>()
</script>

<template>
  <div class="relative flex items-center my-24">
    <div class="flex-grow border-t border-border"></div>
    <span v-if="text" class="flex-shrink mx-16 text-text-muted text-sm">
      {{ text }}
    </span>
    <div class="flex-grow border-t border-border"></div>
  </div>
</template>
