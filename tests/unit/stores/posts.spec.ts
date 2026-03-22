import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePostsStore } from '@/stores/posts'

// Hoisted so the reference is available when vi.mock factory runs
const mockSupabase = vi.hoisted(() => ({
  auth: {},
  from: vi.fn(),
  storage: { from: vi.fn() },
  channel: vi.fn(),
  removeChannel: vi.fn(),
}))

// Mock the Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}))

describe('Posts Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const postsStore = usePostsStore()

      expect(postsStore.posts).toEqual([])
      expect(postsStore.loading).toBe(false)
      expect(postsStore.error).toBeNull()
      expect(postsStore.hasMore).toBe(true)
    })
  })

  describe('fetchPosts', () => {
    it('should fetch posts successfully', async () => {
      const postsStore = usePostsStore()

      const mockPosts = [
        {
          id: 'post-1',
          title: 'Test Post 1',
          user: { id: 'user-1', username: 'testuser' },
          tags: [{ tag: { id: 'tag-1', label: 'art' } }],
          favorites_count: [{ count: 5 }],
          comments_count: [{ count: 3 }],
          created_at: new Date().toISOString()
        },
        {
          id: 'post-2',
          title: 'Test Post 2',
          user: { id: 'user-2', username: 'anotheruser' },
          tags: [],
          favorites_count: [{ count: 2 }],
          comments_count: [{ count: 1 }],
          created_at: new Date().toISOString()
        }
      ]

      // Mock the query chain
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({
              data: mockPosts,
              error: null
            }))
          }))
        }))
      })

      await postsStore.fetchPosts()

      expect(postsStore.posts).toHaveLength(2)
      expect(postsStore.posts[0].id).toBe('post-1')
      expect(postsStore.posts[0].favorites_count).toBe(5)
      expect(postsStore.posts[0].comments_count).toBe(3)
      expect(postsStore.posts[0].tags).toEqual([{ id: 'tag-1', label: 'art' }])
      expect(postsStore.loading).toBe(false)
      expect(postsStore.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      const postsStore = usePostsStore()

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database error' }
            }))
          }))
        }))
      })

      await postsStore.fetchPosts()

      expect(postsStore.posts).toEqual([])
      expect(postsStore.error).toBe('Database error')
      expect(postsStore.loading).toBe(false)
    })

    it('should filter by visibility', async () => {
      const postsStore = usePostsStore()

      const mockQuery = {
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({
                data: [],
                error: null
              }))
            }))
          }))
        }))
      }

      mockSupabase.from.mockReturnValueOnce(mockQuery)

      await postsStore.fetchPosts({ visibility: 'public' })

      expect(mockSupabase.from).toHaveBeenCalledWith('posts')
    })

    it('should filter by userId', async () => {
      const postsStore = usePostsStore()

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({
                data: [],
                error: null
              }))
            }))
          }))
        }))
      })

      await postsStore.fetchPosts({ userId: 'user-123' })

      expect(mockSupabase.from).toHaveBeenCalledWith('posts')
    })

    it('should handle pagination correctly', async () => {
      const postsStore = usePostsStore()

      // First page
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({
              data: Array(20).fill({ id: 'post', tags: [], favorites_count: [{ count: 0 }], comments_count: [{ count: 0 }] }),
              error: null
            }))
          }))
        }))
      })

      await postsStore.fetchPosts()
      expect(postsStore.posts).toHaveLength(20)
      expect(postsStore.hasMore).toBe(true) // Exactly page-size returned — may be more

      // Second page
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({
              data: Array(10).fill({ id: 'post', tags: [], favorites_count: [{ count: 0 }], comments_count: [{ count: 0 }] }),
              error: null
            }))
          }))
        }))
      })

      await postsStore.fetchPosts()
      expect(postsStore.posts).toHaveLength(30)
    })

    it('should reset posts when reset option is true', async () => {
      const postsStore = usePostsStore()

      // Add some posts first
      postsStore.posts = [{ id: 'old-post' } as any]

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({
              data: [{ id: 'new-post', tags: [], favorites_count: [{ count: 0 }], comments_count: [{ count: 0 }] }],
              error: null
            }))
          }))
        }))
      })

      await postsStore.fetchPosts({ reset: true })

      expect(postsStore.posts).toHaveLength(1)
      expect(postsStore.posts[0].id).toBe('new-post')
    })

    it('should set loading state during fetch', async () => {
      const postsStore = usePostsStore()

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => new Promise(resolve => {
              // Check loading state before resolving
              expect(postsStore.loading).toBe(true)
              setTimeout(() => resolve({ data: [], error: null }), 10)
            }))
          }))
        }))
      })

      const promise = postsStore.fetchPosts()
      expect(postsStore.loading).toBe(true)

      await promise
      expect(postsStore.loading).toBe(false)
    })
  })

  describe('getPostById', () => {
    it('should fetch a single post by id', async () => {
      const postsStore = usePostsStore()

      const mockPost = {
        id: 'post-123',
        title: 'Specific Post',
        user: { id: 'user-1', username: 'testuser' },
        tags: [{ tag: { id: 'tag-1', label: 'mural' } }],
        favorites_count: [{ count: 10 }],
        comments_count: [{ count: 5 }],
        created_at: new Date().toISOString()
      }

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockPost,
              error: null
            }))
          }))
        }))
      })

      const post = await postsStore.getPostById('post-123')

      expect(post).toBeTruthy()
      expect(post?.id).toBe('post-123')
      expect(post?.favorites_count).toBe(10)
      expect(post?.tags).toEqual([{ id: 'tag-1', label: 'mural' }])
    })

    it('should return null when post not found', async () => {
      const postsStore = usePostsStore()

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Not found' }
            }))
          }))
        }))
      })

      const post = await postsStore.getPostById('nonexistent')

      expect(post).toBeNull()
    })
  })

  describe('toggleFavorite', () => {
    it('should add favorite when not already favorited', async () => {
      const postsStore = usePostsStore()

      postsStore.posts = [
        { id: 'post-1', favorites_count: 5, is_favorited: false } as any
      ]

      // Mock check for existing favorite - none found
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: null,
                error: null
              }))
            }))
          }))
        }))
      })

      // Mock insert favorite
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => Promise.resolve({
          error: null
        }))
      })

      await postsStore.toggleFavorite('post-1', 'user-1')

      expect(postsStore.posts[0].favorites_count).toBe(6)
      expect(postsStore.posts[0].is_favorited).toBe(true)
    })

    it('should remove favorite when already favorited', async () => {
      const postsStore = usePostsStore()

      postsStore.posts = [
        { id: 'post-1', favorites_count: 5, is_favorited: true } as any
      ]

      // Mock check for existing favorite - found
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: { id: 'favorite-1' },
                error: null
              }))
            }))
          }))
        }))
      })

      // Mock delete favorite
      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({
              error: null
            }))
          }))
        }))
      })

      await postsStore.toggleFavorite('post-1', 'user-1')

      expect(postsStore.posts[0].favorites_count).toBe(4)
      expect(postsStore.posts[0].is_favorited).toBe(false)
    })

    it('should handle toggle favorite errors', async () => {
      const postsStore = usePostsStore()

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: null,
                error: { message: 'Database error' }
              }))
            }))
          }))
        }))
      })

      await expect(postsStore.toggleFavorite('post-1', 'user-1')).rejects.toThrow()
    })
  })

  describe('deletePost', () => {
    it('should delete post successfully', async () => {
      const postsStore = usePostsStore()

      postsStore.posts = [
        { id: 'post-1', title: 'Post 1' } as any,
        { id: 'post-2', title: 'Post 2' } as any,
        { id: 'post-3', title: 'Post 3' } as any
      ]

      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            error: null
          }))
        }))
      })

      await postsStore.deletePost('post-2')

      expect(postsStore.posts).toHaveLength(2)
      expect(postsStore.posts.find(p => p.id === 'post-2')).toBeUndefined()
      expect(postsStore.posts.find(p => p.id === 'post-1')).toBeTruthy()
      expect(postsStore.posts.find(p => p.id === 'post-3')).toBeTruthy()
    })

    it('should handle delete errors', async () => {
      const postsStore = usePostsStore()

      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            error: { message: 'Delete failed' }
          }))
        }))
      })

      await expect(postsStore.deletePost('post-1')).rejects.toThrow()
    })
  })

  describe('fetchTrendingPosts', () => {
    it('should calculate trending scores correctly', async () => {
      const postsStore = usePostsStore()

      const now = new Date()
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const mockPosts = [
        {
          id: 'post-1',
          title: 'Recent popular post',
          created_at: twoHoursAgo.toISOString(),
          visibility: 'public',
          favorites: Array(10).fill({ created_at: now.toISOString() }),
          comments: Array(5).fill({ created_at: now.toISOString() }),
          tags: [],
          user: { id: 'user-1', username: 'user1' }
        },
        {
          id: 'post-2',
          title: 'Older post',
          created_at: oneDayAgo.toISOString(),
          visibility: 'public',
          favorites: Array(10).fill({ created_at: now.toISOString() }),
          comments: Array(5).fill({ created_at: now.toISOString() }),
          tags: [],
          user: { id: 'user-2', username: 'user2' }
        }
      ]

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => Promise.resolve({
              data: mockPosts,
              error: null
            }))
          }))
        }))
      })

      const trending = await postsStore.fetchTrendingPosts(10)

      expect(trending).toHaveLength(2)
      // Recent post should rank higher
      expect(trending[0].id).toBe('post-1')
      expect(trending[0].favorites_count).toBe(10)
      expect(trending[0].comments_count).toBe(5)
      expect(trending[0].trending_score).toBeGreaterThan(trending[1].trending_score)
    })

    it('should limit trending posts to specified number', async () => {
      const postsStore = usePostsStore()

      const mockPosts = Array(20).fill(null).map((_, i) => ({
        id: `post-${i}`,
        title: `Post ${i}`,
        created_at: new Date().toISOString(),
        visibility: 'public',
        favorites: [],
        comments: [],
        tags: [],
        user: { id: 'user-1', username: 'user1' }
      }))

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => Promise.resolve({
              data: mockPosts,
              error: null
            }))
          }))
        }))
      })

      const trending = await postsStore.fetchTrendingPosts(5)

      expect(trending).toHaveLength(5)
    })

    it('should only include public posts', async () => {
      const postsStore = usePostsStore()

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn((field: string, value: string) => {
            expect(field).toBe('visibility')
            expect(value).toBe('public')
            return {
              gte: vi.fn(() => Promise.resolve({
                data: [],
                error: null
              }))
            }
          })
        }))
      })

      await postsStore.fetchTrendingPosts()
    })

    it('should handle trending fetch errors', async () => {
      const postsStore = usePostsStore()

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Fetch failed' }
            }))
          }))
        }))
      })

      const trending = await postsStore.fetchTrendingPosts()

      expect(trending).toEqual([])
      expect(postsStore.error).toBe('Fetch failed')
    })

    it('should set loading state during trending fetch', async () => {
      const postsStore = usePostsStore()

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => new Promise(resolve => {
              expect(postsStore.loading).toBe(true)
              setTimeout(() => resolve({ data: [], error: null }), 10)
            }))
          }))
        }))
      })

      const promise = postsStore.fetchTrendingPosts()
      expect(postsStore.loading).toBe(true)

      await promise
      expect(postsStore.loading).toBe(false)
    })
  })

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      const postsStore = usePostsStore()

      // Modify state
      postsStore.posts = [{ id: 'post-1' } as any]
      postsStore.loading = true
      postsStore.error = 'Some error'
      postsStore.hasMore = false

      // Reset
      postsStore.reset()

      expect(postsStore.posts).toEqual([])
      expect(postsStore.loading).toBe(false)
      expect(postsStore.error).toBeNull()
      expect(postsStore.hasMore).toBe(true)
    })
  })
})
