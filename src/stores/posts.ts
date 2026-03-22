import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/types'
import { createLogger } from '@/utils/logger'
import { retrySupabaseQuery } from '@/utils/retry'

const logger = createLogger('PostsStore')

export const usePostsStore = defineStore('posts', () => {
  // State
  const posts = ref<Post[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hasMore = ref(true)
  const currentPage = ref(0)
  const postsPerPage = 20

  // Actions
  const fetchPosts = async (options: {
    reset?: boolean
    visibility?: 'public' | 'friends' | 'all'
    userId?: string
  } = {}) => {
    const { reset = false, visibility = 'all', userId } = options

    if (reset) {
      posts.value = []
      currentPage.value = 0
      hasMore.value = true
    }

    if (!hasMore.value) return

    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          user:users(id, username, display_name, avatar_url),
          tags:post_tags(tag:tags(id, label)),
          favorites_count:favorites(count),
          comments_count:comments(count)
        `)
        .order('created_at', { ascending: false })
        .range(
          currentPage.value * postsPerPage,
          (currentPage.value + 1) * postsPerPage - 1
        )

      // Filter by visibility
      if (visibility === 'public') {
        query = query.eq('visibility', 'public')
      } else if (visibility === 'friends') {
        query = query.eq('visibility', 'friends')
      }

      // Filter by user
      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error: fetchError } = await retrySupabaseQuery(() => query)

      if (fetchError) throw fetchError

      if (data) {
        // Transform data to match Post type
        const transformedPosts = data.map((post: any) => ({
          ...post,
          tags: post.tags?.map((pt: any) => pt.tag) || [],
          favorites_count: post.favorites_count?.[0]?.count || 0,
          comments_count: post.comments_count?.[0]?.count || 0
        }))

        posts.value = [...posts.value, ...transformedPosts]
        currentPage.value++

        // Check if there are more posts
        if (data.length < postsPerPage) {
          hasMore.value = false
        }
      }
    } catch (err) {
      error.value = (err as Error).message
      logger.error('Error fetching posts:', err)
    } finally {
      loading.value = false
    }
  }

  const getPostById = async (id: string): Promise<Post | null> => {
    try {
      const { data, error: fetchError } = await retrySupabaseQuery(() =>
        supabase
          .from('posts')
          .select(`
            *,
            user:users(id, username, display_name, avatar_url),
            tags:post_tags(tag:tags(id, label)),
            favorites_count:favorites(count),
            comments_count:comments(count)
          `)
          .eq('id', id)
          .single()
      )

      if (fetchError) throw fetchError

      if (data) {
        return {
          ...data,
          tags: data.tags?.map((pt: any) => pt.tag) || [],
          favorites_count: data.favorites_count?.[0]?.count || 0,
          comments_count: data.comments_count?.[0]?.count || 0
        }
      }

      return null
    } catch (err) {
      logger.error('Error fetching post:', err)
      return null
    }
  }

  const toggleFavorite = async (postId: string, userId: string) => {
    try {
      // Check if already favorited
      const { data: existing } = await supabase
        .from('favorites')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      if (existing) {
        // Remove favorite
        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)

        if (deleteError) throw deleteError

        // Update local state
        const post = posts.value.find(p => p.id === postId)
        if (post && post.favorites_count !== undefined) {
          post.favorites_count--
          post.is_favorited = false
        }
      } else {
        // Add favorite
        const { error: insertError } = await supabase
          .from('favorites')
          .insert({ post_id: postId, user_id: userId })

        if (insertError) throw insertError

        // Update local state
        const post = posts.value.find(p => p.id === postId)
        if (post) {
          post.favorites_count = (post.favorites_count || 0) + 1
          post.is_favorited = true
        }
      }
    } catch (err) {
      logger.error('Error toggling favorite:', err)
      throw err
    }
  }

  const deletePost = async (postId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (deleteError) throw deleteError

      // Remove from local state
      posts.value = posts.value.filter(p => p.id !== postId)
    } catch (err) {
      logger.error('Error deleting post:', err)
      throw err
    }
  }

  const fetchTrendingPosts = async (limit = 10): Promise<Post[]> => {
    try {
      loading.value = true
      error.value = null

      // Fetch posts from the last 7 days with engagement metrics
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data, error: fetchError } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(id, username, display_name, avatar_url),
          tags:post_tags(tag:tags(id, label)),
          favorites:favorites(created_at),
          comments:comments(created_at)
        `)
        .eq('visibility', 'public')
        .gte('created_at', sevenDaysAgo.toISOString())

      if (fetchError) throw fetchError

      if (!data) return []

      // Calculate trending score for each post
      const postsWithScores = data.map((post: any) => {
        const now = new Date().getTime()
        const postAge = now - new Date(post.created_at).getTime()
        const ageInHours = postAge / (1000 * 60 * 60)

        // Count engagements
        const favoritesCount = post.favorites?.length || 0
        const commentsCount = post.comments?.length || 0

        // Calculate trending score
        // Formula: (favorites * 2 + comments * 3) / (age_in_hours + 2)^1.5
        // Recent posts with more engagement score higher
        const engagementScore = (favoritesCount * 2) + (commentsCount * 3)
        const trendingScore = engagementScore / Math.pow(ageInHours + 2, 1.5)

        return {
          ...post,
          tags: post.tags?.map((pt: any) => pt.tag) || [],
          favorites_count: favoritesCount,
          comments_count: commentsCount,
          trending_score: trendingScore
        }
      })

      // Sort by trending score and return top posts
      const trending = postsWithScores
        .sort((a, b) => b.trending_score - a.trending_score)
        .slice(0, limit)

      return trending
    } catch (err) {
      error.value = (err as Error).message
      logger.error('Error fetching trending posts:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    posts.value = []
    loading.value = false
    error.value = null
    hasMore.value = true
    currentPage.value = 0
  }

  return {
    // State
    posts,
    loading,
    error,
    hasMore,
    // Actions
    fetchPosts,
    getPostById,
    toggleFavorite,
    deletePost,
    fetchTrendingPosts,
    reset
  }
})
