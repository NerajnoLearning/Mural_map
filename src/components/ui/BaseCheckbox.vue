<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<template>
  <label class="flex items-center cursor-pointer group">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="w-20 h-20 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      @change="handleChange"
    />
    <span v-if="label" class="ml-8 text-text group-hover:text-primary transition-colors">
      {{ label }}
    </span>
    <span v-if="$slots.default" class="ml-8 text-text">
      <slot />
    </span>
  </label>
</template>
