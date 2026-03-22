# Leaflet Maps Integration

## Overview
Leaflet is an open-source JavaScript library for interactive maps. MuralMap uses Leaflet to display murals on a map with custom markers, clustering, and geolocation features.

---

## Installation

```bash
npm install leaflet leaflet.markercluster
npm install -D @types/leaflet
```

---

## Setup in MuralMap

### 1. Map Component (`src/views/MapPage.vue`)

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import { usePostsStore } from '@/stores/posts'
import { useRouter } from 'vue-router'
import type { Post } from '@/types'

const postsStore = usePostsStore()
const router = useRouter()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markerClusterGroup: L.MarkerClusterGroup | null = null

onMounted(async () => {
  await initMap()
  await loadPosts()
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})

const initMap = () => {
  if (!mapContainer.value) return

  // Create map centered on user location or default
  map = L.map(mapContainer.value).setView([40.7128, -74.0060], 13)

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)

  // Initialize marker cluster group
  markerClusterGroup = L.markerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    maxClusterRadius: 50
  })

  map.addLayer(markerClusterGroup)

  // Try to get user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        map?.setView([latitude, longitude], 13)

        // Add user location marker
        L.marker([latitude, longitude], {
          icon: L.icon({
            iconUrl: '/icons/user-location.svg',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          })
        }).addTo(map!)
          .bindPopup('You are here')
      },
      (error) => {
        console.error('Geolocation error:', error)
      }
    )
  }
}

const loadPosts = async () => {
  await postsStore.fetchPosts(1, 100)
  addMarkersToMap(postsStore.posts)
}

const addMarkersToMap = (posts: Post[]) => {
  if (!markerClusterGroup) return

  markerClusterGroup.clearLayers()

  posts.forEach(post => {
    // Custom marker icon
    const icon = L.divIcon({
      html: `
        <div class="custom-marker">
          <img src="${post.image_url}" alt="${post.title}" />
        </div>
      `,
      className: 'custom-marker-wrapper',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    })

    const marker = L.marker([post.latitude, post.longitude], { icon })

    // Popup content
    const popupContent = `
      <div class="map-popup">
        <img src="${post.image_url}" alt="${post.title}" class="popup-image" />
        <h3 class="popup-title">${post.title}</h3>
        ${post.artist ? `<p class="popup-artist">by ${post.artist}</p>` : ''}
        <p class="popup-location">${post.location}</p>
        <button class="popup-button" onclick="window.viewPost('${post.id}')">
          View Details
        </button>
      </div>
    `

    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'custom-popup'
    })

    markerClusterGroup!.addLayer(marker)
  })
}

// Make viewPost globally accessible for popup button
;(window as any).viewPost = (postId: string) => {
  router.push(`/posts/${postId}`)
}

watch(() => postsStore.posts, (newPosts) => {
  addMarkersToMap(newPosts)
})
</script>

<template>
  <div class="map-page">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<style scoped>
.map-page {
  width: 100%;
  height: 100vh;
}

.map-container {
  width: 100%;
  height: 100%;
}

:deep(.custom-marker) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #FF6B35;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

:deep(.custom-marker img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.map-popup) {
  padding: 0;
}

