import { ref } from 'vue'

const DB_NAME = 'muralmap-db'
const DB_VERSION = 1
const DRAFTS_STORE = 'drafts'
const PENDING_POSTS_STORE = 'pending-posts'

export interface Draft {
  id: string
  title: string
  description: string
  artist: string
  image_data: string // base64 or blob URL
  lat: number | null
  lng: number | null
  city: string
  tags: string[]
  visibility: 'public' | 'friends'
  created_at: string
  updated_at: string
}

export interface PendingPost extends Draft {
  user_id: string
  status: 'pending' | 'syncing' | 'failed'
  error?: string
}

export function useOfflineDrafts() {
  const db = ref<IDBDatabase | null>(null)
  const drafts = ref<Draft[]>([])
  const pendingPosts = ref<PendingPost[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Open IndexedDB connection
  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        error.value = 'Failed to open database'
        reject(request.error)
      }

      request.onsuccess = () => {
        db.value = request.result
        resolve(request.result)
      }

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result

        // Create drafts store
        if (!database.objectStoreNames.contains(DRAFTS_STORE)) {
          database.createObjectStore(DRAFTS_STORE, { keyPath: 'id' })
        }

        // Create pending posts store
        if (!database.objectStoreNames.contains(PENDING_POSTS_STORE)) {
          database.createObjectStore(PENDING_POSTS_STORE, { keyPath: 'id' })
        }
      }
    })
  }

  // Save draft
  const saveDraft = async (draft: Omit<Draft, 'id' | 'created_at' | 'updated_at'>): Promise<Draft> => {
    try {
      const database = db.value || await openDB()

      const newDraft: Draft = {
        ...draft,
        id: `draft-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return new Promise((resolve, reject) => {
        const transaction = database.transaction([DRAFTS_STORE], 'readwrite')
        const store = transaction.objectStore(DRAFTS_STORE)
        const request = store.add(newDraft)

        request.onsuccess = () => {
          drafts.value.push(newDraft)
          resolve(newDraft)
        }

        request.onerror = () => {
          error.value = 'Failed to save draft'
          reject(request.error)
        }
      })
    } catch (err) {
      error.value = 'Failed to save draft'
      throw err
    }
  }

  // Update draft
  const updateDraft = async (id: string, updates: Partial<Draft>): Promise<void> => {
    try {
      const database = db.value || await openDB()

      return new Promise((resolve, reject) => {
        const transaction = database.transaction([DRAFTS_STORE], 'readwrite')
        const store = transaction.objectStore(DRAFTS_STORE)
        const getRequest = store.get(id)

        getRequest.onsuccess = () => {
          const existingDraft = getRequest.result

          if (!existingDraft) {
            reject(new Error('Draft not found'))
            return
          }

          const updatedDraft: Draft = {
            ...existingDraft,
            ...updates,
            updated_at: new Date().toISOString()
          }

          const putRequest = store.put(updatedDraft)

          putRequest.onsuccess = () => {
            const index = drafts.value.findIndex(d => d.id === id)
            if (index !== -1) {
              drafts.value[index] = updatedDraft
            }
            resolve()
          }

          putRequest.onerror = () => {
            error.value = 'Failed to update draft'
            reject(putRequest.error)
          }
        }

        getRequest.onerror = () => {
          error.value = 'Failed to fetch draft'
          reject(getRequest.error)
        }
      })
    } catch (err) {
      error.value = 'Failed to update draft'
      throw err
    }
  }

  // Get all drafts
  const getAllDrafts = async (): Promise<Draft[]> => {
    try {
      loading.value = true
      const database = db.value || await openDB()

      return new Promise((resolve, reject) => {
        const transaction = database.transaction([DRAFTS_STORE], 'readonly')
        const store = transaction.objectStore(DRAFTS_STORE)
        const request = store.getAll()

        request.onsuccess = () => {
          drafts.value = request.result
          resolve(request.result)
        }

        request.onerror = () => {
          error.value = 'Failed to fetch drafts'
          reject(request.error)
        }
      })
    } catch (err) {
      error.value = 'Failed to fetch drafts'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get draft by ID
  const getDraft = async (id: string): Promise<Draft | null> => {
    try {
      const database = db.value || await openDB()

      return new Promise((resolve, reject) => {
        const transaction = database.transaction([DRAFTS_STORE], 'readonly')
        const store = transaction.objectStore(DRAFTS_STORE)
        const request = store.get(id)

        request.onsuccess = () => {
          resolve(request.result || null)
        }

        request.onerror = () => {
          error.value = 'Failed to fetch draft'
          reject(request.error)
        }
      })
    } catch (err) {
      error.value = 'Failed to fetch draft'
      throw err
    }
  }

  // Delete draft
  const deleteDraft = async (id: string): Promise<void> => {
    try {
      const database = db.value || await openDB()

      return new Promise((resolve, reject) => {
        const transaction = database.transaction([DRAFTS_STORE], 'readwrite')
        const store = transaction.objectStore(DRAFTS_STORE)
        const request = store.delete(id)

        request.onsuccess = () => {
          drafts.value = drafts.value.filter(d => d.id !== id)
          resolve()
        }

        request.onerror = () => {
          error.value = 'Failed to delete draft'
          reject(request.error)
        }
      })
    } catch (err) {
      error.value = 'Failed to delete draft'
      throw err
    }
  }

  // Save pending post (for offline submission)
  const savePendingPost = async (post: Omit<PendingPost, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<PendingPost> => {
    try {
      const database = db.value || await openDB()

      const newPost: PendingPost = {
        ...post,
        id: `pending-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return new Promise((resolve, reject) => {
        const transaction = database.transaction([PENDING_POSTS_STORE], 'readwrite')
        const store = transaction.objectStore(PENDING_POSTS_STORE)
        const request = store.add(newPost)

        request.onsuccess = () => {
          pendingPosts.value.push(newPost)

          // Register background sync if available
          if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
            navigator.serviceWorker.ready.then(registration => {
              return registration.sync.register('sync-posts')
            }).catch(console.error)
          }

          resolve(newPost)
        }

        request.onerror = () => {
          error.value = 'Failed to save pending post'
          reject(request.error)
        }
      })
    } catch (err) {
      error.value = 'Failed to save pending post'
      throw err
    }
  }

  // Get all pending posts
  const getAllPendingPosts = async (): Promise<PendingPost[]> => {
    try {
      loading.value = true
      const database = db.value || await openDB()

      return new Promise((resolve, reject) => {
        const transaction = database.transaction([PENDING_POSTS_STORE], 'readonly')
        const store = transaction.objectStore(PENDING_POSTS_STORE)
        const request = store.getAll()

        request.onsuccess = () => {
          pendingPosts.value = request.result
          resolve(request.result)
        }

        request.onerror = () => {
          error.value = 'Failed to fetch pending posts'
          reject(request.error)
        }
      })
    } catch (err) {
      error.value = 'Failed to fetch pending posts'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete pending post
  const deletePendingPost = async (id: string): Promise<void> => {
    try {
      const database = db.value || await openDB()

      return new Promise((resolve, reject) => {
        const transaction = database.transaction([PENDING_POSTS_STORE], 'readwrite')
        const store = transaction.objectStore(PENDING_POSTS_STORE)
        const request = store.delete(id)

        request.onsuccess = () => {
          pendingPosts.value = pendingPosts.value.filter(p => p.id !== id)
          resolve()
        }

        request.onerror = () => {
          error.value = 'Failed to delete pending post'
          reject(request.error)
        }
      })
    } catch (err) {
      error.value = 'Failed to delete pending post'
      throw err
    }
  }

  // Clear all drafts
  const clearAllDrafts = async (): Promise<void> => {
    try {
      const database = db.value || await openDB()

      return new Promise((resolve, reject) => {
        const transaction = database.transaction([DRAFTS_STORE], 'readwrite')
        const store = transaction.objectStore(DRAFTS_STORE)
        const request = store.clear()

        request.onsuccess = () => {
          drafts.value = []
          resolve()
        }

        request.onerror = () => {
          error.value = 'Failed to clear drafts'
          reject(request.error)
        }
      })
    } catch (err) {
      error.value = 'Failed to clear drafts'
      throw err
    }
  }

  return {
    // State
    drafts,
    pendingPosts,
    loading,
    error,

    // Draft operations
    saveDraft,
    updateDraft,
    getDraft,
    getAllDrafts,
    deleteDraft,
    clearAllDrafts,

    // Pending post operations
    savePendingPost,
    getAllPendingPosts,
    deletePendingPost
  }
}
