# Group D — Photo Crop & Adjust Design Spec

**Date:** 2026-05-30
**Status:** Approved
**Milestone:** M5 — Polish & PWA

---

## Scope

US-09: Crop and adjust photo before upload. Collection drag-to-reorder (US-16) is already implemented.

---

## User Story (US-09 ACs)

- AC-01: After photo selection, a crop/adjust screen is shown before the details form
- AC-02: Crop tool offers aspect ratio presets: 1:1, 4:3, 16:9, Free
- AC-03: Brightness and contrast sliders each have a range of -50 to +50, default 0
- AC-04: Reset button returns all adjustments to defaults
- AC-05: All adjustments applied client-side before upload (modified image, not original)
- AC-06: Skip bypasses crop/adjust and proceeds directly to details form

---

## Architecture

`CropAdjustModal.vue` receives the raw `File`, shows a live preview (CSS filter + object-fit:cover), and emits either `apply(adjustedFile: File)` or `skip()`.

`PhotoUpload.vue` is modified to intercept after file validation — instead of immediately compressing, it shows the modal. On Apply/Skip, it continues with compress + extract + emit.

No external crop library — uses HTML5 Canvas API only.

---

## CropAdjustModal Component

### Props
```typescript
interface Props {
  file: File
}
```

### Emits
```typescript
emit('apply', adjustedFile: File): void
emit('skip'): void
```

### State
```typescript
const aspectRatio = ref<'free' | '1:1' | '4:3' | '16:9'>('free')
const brightness = ref(0)   // -50 to +50
const contrast = ref(0)     // -50 to +50
```

### Preview
Image shown in a responsive container with:
- `object-fit: cover` — matches the canvas crop behavior exactly
- Dynamic `aspect-ratio` CSS based on `aspectRatio` value
- CSS `filter: brightness(${100 + brightness}%) contrast(${100 + contrast}%)`

### Crop calculation (for canvas)
```typescript
function getCropRect(imgW: number, imgH: number) {
  if (aspectRatio.value === 'free') return { sx: 0, sy: 0, sw: imgW, sh: imgH }
  const [rw, rh] = aspectRatio.value.split(':').map(Number)
  const targetRatio = rw / rh
  const imageRatio = imgW / imgH
  if (imageRatio > targetRatio) {
    const sh = imgH, sw = sh * targetRatio, sx = (imgW - sw) / 2
    return { sx, sy: 0, sw, sh }
  } else {
    const sw = imgW, sh = sw / targetRatio, sy = (imgH - sh) / 2
    return { sx: 0, sy, sw, sh }
  }
}
```

### Apply (canvas render)
```typescript
async function applyAdjustments(): Promise<File> {
  const img = await loadImage(imageUrl)
  const { sx, sy, sw, sh } = getCropRect(img.naturalWidth, img.naturalHeight)
  const canvas = document.createElement('canvas')
  canvas.width = sw
  canvas.height = sh
  const ctx = canvas.getContext('2d')!
  ctx.filter = `brightness(${100 + brightness.value}%) contrast(${100 + contrast.value}%)`
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
  return new Promise(resolve =>
    canvas.toBlob(blob => resolve(new File([blob!], 'adjusted.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.92)
  )
}
```

### UI Layout
```
[Modal overlay — fixed inset-0 bg-black/80 z-50]
  [Modal card — max-w-lg mx-auto bg-surface rounded-xl p-24]
    [Title: "Adjust Photo"]
    [Image preview — aspect-ratio container with live filter]
    [Aspect ratio buttons: Free | 1:1 | 4:3 | 16:9]
    [Brightness slider -50..50 with label + value]
    [Contrast slider -50..50 with label + value]
    [Reset button]
    [Actions: Skip (ghost) | Apply (primary)]
```

---

## PhotoUpload Modifications

After file validation, before compress:
```typescript
rawFile.value = file           // store for crop modal
showCropModal.value = true     // open modal — pause here
// processFile() continues in handleCropApply / handleCropSkip
```

```typescript
async function handleCropApply(adjustedFile: File) {
  showCropModal.value = false
  await processCompressEmit(adjustedFile)
}

async function handleCropSkip() {
  showCropModal.value = false
  await processCompressEmit(rawFile.value!)
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
  } catch {
    appStore.showToast('Failed to process image', 'error')
    reset()
  } finally {
    isProcessing.value = false
  }
}
```

---

## File Map

| File | Action |
|------|--------|
| `src/components/upload/CropAdjustModal.vue` | Create |
| `src/components/upload/PhotoUpload.vue` | Modify |
