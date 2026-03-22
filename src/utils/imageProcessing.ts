import imageCompression from 'browser-image-compression'
import * as exifr from 'exifr'

export interface CompressedImage {
  file: File
  dataUrl: string
  width: number
  height: number
}

export interface ImageMetadata {
  latitude: number | null
  longitude: number | null
  dateTaken: Date | null
  camera: string | null
  orientation: number | null
}

/**
 * Compress an image file for upload
 */
export async function compressImage(
  file: File,
  options: {
    maxSizeMB?: number
    maxWidthOrHeight?: number
    useWebWorker?: boolean
  } = {}
): Promise<CompressedImage> {
  const defaultOptions = {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    ...options
  }

  try {
    const compressedFile = await imageCompression(file, defaultOptions)

    // Create data URL for preview
    const dataUrl = await imageCompression.getDataUrlFromFile(compressedFile)

    // Get dimensions
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = dataUrl
    })

    return {
      file: compressedFile,
      dataUrl,
      width: img.width,
      height: img.height
    }
  } catch (error) {
    console.error('Error compressing image:', error)
    throw new Error('Failed to compress image')
  }
}

/**
 * Extract EXIF metadata from image file
 */
export async function extractImageMetadata(file: File): Promise<ImageMetadata> {
  try {
    const exifData = await exifr.parse(file, {
      gps: true,
      ifd0: true,
      exif: true
    })

    if (!exifData) {
      return {
        latitude: null,
        longitude: null,
        dateTaken: null,
        camera: null,
        orientation: null
      }
    }

    // Extract GPS coordinates
    const latitude = exifData.latitude ?? null
    const longitude = exifData.longitude ?? null

    // Extract date taken
    let dateTaken: Date | null = null
    if (exifData.DateTimeOriginal) {
      dateTaken = new Date(exifData.DateTimeOriginal)
    } else if (exifData.DateTime) {
      dateTaken = new Date(exifData.DateTime)
    }

    // Extract camera info
    let camera: string | null = null
    if (exifData.Make && exifData.Model) {
      camera = `${exifData.Make} ${exifData.Model}`.trim()
    } else if (exifData.Model) {
      camera = exifData.Model
    }

    // Extract orientation
    const orientation = exifData.Orientation ?? null

    return {
      latitude,
      longitude,
      dateTaken,
      camera,
      orientation
    }
  } catch (error) {
    console.error('Error extracting EXIF data:', error)
    return {
      latitude: null,
      longitude: null,
      dateTaken: null,
      camera: null,
      orientation: null
    }
  }
}

/**
 * Validate image file
 */
export function validateImageFile(
  file: File,
  options: {
    maxSizeMB?: number
    allowedTypes?: string[]
  } = {}
): { valid: boolean; error?: string } {
  const {
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
  } = options

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not supported. Please use: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`
    }
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `File size too large. Maximum size is ${maxSizeMB}MB`
    }
  }

  return { valid: true }
}

/**
 * Create a thumbnail from an image file
 */
export async function createThumbnail(
  file: File,
  size: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Calculate dimensions to maintain aspect ratio
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > size) {
            height = (height * size) / width
            width = size
          }
        } else {
          if (height > size) {
            width = (width * size) / height
            height = size
          }
        }

        canvas.width = width
        canvas.height = height

        ctx.drawImage(img, 0, 0, width, height)

        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Get geocoding data from coordinates (reverse geocoding)
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ city: string | null; address: string | null }> {
  try {
    // Using Nominatim (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MuralMap/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Geocoding failed')
    }

    const data = await response.json()

    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      null

    const address = data.display_name || null

    return { city, address }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return { city: null, address: null }
  }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}
