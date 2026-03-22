<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { useMap } from '@/composables/useMap'
import type { Post } from '@/types'

interface Props {
  posts: Post[]
  center?: [number, number]
  zoom?: number
  showClustering?: boolean
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 13,
  showClustering: true,
  height: '600px'
})

const emit = defineEmits<{
  (e: 'markerClick', post: Post): void
  (e: 'mapReady'): void
}>()

const router = useRouter()
const mapContainer = ref<HTMLElement | null>(null)
const markerClusterGroup = ref<L.MarkerClusterGroup | null>(null)

const {
  map,
  isInitialized,
  addPostMarker,
  clearMarkers,
  setView,
  centerOnUser,
  fitMarkersInView
} = useMap(mapContainer, {
  center: props.center,
  zoom: props.zoom
})

const isLocating = ref(false)

// Initialize clustering
const initializeClustering = () => {
  if (!map.value || !props.showClustering) return

  markerClusterGroup.value = L.markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  })

  map.value.addLayer(markerClusterGroup.value)
}

// Add posts to map
const addPostsToMap = () => {
  if (!map.value) return

  clearMarkers()

  if (props.showClustering && markerClusterGroup.value) {
    markerClusterGroup.value.clearLayers()
  }

  const postsWithLocation = props.posts.filter(p => p.lat && p.lng)

  postsWithLocation.forEach(post => {
    if (!post.lat || !post.lng) return

    const popupContent = document.createElement('div')
    popupContent.innerHTML = `
      <div style="min-width: 200px; cursor: pointer;" class="map-popup">
        <img
          src="${post.image_url}"
          alt="${post.title || 'Mural'}"
          style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;"
        />
        <h3 style="font-weight: bold; margin: 0 0 4px 0; font-size: 14px;">
          ${post.title || 'Untitled'}
        </h3>
        ${post.artist ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">by ${post.artist}</p>` : ''}
        ${post.city ? `<p style="margin: 0; color: #999; font-size: 12px;">${post.city}</p>` : ''}
      </div>
    `

    // Add click handler to popup
    popupContent.addEventListener('click', () => {
      router.push(`/post/${post.id}`)
    })

    const marker = L.marker([post.lat, post.lng], {
      title: post.title || 'Mural'
    })

    marker.bindPopup(popupContent)

    marker.on('click', () => {
      emit('markerClick', post)
    })

    if (props.showClustering && markerClusterGroup.value) {
      markerClusterGroup.value.addLayer(marker)
    } else {
      marker.addTo(map.value!)
    }
  })

  // Fit map to show all markers
  if (postsWithLocation.length > 0) {
    setTimeout(() => {
      if (props.showClustering && markerClusterGroup.value) {
        const bounds = markerClusterGroup.value.getBounds()
        if (bounds.isValid()) {
          map.value?.fitBounds(bounds, { padding: [50, 50] })
        }
      } else {
        fitMarkersInView()
      }
    }, 100)
  }
}

// Locate user
const locateUser = async () => {
  isLocating.value = true

  try {
    await centerOnUser(15)
  } catch (error) {
    console.error('Could not get user location:', error)
  } finally {
    isLocating.value = false
  }
}

// Watch for posts changes
watch(() => props.posts, () => {
  if (isInitialized.value) {
    addPostsToMap()
  }
}, { deep: true })

// Watch for map initialization
watch(isInitialized, (initialized) => {
  if (initialized) {
    initializeClustering()
    addPostsToMap()
    emit('mapReady')
  }
})

onMounted(() => {
  if (isInitialized.value) {
    initializeClustering()
    addPostsToMap()
  }
})
</script>

<template>
  <div class="relative">
    <!-- Map container -->
    <div
      ref="mapContainer"
      :style="{ height }"
      class="w-full rounded-lg overflow-hidden border-2 border-border"
    ></div>

    <!-- Locate user button -->
    <button
      @click="locateUser"
      :disabled="isLocating"
      class="absolute bottom-24 right-24 p-12 bg-surface shadow-lg rounded-lg hover:bg-surface-elevated transition-colors disabled:opacity-50 z-[1000]"
      :class="{ 'opacity-50': isLocating }"
      aria-label="Center on my location"
    >
      <svg
        v-if="!isLocating"
        class="w-24 h-24 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <svg
        v-else
        class="w-24 h-24 text-primary animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </button>

    <!-- Posts count -->
    <div
      v-if="posts.length > 0"
      class="absolute top-16 left-16 px-12 py-8 bg-surface/90 backdrop-blur-sm rounded-lg shadow-lg text-sm font-medium text-text z-[1000]"
    >
      {{ posts.filter(p => p.lat && p.lng).length }} murals on map
    </div>
  </div>
</template>

<style>
/* Custom popup styles */
.leaflet-popup-content {
  margin: 12px;
}

.leaflet-popup-content-wrapper {
  border-radius: 12px;
}

.map-popup:hover {
  opacity: 0.9;
}

/* Cluster styles */
.marker-cluster-small {
  background-color: rgba(255, 107, 53, 0.6);
}

.marker-cluster-small div {
  background-color: rgba(255, 107, 53, 0.8);
  color: white;
  font-weight: bold;
}

.marker-cluster-medium {
  background-color: rgba(247, 147, 30, 0.6);
}

.marker-cluster-medium div {
  background-color: rgba(247, 147, 30, 0.8);
  color: white;
  font-weight: bold;
}

.marker-cluster-large {
  background-color: rgba(239, 68, 68, 0.6);
}

.marker-cluster-large div {
  background-color: rgba(239, 68, 68, 0.8);
  color: white;
  font-weight: bold;
}
</style>
