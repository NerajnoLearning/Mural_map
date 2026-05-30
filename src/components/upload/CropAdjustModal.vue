<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'

interface Props {
  file: File
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'apply', file: File): void
  (e: 'skip'): void
}>()

type AspectRatio = 'free' | '1:1' | '4:3' | '16:9'

const aspectRatio = ref<AspectRatio>('free')
const brightness = ref(0)
const contrast = ref(0)
const applying = ref(false)
const imageUrl = ref('')

onMounted(() => {
  imageUrl.value = URL.createObjectURL(props.file)
})

onUnmounted(() => {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
})

const ratioOptions: { label: string; value: AspectRatio }[] = [
  { label: 'Free', value: 'free' },
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '16:9', value: '16:9' },
]

const containerStyle = computed(() => {
  const map: Record<AspectRatio, string> = {
    free: 'auto',
    '1:1': '1 / 1',
    '4:3': '4 / 3',
    '16:9': '16 / 9',
  }
  return { aspectRatio: map[aspectRatio.value] }
})

const filterStyle = computed(() =>
  `brightness(${100 + brightness.value}%) contrast(${100 + contrast.value}%)`
)

function reset() {
  aspectRatio.value = 'free'
  brightness.value = 0
  contrast.value = 0
}

function getCropRect(imgW: number, imgH: number) {
  if (aspectRatio.value === 'free') return { sx: 0, sy: 0, sw: imgW, sh: imgH }
  const [rw, rh] = aspectRatio.value.split(':').map(Number)
  const targetRatio = rw / rh
  const imageRatio = imgW / imgH
  if (imageRatio > targetRatio) {
    const sh = imgH
    const sw = sh * targetRatio
    const sx = (imgW - sw) / 2
    return { sx, sy: 0, sw, sh }
  } else {
    const sw = imgW
    const sh = sw / targetRatio
    const sy = (imgH - sh) / 2
    return { sx: 0, sy, sw, sh }
  }
}

async function handleApply() {
  applying.value = true
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
      img.src = imageUrl.value
    })

    const { sx, sy, sw, sh } = getCropRect(img.naturalWidth, img.naturalHeight)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(sw)
    canvas.height = Math.round(sh)
    const ctx = canvas.getContext('2d')!
    ctx.filter = filterStyle.value
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92)
    )
    emit('apply', new File([blob], 'adjusted.jpg', { type: 'image/jpeg' }))
  } finally {
    applying.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-16">
    <div class="bg-surface rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div class="p-20">
        <h2 class="text-lg font-bold text-text mb-16">
          Adjust Photo
        </h2>

        <!-- Preview -->
        <div
          class="w-full overflow-hidden rounded-lg bg-surface-elevated mb-16"
          :style="containerStyle"
        >
          <img
            v-if="imageUrl"
            :src="imageUrl"
            alt="Preview"
            class="w-full h-full object-cover"
            :style="{ filter: filterStyle }"
          >
        </div>

        <!-- Aspect ratio -->
        <div class="flex gap-8 mb-16">
          <button
            v-for="opt in ratioOptions"
            :key="opt.value"
            :data-testid="`ratio-${opt.value}`"
            class="flex-1 py-8 rounded-lg text-sm font-medium border transition"
            :class="aspectRatio === opt.value
              ? 'bg-primary text-white border-primary'
              : 'bg-surface-elevated text-text-muted border-border hover:border-primary'"
            @click="aspectRatio = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>

        <!-- Brightness -->
        <div class="mb-12">
          <div class="flex justify-between text-sm mb-6">
            <span class="text-text font-medium">Brightness</span>
            <span class="text-text-muted">{{ brightness > 0 ? `+${brightness}` : brightness }}</span>
          </div>
          <input
            v-model.number="brightness"
            type="range"
            min="-50"
            max="50"
            class="w-full accent-primary"
          >
        </div>

        <!-- Contrast -->
        <div class="mb-20">
          <div class="flex justify-between text-sm mb-6">
            <span class="text-text font-medium">Contrast</span>
            <span class="text-text-muted">{{ contrast > 0 ? `+${contrast}` : contrast }}</span>
          </div>
          <input
            v-model.number="contrast"
            type="range"
            min="-50"
            max="50"
            class="w-full accent-primary"
          >
        </div>

        <!-- Reset -->
        <div class="mb-20">
          <button
            data-testid="reset-btn"
            class="text-sm text-text-muted hover:text-text underline"
            @click="reset"
          >
            Reset to defaults
          </button>
        </div>

        <!-- Actions -->
        <div class="flex gap-12">
          <BaseButton
            data-testid="skip-btn"
            variant="ghost"
            size="md"
            class="flex-1"
            @click="emit('skip')"
          >
            Skip
          </BaseButton>
          <BaseButton
            variant="primary"
            size="md"
            class="flex-1"
            :loading="applying"
            @click="handleApply"
          >
            Apply
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
