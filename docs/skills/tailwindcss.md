# TailwindCSS

## Overview
TailwindCSS is a utility-first CSS framework that provides low-level utility classes to build custom designs. MuralMap uses Tailwind v4 for all styling with custom configuration for the brand identity.

---

## Configuration

### `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          DEFAULT: '#FF6B35',
          light: '#FF8A5C',
          dark: '#E55A2B'
        },
        accent: {
          DEFAULT: '#F7931E',
          light: '#FFB05C',
          dark: '#E07D0A'
        },
        // Surface colors (use CSS variables for dark mode)
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        'surface-overlay': 'var(--color-surface-overlay)',
        // Text colors
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        'text-inverse': 'var(--color-text-inverse)',
        // Border
        border: 'var(--color-border)',
        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem'
      },
      borderRadius: {
        '4xl': '2rem'
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.15)'
      }
    },
  },
  plugins: [],
}
```

---

## Common Patterns in MuralMap

### 1. Layout & Containers

**Page Container:**
```vue
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <!-- Page content -->
</div>
```

**Flex Layouts:**
```vue
<!-- Horizontal stack -->
<div class="flex items-center gap-4">
  <img src="..." class="w-12 h-12 rounded-full" />
  <div>
    <h3 class="font-semibold">Title</h3>
    <p class="text-sm text-text-muted">Subtitle</p>
  </div>
</div>

<!-- Vertical stack -->
<div class="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Space between -->
<div class="flex items-center justify-between">
  <h2>Title</h2>
  <button>Action</button>
</div>
```

**Grid Layouts:**
```vue
<!-- Responsive grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <PostCard v-for="post in posts" :key="post.id" :post="post" />
</div>

<!-- Auto-fit grid -->
<div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
  <!-- Auto-sizing cards -->
</div>
```

### 2. Typography

```vue
<!-- Headings -->
<h1 class="text-4xl font-bold text-text">Main Title</h1>
<h2 class="text-3xl font-semibold text-text">Section Title</h2>
<h3 class="text-2xl font-medium text-text">Subsection</h3>

<!-- Body text -->
<p class="text-base text-text">Regular paragraph text</p>
<p class="text-sm text-text-muted">Smaller muted text</p>
<p class="text-xs text-text-muted">Caption text</p>

<!-- Line clamping -->
<p class="line-clamp-2">
  This text will be truncated after 2 lines with ellipsis...
</p>

<!-- Text alignment -->
<p class="text-left sm:text-center lg:text-right">Responsive alignment</p>
```

### 3. Colors & Backgrounds

```vue
<!-- Background colors -->
<div class="bg-surface">Default background</div>
<div class="bg-surface-elevated">Elevated surface</div>
<div class="bg-primary text-white">Primary background</div>
<div class="bg-accent text-white">Accent background</div>

<!-- Text colors -->
<p class="text-text">Default text</p>
<p class="text-text-muted">Muted text</p>
<p class="text-primary">Primary text</p>
<p class="text-error">Error text</p>

<!-- Gradients -->
<div class="bg-gradient-to-r from-primary to-accent">
  Gradient background
</div>

<!-- Opacity -->
<div class="bg-black bg-opacity-50">Semi-transparent overlay</div>
```

### 4. Buttons

```vue
<!-- Primary button -->
<button class="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors">
  Primary Action
</button>

<!-- Secondary button -->
<button class="px-6 py-3 bg-surface-elevated hover:bg-border text-text font-medium rounded-lg transition-colors border border-border">
  Secondary Action
</button>

<!-- Icon button -->
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-elevated transition-colors">
  <svg class="w-5 h-5">...</svg>
</button>

<!-- Disabled state -->
<button class="px-6 py-3 bg-primary text-white rounded-lg opacity-50 cursor-not-allowed" disabled>
  Disabled
</button>

<!-- Button with loading -->
<button class="px-6 py-3 bg-primary text-white rounded-lg flex items-center gap-2" disabled>
  <svg class="animate-spin w-5 h-5">...</svg>
  Loading...
</button>
```

### 5. Cards

```vue
<!-- Basic card -->
<div class="bg-surface-elevated rounded-lg shadow-card p-6">
  <h3 class="font-semibold mb-2">Card Title</h3>
  <p class="text-text-muted">Card content</p>
</div>

<!-- Interactive card -->
<div class="bg-surface-elevated rounded-lg shadow-card hover:shadow-card-hover transition-shadow cursor-pointer">
  <!-- Card content -->
</div>

<!-- Card with image -->
<div class="bg-surface-elevated rounded-lg overflow-hidden shadow-card">
  <img src="..." class="w-full h-48 object-cover" />
  <div class="p-4">
    <h3 class="font-semibold">Card Title</h3>
    <p class="text-sm text-text-muted mt-1">Description</p>
  </div>
</div>
```

### 6. Forms & Inputs

```vue
<!-- Text input -->
<input
  type="text"
  class="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
  placeholder="Enter text..."
/>

<!-- Textarea -->
<textarea
  class="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
  rows="4"
  placeholder="Enter description..."
></textarea>

<!-- Select -->
<select class="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary">
  <option>Option 1</option>
  <option>Option 2</option>
</select>

<!-- Checkbox -->
<label class="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" class="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary" />
  <span class="text-text">Accept terms</span>
</label>

<!-- Toggle switch -->
<label class="relative inline-block w-12 h-6 cursor-pointer">
  <input type="checkbox" class="sr-only peer" />
  <div class="w-12 h-6 bg-border rounded-full peer-checked:bg-primary transition-colors"></div>
  <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
</label>
```

### 7. Responsive Design

```vue
<!-- Mobile-first approach -->
<div class="text-sm sm:text-base md:text-lg lg:text-xl">
  Responsive text size
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Responsive columns -->
</div>

