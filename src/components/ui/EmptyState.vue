<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface Props {
  icon: string
  title: string
  description?: string
  ctaLabel?: string
  ctaTo?: string
}

withDefaults(defineProps<Props>(), {
  description: undefined,
  ctaLabel: undefined,
  ctaTo: undefined,
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-64 text-center px-16">
    <v-icon
      :name="icon"
      scale="3"
      class="text-text-muted mb-16"
    />
    <h3 class="text-lg font-bold text-text mb-8">
      {{ title }}
    </h3>
    <p
      v-if="description"
      data-testid="description"
      class="text-text-muted text-sm mb-24 max-w-xs"
    >
      {{ description }}
    </p>
    <RouterLink
      v-if="ctaLabel && ctaTo"
      :to="ctaTo"
      class="inline-flex px-24 py-12 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium text-sm"
    >
      {{ ctaLabel }}
    </RouterLink>
  </div>
</template>
