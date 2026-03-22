<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string | number
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number'
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  autocomplete?: string
  maxlength?: number
  minlength?: number
  pattern?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'blur'): void
  (e: 'focus'): void
}>()

const inputClasses = computed(() => {
  const base = 'w-full px-16 py-12 rounded-lg border-2 transition-colors duration-200 bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const state = props.error
    ? 'border-error focus:border-error focus:ring-error'
    : 'border-border focus:border-primary focus:ring-primary'

  return `${base} ${state}`
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block mb-8 font-medium text-text">
      {{ label }}
      <span v-if="required" class="text-error ml-4">*</span>
    </label>

    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      :minlength="minlength"
      :pattern="pattern"
      :class="inputClasses"
      :aria-invalid="!!error"
      :aria-describedby="error ? 'error-message' : undefined"
      @input="handleInput"
      @blur="emit('blur')"
      @focus="emit('focus')"
    />

    <p v-if="error" id="error-message" class="mt-8 text-sm text-error">
      {{ error }}
    </p>

    <p v-if="maxlength && !error" class="mt-8 text-sm text-text-muted text-right">
      {{ String(modelValue).length }} / {{ maxlength }}
    </p>
  </div>
</template>