:deep(.popup-image) {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

:deep(.popup-title) {
  font-size: 16px;
  font-weight: 600;
  margin: 12px 12px 4px;
}

:deep(.popup-artist) {
  font-size: 14px;
  color: #666;
  margin: 0 12px 4px;
}

:deep(.popup-location) {
  font-size: 12px;
  color: #999;
  margin: 0 12px 12px;
}

:deep(.popup-button) {
  width: calc(100% - 24px);
  margin: 0 12px 12px;
  padding: 8px 16px;
  background: #FF6B35;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

:deep(.popup-button:hover) {
  background: #E55A2B;
}
</style>
```

---

## Key Features

### 1. Custom Markers

**Using Images:**
```typescript
const icon = L.divIcon({
  html: `<div class="marker">
    <img src="${post.image_url}" />
  </div>`,
  className: 'custom-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 40]
})

const marker = L.marker([lat, lng], { icon })
```

**Using SVG:**
```typescript
const icon = L.icon({
  iconUrl: '/markers/mural-pin.svg',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42]
})
```

### 2. Marker Clustering

```typescript
import 'leaflet.markercluster'

const markerClusterGroup = L.markerClusterGroup({
  spiderfyOnMaxZoom: true,      // Spread markers on max zoom
  showCoverageOnHover: false,   // Don't show cluster coverage
  zoomToBoundsOnClick: true,    // Zoom when clicking cluster
  maxClusterRadius: 50          // Cluster radius in pixels
})

map.addLayer(markerClusterGroup)

// Add markers
posts.forEach(post => {
  const marker = L.marker([post.latitude, post.longitude])
  markerClusterGroup.addLayer(marker)
})

// Clear all markers
markerClusterGroup.clearLayers()
```

### 3. Popups

**Simple Popup:**
```typescript
marker.bindPopup('Popup content')
```

**HTML Popup:**
```typescript
const popupContent = `
  <div class="popup">
    <h3>${post.title}</h3>
    <img src="${post.image_url}" />
    <button onclick="viewPost('${post.id}')">View</button>
  </div>
`

marker.bindPopup(popupContent, {
  maxWidth: 300,
  className: 'custom-popup'
})
```

**Programmatic Popup:**
```typescript
const popup = L.popup()
  .setLatLng([lat, lng])
  .setContent('Popup content')
  .openOn(map)
```

### 4. Geolocation

**Get User Location:**
```typescript
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords

      // Center map on user
      map.setView([latitude, longitude], 13)

      // Add marker at user location
      L.marker([latitude, longitude], {
        icon: L.icon({
          iconUrl: '/icons/user-location.svg',
          iconSize: [32, 32]
        })
      }).addTo(map)
        .bindPopup('You are here')
    },
    (error) => {
      console.error('Geolocation error:', error)
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  )
}
```

**Watch User Location:**
```typescript
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    const { latitude, longitude } = position.coords
    // Update marker position
    userMarker.setLatLng([latitude, longitude])
  }
)

// Cleanup
onUnmounted(() => {
  navigator.geolocation.clearWatch(watchId)
})
```

### 5. Map Controls

**Zoom Control:**
```typescript
// Remove default zoom control
map.removeControl(map.zoomControl)

// Add custom positioned zoom control
L.control.zoom({
  position: 'bottomright'
}).addTo(map)
```

**Custom Control:**
```typescript
const CustomControl = L.Control.extend({
  onAdd: function(map) {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
    container.innerHTML = '<button>My Action</button>'

    container.onclick = () => {
      // Handle click
    }

    return container
  }
})

new CustomControl({ position: 'topright' }).addTo(map)
```

### 6. Layers

**Tile Layers:**
```typescript
// OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map)

// Mapbox (requires API key)
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  id: 'mapbox/streets-v11',
  accessToken: 'your-token-here'
}).addTo(map)

// Dark mode
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; CARTO'
}).addTo(map)
```

**Layer Groups:**
```typescript
const muralMarkers = L.layerGroup()
const galleryMarkers = L.layerGroup()

// Add markers to groups
muralMarkers.addLayer(marker1)
galleryMarkers.addLayer(marker2)

// Add/remove groups
map.addLayer(muralMarkers)
map.removeLayer(galleryMarkers)
```

**Layer Control:**
```typescript
const baseLayers = {
  'Street': streetLayer,
  'Satellite': satelliteLayer
}

const overlays = {
  'Murals': muralMarkers,
  'Galleries': galleryMarkers
}

L.control.layers(baseLayers, overlays).addTo(map)
```

### 7. Events

**Map Events:**
```typescript
map.on('click', (e: L.LeafletMouseEvent) => {
  const { lat, lng } = e.latlng
  console.log(`Clicked at ${lat}, ${lng}`)
})

map.on('moveend', () => {
  const center = map.getCenter()
  const zoom = map.getZoom()
  console.log(`Moved to ${center.lat}, ${center.lng} at zoom ${zoom}`)
})

map.on('zoomend', () => {
  console.log(`Zoom level: ${map.getZoom()}`)
})
```

**Marker Events:**
```typescript
marker.on('click', () => {
  console.log('Marker clicked')
})

