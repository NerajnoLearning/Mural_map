# Progressive Web Apps (PWA)

## Overview
Progressive Web Apps are web applications that use modern web capabilities to deliver app-like experiences. MuralMap implements full PWA functionality including offline support, installability, and background sync.

---

## Implementation in MuralMap

### 1. Web App Manifest (`public/manifest.json`)

The manifest defines how the app appears when installed.

```json
{
  "name": "MuralMap - Street Art Discovery",
  "short_name": "MuralMap",
  "description": "Discover, photograph, and share street murals",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#FF6B35",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Key Properties:**
- `display: "standalone"` - Removes browser UI
- `theme_color` - Status bar color on mobile
- `icons` - App icons for home screen
- `start_url` - Entry point when launched

---

### 2. Service Worker (`public/sw.js`)

The service worker enables offline functionality and caching.

**Installation - Cache static assets:**
```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json',
          '/assets/main.css'
        ])
      })
      .then(() => self.skipWaiting())
  )
})
```

**Activation - Clean up old caches:**
```javascript
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(key => key.startsWith('muralmap-') &&
                          key !== STATIC_CACHE)
            .map(key => caches.delete(key))
        )
      })
      .then(() => self.clients.claim())
  )
})
```

**Fetch - Serve from cache or network:**
```javascript
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-http requests
  if (!request.url.startsWith('http')) return

  // Handle images with cache-first
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
    return
  }

  // Handle navigation with network-first
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE))
    return
  }
})
```

---

### 3. Caching Strategies

#### Cache-First (for static assets)
```javascript
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  if (cached) {
    return cached  // Return cached version
  }

  const response = await fetch(request)
  if (response.ok) {
    cache.put(request, response.clone())
  }

  return response
}
```

**Best for:**
- Images
- Fonts
- Static CSS/JS
- Icons

#### Network-First (for dynamic content)
```javascript
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)

    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    // Network failed, try cache
    const cache = await caches.open(cacheName)
    const cached = await cache.match(request)

    if (cached) {
      return cached
    }

    // Show offline page
    return caches.match('/offline.html')
  }
}
```

**Best for:**
- API requests
- User-generated content
- Navigation

---

### 4. Service Worker Registration

**In `index.html`:**
```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration)

          // Check for updates every hour
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000)
        })
        .catch(error => {
          console.error('SW registration failed:', error)
        })
    })
  }
</script>
```

---

### 5. Offline Page (`public/offline.html`)

Custom offline fallback when network is unavailable:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Offline - MuralMap</title>
</head>
<body>
  <div class="container">
    <div class="icon">📵</div>
    <h1>You're Offline</h1>
    <p>
      It looks like you've lost your internet connection.
      Don't worry, you can still browse cached content.
    </p>
    <button onclick="window.location.reload()">
      Try Again
    </button>
  </div>
</body>
</html>
```

---

### 6. Background Sync

Sync data when connection is restored:

```javascript
// Service Worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts())
  }
})

async function syncPosts() {
  const db = await openDB()
  const tx = db.transaction('pending-posts', 'readonly')
  const posts = await tx.objectStore('pending-posts').getAll()

  for (const post of posts) {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify(post)
      })

      if (response.ok) {
        // Remove from pending
        await db.transaction('pending-posts', 'readwrite')
          .objectStore('pending-posts')
          .delete(post.id)
      }
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }
}
```

**Registering sync from client:**
```typescript
if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
  navigator.serviceWorker.ready.then(registration => {
    return registration.sync.register('sync-posts')
  })
}
```

---

### 7. Cache Management

**Cache size limits:**
```javascript
const CACHE_LIMITS = {
  'muralmap-v1-dynamic': 50,
  'muralmap-v1-images': 100
}

async function limitCacheSize(cacheName, limit) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()

  if (keys.length > limit) {
    const toDelete = keys.slice(0, keys.length - limit)
    await Promise.all(toDelete.map(key => cache.delete(key)))
  }
}
```

---

## IndexedDB for Offline Storage

### Database Setup
```typescript
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('muralmap-db', 1)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      if (!db.objectStoreNames.contains('drafts')) {
        db.createObjectStore('drafts', { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains('pending-posts')) {
        db.createObjectStore('pending-posts', { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
```

### Saving Drafts
```typescript
async function saveDraft(draft: Draft) {
  const db = await openDB()
  const tx = db.transaction(['drafts'], 'readwrite')
  const store = tx.objectStore('drafts')

  return new Promise((resolve, reject) => {
    const request = store.add(draft)
    request.onsuccess = () => resolve(draft)
    request.onerror = () => reject(request.error)
  })
}
```

---

## Installation Prompt

**Detecting installability:**
```typescript
let deferredPrompt: any

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  showInstallButton()
})
```

**Triggering install:**
```typescript
async function installApp() {
  if (!deferredPrompt) return

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice

  if (outcome === 'accepted') {
    console.log('User installed the app')
  }

  deferredPrompt = null
}
```

---

## Meta Tags for PWA

**In `index.html`:**
```html
<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json" />

<!-- Theme Color -->
<meta name="theme-color" content="#FF6B35" />

<!-- iOS Support -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="MuralMap" />
<link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />

<!-- Viewport -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

---

## PWA Features Checklist

### ✅ Implemented in MuralMap
- [x] Web App Manifest
- [x] Service Worker
- [x] Offline support
- [x] Cache-first strategy for assets
- [x] Network-first strategy for data
- [x] Offline fallback page
- [x] Background sync
- [x] IndexedDB for drafts
- [x] Cache size limits
- [x] Install prompt ready
- [x] iOS meta tags
- [x] Theme color

### 🚀 Future Enhancements
- [ ] Push notifications
- [ ] Periodic background sync
- [ ] Share target API
- [ ] Advanced caching patterns
- [ ] Workbox integration

---

## Testing PWA

### Chrome DevTools
1. Open DevTools → Application tab
2. Check Manifest section
3. Test Service Workers
4. View Cache Storage
5. Simulate offline mode

### Lighthouse Audit
```bash
npm run build
npx serve dist
# Open Chrome DevTools → Lighthouse → Run PWA audit
```

**Target Scores:**
- PWA: 100
- Performance: 90+
- Accessibility: 90+
- Best Practices: 95+
- SEO: 90+

---

## Common Issues & Solutions

### Issue: Service Worker not updating
**Solution:**
```javascript
self.addEventListener('install', (event) => {
  self.skipWaiting()  // Force activation
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())  // Take control immediately
})
```

### Issue: Cache not clearing
**Solution:**
```javascript
// Increment version number
const CACHE_VERSION = 'muralmap-v2'  // v1 → v2
```

### Issue: HTTPS required
PWAs require HTTPS (except localhost).
**Solution:** Deploy to Vercel, Netlify, or use ngrok for testing.

---

## Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Training](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Workbox](https://developers.google.com/web/tools/workbox)

---

## Impact on MuralMap

### User Benefits
- 📱 Install to home screen
- ⚡ Fast loading (cached assets)
- 🔌 Works offline
- 💾 Save drafts when offline
- 🔄 Auto-sync when online
- 📲 Native app feel

### Technical Benefits
- Reduced server load
- Better performance
- Improved user retention
- Lower bandwidth usage
- Enhanced UX
