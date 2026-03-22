<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: string[]
  label?: string
  placeholder?: string
  maxTags?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Add a tag...',
  maxTags: 5,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const inputValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const canAddMore = computed(() => props.modelValue.length < props.maxTags)

const addTag = () => {
  const tag = inputValue.value.trim().toLowerCase()

  if (!tag) return

  // Check if tag already exists
  if (props.modelValue.includes(tag)) {
    inputValue.value = ''
    return
  }

  // Check max tags
  if (!canAddMore.value) {
    inputValue.value = ''
    return
  }

  // Add tag
  emit('update:modelValue', [...props.modelValue, tag])
  inputValue.value = ''
}

const removeTag = (index: number) => {
  const newTags = [...props.modelValue]
  newTags.splice(index, 1)
  emit('update:modelValue', newTags)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    addTag()
  } else if (event.key === 'Backspace' && !inputValue.value && props.modelValue.length > 0) {
    removeTag(props.modelValue.length - 1)
  }
}

const focusInput = () => {
  inputRef.value?.focus()
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block mb-8 font-medium text-text">
      {{ label }}
    </label>

    <div
      :class="[
        'flex flex-wrap gap-8 p-12 rounded-lg border-2 transition-colors cursor-text',
        disabled
          ? 'border-border bg-surface-elevated opacity-50 cursor-not-allowed'
          : 'border-border bg-surface hover:border-primary focus-within:border-primary focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2'
      ]"
      @click="focusInput"
    >
      <!-- Tags -->
      <div
        v-for="(tag, index) in modelValue"
        :key="tag"
        class="inline-flex items-center gap-6 px-12 py-6 bg-primary/10 text-primary rounded-lg text-sm font-medium"
      >
        <span>{{ tag }}</span>
        <button
          v-if="!disabled"
          type="button"
          @click.stop="removeTag(index)"
          class="hover:text-primary-dark transition-colors"
          aria-label="Remove tag"
        >
          <svg class="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Input -->
      <input
        v-if="canAddMore && !disabled"
        ref="inputRef"
        v-model="inputValue"
        type="text"
        :placeholder="modelValue.length === 0 ? placeholder : ''"
        class="flex-1 min-w-[120px] bg-transparent border-none outline-none text-text placeholder:text-text-muted"
        @keydown="handleKeydown"
        @blur="addTag"
      />
    </div>

    <p class="mt-8 text-sm text-text-muted">
      {{ modelValue.length }} / {{ maxTags }} tags
      <span v-if="canAddMore" class="ml-8">• Press Enter to add</span>
    </p>
  </div>
</template>
