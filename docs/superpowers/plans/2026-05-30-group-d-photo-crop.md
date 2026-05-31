# Group D — Photo Crop & Adjust Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add crop/adjust step to photo upload flow (US-09). After selecting a photo, user sees aspect ratio presets + brightness/contrast sliders before the upload form.

**Architecture:** `CropAdjustModal.vue` — modal with canvas-based apply. `PhotoUpload.vue` modified to show modal after file validation, before compression.

**Tech Stack:** Vue 3, TypeScript, TailwindCSS, HTML5 Canvas API (no external library)

---

## File Map

| File | Action |
|------|--------|
| `src/components/upload/CropAdjustModal.vue` | Create |
| `src/components/upload/PhotoUpload.vue` | Modify |

---

## Task 1: CropAdjustModal Component

**Files:**
- Create: `src/components/upload/CropAdjustModal.vue`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/components/CropAdjustModal.spec.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Mock URL.createObjectURL
globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
globalThis.URL.revokeObjectURL = vi.fn()

const BaseButtonStub = {
  template: '<button @click="$emit(\'click\')" :disabled="disabled"><slot /></button>',
  props: ['variant', 'size', 'loading', 'disabled'],
}

import CropAdjustModal from '@/components/upload/CropAdjustModal.vue'

const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })

describe('CropAdjustModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders aspect ratio buttons', () => {
    const wrapper = mount(CropAdjustModal, {
      props: { file: mockFile },
      global: { components: { BaseButton: BaseButtonStub } },
    })
    expect(wrapper.text()).toContain('Free')
    expect(wrapper.text()).toContain('1:1')
    expect(wrapper.text()).toContain('4:3')
    expect(wrapper.text()).toContain('16:9')
  })

  it('renders brightness and contrast sliders', () => {
    const wrapper = mount(CropAdjustModal, {
      props: { file: mockFile },
      global: { components: { BaseButton: BaseButtonStub } },
    })
    const sliders = wrapper.findAll('input[type="range"]')
    expect(sliders).toHaveLength(2)
    expect(sliders[0].attributes('min')).toBe('-50')
    expect(sliders[0].attributes('max')).toBe('50')
    expect(sliders[1].attributes('min')).toBe('-50')
    expect(sliders[1].attributes('max')).toBe('50')
  })

  it('resets adjustments on Reset click', async () => {
    const wrapper = mount(CropAdjustModal, {
      props: { file: mockFile },
      global: { components: { BaseButton: BaseButtonStub } },
    })
    const sliders = wrapper.findAll('input[type="range"]')
    await sliders[0].setValue('30')
    await wrapper.find('[data-testid="reset-btn"]').trigger('click')
    expect((wrapper.findAll('input[type="range"]')[0].element as HTMLInputElement).value).toBe('0')
  })

  it('emits skip when Skip clicked', async () => {
    const wrapper = mount(CropAdjustModal, {
      props: { file: mockFile },
      global: { components: { BaseButton: BaseButtonStub } },
    })
    await wrapper.find('[data-testid="skip-btn"]').trigger('click')
    expect(wrapper.emitted('skip')).toBeTruthy()
  })

  it('changes active aspect ratio on button click', async () => {
    const wrapper = mount(CropAdjustModal, {
      props: { file: mockFile },
      global: { components: { BaseButton: BaseButtonStub } },
    })
    await wrapper.find('[data-testid="ratio-1:1"]').trigger('click')
    expect(wrapper.find('[data-testid="ratio-1:1"]').classes()).toContain('bg-primary')
  })
})
```

- [ ] **Step 2: Run — confirm FAIL**

```bash
npm run test:run -- CropAdjustModal
```

Expected: FAIL — component not found.

- [ ] **Step 3: Create `src/components/upload/CropAdjustModal.vue`**

```vue
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
```

- [ ] **Step 4: Run — confirm PASS**

```bash
npm run test:run -- CropAdjustModal
```

Expected: 5/5 PASS.

- [ ] **Step 5: Lint**

```bash
npm run lint
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/upload/CropAdjustModal.vue tests/unit/components/CropAdjustModal.spec.ts
git commit -m "feat: add CropAdjustModal component (aspect ratio + brightness/contrast)"
```

---

## Task 2: Wire CropAdjustModal into PhotoUpload

**Files:**
- Modify: `src/components/upload/PhotoUpload.vue`

- [ ] **Step 1: Read PhotoUpload.vue**

Read the file to understand current structure before editing.

- [ ] **Step 2: Modify script section**

In `<script setup>`, add after existing imports:
```typescript
import CropAdjustModal from '@/components/upload/CropAdjustModal.vue'
```

Add after existing refs (after `const metadata = ref...`):
```typescript
const showCropModal = ref(false)
const rawFile = ref<File | null>(null)
```

**Replace the entire `processFile` function** with:
```typescript
const processFile = async (file: File) => {
  const validation = validateImageFile(file, { maxSizeMB: props.maxSizeMB })
  if (!validation.valid) {
    appStore.showToast(validation.error || 'Invalid file', 'error')
    return
  }
  selectedFile.value = file
  rawFile.value = file
  showCropModal.value = true
}

async function processCompressEmit(file: File) {
  isProcessing.value = true
  try {
    const [imageMetadata, compressed] = await Promise.all([
      extractImageMetadata(file),
      compressImage(file)
    ])
    compressedImage.value = compressed
    metadata.value = imageMetadata
    emit('upload', { image: compressed, metadata: imageMetadata })
    appStore.showToast('Photo processed successfully!', 'success')
  } catch (error) {
    console.error('Error processing file:', error)
    appStore.showToast('Failed to process image', 'error')
    reset()
  } finally {
    isProcessing.value = false
  }
}

async function handleCropApply(adjustedFile: File) {
  showCropModal.value = false
  await processCompressEmit(adjustedFile)
}

async function handleCropSkip() {
  showCropModal.value = false
  await processCompressEmit(rawFile.value!)
}
```

- [ ] **Step 3: Modify template**

Add `<CropAdjustModal>` at the bottom of the template (inside the root div, after all other content):

```html
<!-- Crop/Adjust Modal -->
<CropAdjustModal
  v-if="showCropModal && rawFile"
  :file="rawFile"
  @apply="handleCropApply"
  @skip="handleCropSkip"
/>
```

- [ ] **Step 4: Run all tests**

```bash
npm run test:run
```

Expected: All tests pass.

- [ ] **Step 5: Lint**

```bash
npm run lint
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/upload/PhotoUpload.vue
git commit -m "feat: wire CropAdjustModal into PhotoUpload upload flow (US-09)"
```
