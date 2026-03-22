import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { UserProfile, Post, FriendStatus } from '@/types'

export const useUsersStore = defineStore('users', () => {
  const profiles = ref<Map<string, UserProfile>>(new Map())
  const searchResults = ref<UserProfile[]>([])
  const loading = ref(false)
  const searchLoading = ref(false)

  // Get user profile by username
  const getProfile = async (username: string): Promise<UserProfile | null> => {
    try {
      loading.value = true

      // Check cache first
      const cached = Array.from(profiles.value.values()).find(
        p => p.username === username
      )
      if (cached) return cached

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (error) throw error
      if (!data) return null

      // Get stats
      const [postsCount, favoritesCount, friendsCount] = await Promise.all([
        supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', data.id)
          .then(res => res.count || 0),
        supabase
          .from('favorites')
          .select('post_id', { count: 'exact', head: true })
          .eq('user_id', data.id)
          .then(res => res.count || 0),
        supabase
          .from('friends')
          .select('requester_id', { count: 'exact', head: true })
          .or(`requester_id.eq.${data.id},addressee_id.eq.${data.id}`)
          .eq('status', 'accepted')
          .then(res => res.count || 0)
      ])

      const profile: UserProfile = {
        ...data,
        posts_count: postsCount,
        favorites_count: favoritesCount,
        friends_count: friendsCount
      }

      profiles.value.set(data.id, profile)
      return profile

    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // Get user's posts
  const getUserPosts = async (userId: string, currentUserId?: string): Promise<Post[]> => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          user:users!posts_user_id_fkey(id, username, display_name, avatar_url),
          tags:post_tags(tag:tags(id, label))
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      if (!data) return []

      // Transform data
      const posts: Post[] = await Promise.all(
        data.map(async (post: any) => {
          // Get aggregated counts
          const [favoritesCount, commentsCount, isFavorited] = await Promise.all([
            supabase
              .from('favorites')
              .select('user_id', { count: 'exact', head: true })
              .eq('post_id', post.id)
              .then(res => res.count || 0),
            supabase
              .from('comments')
              .select('id', { count: 'exact', head: true })
              .eq('post_id', post.id)
              .then(res => res.count || 0),
            currentUserId
              ? supabase
                  .from('favorites')
                  .select('post_id')
                  .eq('post_id', post.id)
                  .eq('user_id', currentUserId)
                  .single()
                  .then(res => !!res.data)
              : Promise.resolve(false)
          ])

          return {
            ...post,
            tags: post.tags?.map((pt: any) => pt.tag).filter(Boolean) || [],
            favorites_count: favoritesCount,
            comments_count: commentsCount,
            is_favorited: isFavorited
          }
        })
      )

      return posts

    } catch (error) {
      console.error('Error fetching user posts:', error)
      return []
    }
  }

  // Search users
  const searchUsers = async (query: string): Promise<UserProfile[]> => {
    if (!query.trim()) {
      searchResults.value = []
      return []
    }

    try {
      searchLoading.value = true

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(20)

      if (error) throw error
      if (!data) return []

      searchResults.value = data
      return data

    } catch (error) {
      console.error('Error searching users:', error)
      return []
    } finally {
      searchLoading.value = false
    }
  }

  // Check friend status
  const getFriendStatus = async (
    currentUserId: string,
    targetUserId: string
  ): Promise<{ isFriend: boolean; status: FriendStatus | null }> => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('status')
        .or(
          `and(requester_id.eq.${currentUserId},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${currentUserId})`
        )
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (!data) {
        return { isFriend: false, status: null }
      }

      return {
        isFriend: data.status === 'accepted',
        status: data.status
      }

    } catch (error) {
      console.error('Error checking friend status:', error)
      return { isFriend: false, status: null }
    }
  }

  // Clear cache
  const clearCache = () => {
    profiles.value.clear()
    searchResults.value = []
  }

  return {
    profiles,
    searchResults,
    loading,
    searchLoading,
    getProfile,
    getUserPosts,
    searchUsers,
    getFriendStatus,
    clearCache
  }
})
