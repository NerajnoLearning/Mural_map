<script setup lang="ts">
import { computed } from 'vue'
import { getPasswordStrength } from '@/utils/validation'

interface Props {
  password: string
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: true
})

const strength = computed(() => getPasswordStrength(props.password))

const widthPercentage = computed(() => {
  return (strength.value.score / 6) * 100
})
</script>

<template>
  <div v-if="show && password" class="mt-8">
    <div class="flex items-center justify-between mb-4">
      <span class="text-sm text-text-muted">Password strength:</span>
      <span class="text-sm font-medium" :class="{
        'text-error': strength.label === 'Weak',
        'text-warning': strength.label === 'Fair',
        'text-info': strength.label === 'Good',
        'text-success': strength.label === 'Strong'
      }">
        {{ strength.label }}
      </span>
    </div>
    <div class="w-full h-6 bg-surface-elevated rounded-full overflow-hidden">
      <div
        :class="strength.color"
        class="h-full transition-all duration-300 rounded-full"
        :style="{ width: `${widthPercentage}%` }"
      ></div>
    </div>
  </div>
</template>
