import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Post } from '@/types'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useMap')

// Fix for default marker icon in Leaflet with Vite
// Use local assets instead of CDN for better offline support and security
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

export interface MapOptions {
  center?: [number, number]
  zoom?: number
  minZoom?: number
  maxZoom?: number
  scrollWheelZoom?: boolean
}

export function useMap(
  mapContainer: Ref<HTMLElement | null>,
  options: MapOptions = {}
) {
  const map = ref<L.Map | null>(null)
  const markers = ref<L.Marker[]>([])
  const isInitialized = ref(false)

  const defaultOptions: MapOptions = {
    center: [40.7128, -74.0060], // New York City default
    zoom: 13,
    minZoom: 3,
    maxZoom: 18,
    scrollWheelZoom: true,
    ...options
  }

  const initializeMap = () => {
    if (!mapContainer.value || isInitialized.value) return

    try {
      map.value = L.map(mapContainer.value, {
        scrollWheelZoom: defaultOptions.scrollWheelZoom
      }).setView(
        defaultOptions.center!,
        defaultOptions.zoom!
      )

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: defaultOptions.minZoom,
        maxZoom: defaultOptions.maxZoom
      }).addTo(map.value)

      isInitialized.value = true
    } catch (error) {
      logger.error('Error initializing map:', error)
    }
  }

  const addMarker = (
    lat: number,
    lng: number,
    options?: {
      title?: string
      icon?: L.Icon
      popup?: string | HTMLElement
      onClick?: () => void
    }
  ): L.Marker | null => {
    if (!map.value) return null

    try {
      const marker = L.marker([lat, lng], {
        title: options?.title,
        icon: options?.icon
      }).addTo(map.value)

      if (options?.popup) {
        marker.bindPopup(options.popup)
      }

      if (options?.onClick) {
        marker.on('click', options.onClick)
      }

      markers.value.push(marker)
      return marker
    } catch (error) {
      logger.error('Error adding marker:', error)
      return null
    }
  }

  const addPostMarker = (
    post: Post,
    onClick?: () => void
  ): L.Marker | null => {
    if (!post.lat || !post.lng) return null

    const popupContent = `
      <div style="min-width: 200px;">
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

    return addMarker(post.lat, post.lng, {
      title: post.title || 'Mural',
      popup: popupContent,
      onClick
    })
  }

  const clearMarkers = () => {
    if (!map.value) return

    markers.value.forEach(marker => {
      marker.remove()
    })
    markers.value = []
  }

  const setView = (lat: number, lng: number, zoom?: number) => {
    if (!map.value) return
    map.value.setView([lat, lng], zoom || defaultOptions.zoom!)
  }

  const fitBounds = (bounds: L.LatLngBounds, options?: L.FitBoundsOptions) => {
    if (!map.value) return
    map.value.fitBounds(bounds, options)
  }

  const fitMarkersInView = (padding: number = 50) => {
    if (!map.value || markers.value.length === 0) return

    const group = L.featureGroup(markers.value)
    map.value.fitBounds(group.getBounds(), {
      padding: [padding, padding]
    })
  }

  const getUserLocation = (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  const centerOnUser = async (zoom?: number) => {
    try {
      const [lat, lng] = await getUserLocation()
      setView(lat, lng, zoom || 15)
      return [lat, lng] as [number, number]
    } catch (error) {
      logger.error('Error getting user location:', error)
      throw error
    }
  }

  const destroy = () => {
    if (map.value) {
      map.value.remove()
      map.value = null
      markers.value = []
      isInitialized.value = false
    }
  }

  onMounted(() => {
    initializeMap()
  })

  onUnmounted(() => {
    destroy()
  })

  return {
    map,
    markers,
    isInitialized,
    initializeMap,
    addMarker,
    addPostMarker,
    clearMarkers,
    setView,
    fitBounds,
    fitMarkersInView,
    getUserLocation,
    centerOnUser,
    destroy
  }
}
