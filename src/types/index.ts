// Re-export all types
export * from './database'

// Additional app-specific types

export interface Location {
  lat: number
  lng: number
  city?: string
  address?: string
}

export interface UploadFormData {
  image: File | null
  title: string
  artist: string
  description: string
  tags: string[]
  location: Location | null
  visibility: 'public' | 'friends'
}

export interface SearchResult {
  murals: Post[]
  artists: string[]
  tags: Tag[]
  users: User[]
}

export interface AuthUser {
  id: string
  email: string
  user_metadata: {
    display_name?: string
    avatar_url?: string
  }
}

export interface AuthState {
  user: User | null
  session: any | null
  loading: boolean
  error: string | null
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface ModalState {
  isOpen: boolean
  title?: string
  content?: string
  onConfirm?: () => void
  onCancel?: () => void
}

export interface FilterOptions {
  tags?: string[]
  city?: string
  artist?: string
  visibility?: 'public' | 'friends' | 'all'
}

export interface SortOption {
  field: 'created_at' | 'favorites_count' | 'title'
  direction: 'asc' | 'desc'
}

export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export interface ApiResponse<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

// Import database types for re-export
import type { Post, User, Collection, Comment, Tag, Notification, Friend } from './database'