<!-- Show/hide based on screen size -->
<div class="hidden md:block">Desktop only</div>
<div class="block md:hidden">Mobile only</div>

<!-- Responsive padding -->
<div class="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
  <!-- Responsive spacing -->
</div>
```

### 8. Animations & Transitions

```vue
<!-- Hover effects -->
<div class="hover:scale-105 transition-transform">
  Grows on hover
</div>

<div class="hover:shadow-lg transition-shadow">
  Shadow on hover
</div>

<!-- Fade in -->
<div class="opacity-0 animate-fade-in">
  Fades in
</div>

<!-- Spin (for loading) -->
<svg class="animate-spin w-6 h-6">...</svg>

<!-- Pulse -->
<div class="animate-pulse bg-surface-elevated h-20 rounded"></div>

<!-- Transition utilities -->
<button class="transition-all duration-300 ease-in-out hover:scale-110 hover:bg-primary-dark">
  Smooth transitions
</button>
```

### 9. Dark Mode

```vue
<!-- Using CSS variables (preferred in MuralMap) -->
<div class="bg-surface text-text">
  Automatically adapts to dark mode via CSS variables
</div>

<!-- Direct dark mode classes (alternative) -->
<div class="bg-white dark:bg-gray-900 text-black dark:text-white">
  Explicit dark mode styling
</div>
```

### 10. Custom Utilities

**Defined in `main.css`:**

```css
@layer utilities {
  /* Line clamping */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Hide scrollbar */
  .scrollbar-hidden {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .scrollbar-hidden::-webkit-scrollbar {
    display: none;
  }
}
```

**Usage:**
```vue
<div class="overflow-auto scrollbar-hidden">
  Content with hidden scrollbar
</div>

<p class="line-clamp-3">
  Long text that will be truncated after 3 lines...
</p>
```

---

## Component Examples

### Post Card Component

```vue
<template>
  <div class="bg-surface-elevated rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
    <!-- Image -->
    <div class="relative aspect-square">
      <img
        :src="post.image_url"
        :alt="post.title"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div class="absolute bottom-0 left-0 right-0 p-4">
        <h3 class="text-white font-semibold text-lg line-clamp-2">
          {{ post.title }}
        </h3>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <div class="flex items-center gap-3 mb-3">
        <img
          :src="post.user.avatar_url"
          class="w-8 h-8 rounded-full"
        />
        <span class="text-sm text-text-muted">
          {{ post.user.display_name }}
        </span>
      </div>

      <p class="text-sm text-text-muted mb-4 line-clamp-2">
        {{ post.description }}
      </p>

      <!-- Actions -->
      <div class="flex items-center gap-4">
        <button class="flex items-center gap-1 text-text-muted hover:text-error transition-colors">
          <svg class="w-5 h-5">...</svg>
          <span class="text-sm">{{ post.favorites?.length || 0 }}</span>
        </button>
        <button class="flex items-center gap-1 text-text-muted hover:text-primary transition-colors">
          <svg class="w-5 h-5">...</svg>
          <span class="text-sm">{{ post.comments?.length || 0 }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
```

### Modal Component

```vue
<template>
  <!-- Overlay -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click="close"
  >
    <!-- Modal -->
    <div
      class="bg-surface rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 class="text-2xl font-semibold text-text">{{ title }}</h2>
        <button
          @click="close"
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-elevated transition-colors"
        >
          <svg class="w-5 h-5">...</svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <slot />
      </div>

      <!-- Footer (optional) -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-border">
        <button class="px-4 py-2 text-text-muted hover:bg-surface-elevated rounded-lg transition-colors">
          Cancel
        </button>
        <button class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors">
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>
```

---

## Responsive Breakpoints

```javascript
// Tailwind default breakpoints
sm: '640px'   // Small devices (landscape phones)
md: '768px'   // Medium devices (tablets)
lg: '1024px'  // Large devices (desktops)
xl: '1280px'  // Extra large devices (large desktops)
2xl: '1536px' // 2X large devices (larger desktops)
```

**Mobile-first approach:**
```vue
<!-- Base: mobile, then override for larger screens -->
<div class="text-sm md:text-base lg:text-lg">
  Font size increases with screen size
</div>
```

---

## Best Practices

### ✅ Do:
- Use utility classes for styling
- Follow mobile-first responsive design
- Use CSS variables for theme values
- Compose utilities for complex components
- Use `@apply` sparingly (only in `@layer` blocks)
- Group related utilities together
- Use custom utilities for repeated patterns

### ❌ Don't:
- Write custom CSS when utilities exist
- Use `@apply` outside of `@layer` blocks
- Mix inline styles with Tailwind
- Create overly long class strings (extract components)
- Ignore responsive design
- Use arbitrary values excessively

---

## Performance Tips

1. **Purge unused CSS** - Tailwind automatically removes unused classes in production
2. **Use JIT mode** - Just-in-time compilation for faster builds
3. **Avoid arbitrary values** - Use theme values when possible
4. **Component extraction** - Extract repeated utility combinations

---

## Resources

- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)
- [Headless UI](https://headlessui.com/) - Unstyled components for Tailwind
- [Tailwind Play](https://play.tailwindcss.com/) - Online playground

---

## Impact on MuralMap

### Development Speed
- Rapid prototyping with utility classes
- No need to name CSS classes
- Consistent spacing and colors
- Responsive design made easy

### Maintainability
- Styles colocated with components
- No CSS conflicts or specificity issues
- Easy to understand what styles do
- Theme changes via configuration

### Bundle Size
- Only used utilities included
- ~10KB minified + gzipped in production
- No unused CSS in final bundle