marker.on('mouseover', () => {
  marker.openPopup()
})

marker.on('mouseout', () => {
  marker.closePopup()
})
```

### 8. Bounds and Fitting

**Fit to Markers:**
```typescript
const group = L.featureGroup(markers)
map.fitBounds(group.getBounds(), {
  padding: [50, 50]
})
```

**Set Bounds:**
```typescript
const bounds = L.latLngBounds(
  [southWest.lat, southWest.lng],
  [northEast.lat, northEast.lng]
)

map.fitBounds(bounds)
```

**Get Visible Markers:**
```typescript
const bounds = map.getBounds()
const visiblePosts = posts.filter(post => {
  return bounds.contains([post.latitude, post.longitude])
})
```

---

## Advanced Features

### Distance Calculation

```typescript
const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const point1 = L.latLng(lat1, lng1)
  const point2 = L.latLng(lat2, lng2)
  return point1.distanceTo(point2) // Distance in meters
}

// Format distance
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}
```

### Nearby Posts

```typescript
const getNearbyPosts = (userLat: number, userLng: number, radiusKm: number) => {
  return posts.filter(post => {
    const distance = getDistance(userLat, userLng, post.latitude, post.longitude)
    return distance <= radiusKm * 1000 // Convert km to meters
  })
}
```

### Circle Overlay

```typescript
// Show radius around user
const circle = L.circle([lat, lng], {
  color: '#FF6B35',
  fillColor: '#FF6B35',
  fillOpacity: 0.1,
  radius: 5000 // 5km in meters
}).addTo(map)
```

### Polyline (Route)

```typescript
const route = L.polyline([
  [lat1, lng1],
  [lat2, lng2],
  [lat3, lng3]
], {
  color: '#FF6B35',
  weight: 4,
  opacity: 0.7
}).addTo(map)
```

---

## Styling

### Custom Map Styles

```css
/* Map container */
.map-container {
  width: 100%;
  height: 100vh;
  border-radius: 8px;
  overflow: hidden;
}

/* Custom marker */
:deep(.custom-marker) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s;
}

:deep(.custom-marker:hover) {
  transform: scale(1.1);
}

/* Cluster styling */
:deep(.marker-cluster) {
  background-color: rgba(255, 107, 53, 0.6);
  border: 3px solid var(--color-primary);
}

:deep(.marker-cluster div) {
  background-color: rgba(255, 107, 53, 0.9);
  color: white;
  font-weight: bold;
}

/* Popup styling */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 12px;
  padding: 0;
}

:deep(.leaflet-popup-content) {
  margin: 0;
}
```

---

## Best Practices

### ✅ Do:
- Clean up map on component unmount
- Use marker clustering for many markers
- Lazy load map tiles
- Handle geolocation errors
- Optimize marker icons (use SVG or small images)
- Set max bounds to prevent infinite scrolling
- Use feature groups for related markers

### ❌ Don't:
- Add thousands of markers without clustering
- Forget to remove event listeners
- Use large images for markers
- Ignore mobile performance
- Update markers on every state change
- Create new map instances without cleaning up

---

## Performance Tips

1. **Marker Clustering** - Essential for 50+ markers
2. **Virtual Scrolling** - Only render visible markers
3. **Debounce Map Events** - Throttle moveend/zoomend handlers
4. **Lazy Load Tiles** - Load tiles only when needed
5. **Optimize Images** - Compress marker and popup images

---

## Resources

- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [Leaflet Plugins](https://leafletjs.com/plugins.html)
- [MarkerCluster Plugin](https://github.com/Leaflet/Leaflet.markercluster)
- [Free Tile Providers](https://leaflet-extras.github.io/leaflet-providers/preview/)

---

## Impact on MuralMap

### User Experience
- Visual discovery of murals
- Geolocation-based browsing
- Clustering prevents clutter
- Interactive popups with details

### Technical Benefits
- Open-source and free
- Extensive plugin ecosystem
- Mobile-friendly
- Lightweight (~40KB gzipped)
- Works offline with cached tiles
