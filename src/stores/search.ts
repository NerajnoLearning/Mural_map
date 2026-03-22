import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { UserProfile, Post, Tag } from '@/types'

export interface SearchResults {
  users: UserProfile[]
  posts: Post[]
  tags: Tag[]
}

export const useSearchStore = defineStore('search', () => {
  const results = ref<SearchResults>({
    users: [],
    posts: [],
    tags: []
  })
  const loading = ref(false)
  const query = ref('')

  // Global search across users, posts, and tags
  const search = async (searchQuery: string, currentUserId?: string) => {
    if (!searchQuery.trim()) {
      results.value = { users: [], posts: [], tags: [] }
      query.value = ''
      return
    }

    query.value = searchQuery
    loading.value = true

    try {
      // Search users
      const usersPromise = supabase
        .from('users')
        .select('*')
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .limit(10)

      // Search posts
      const postsPromise = supabase
        .from('posts')
        .select(`
          *,
          user:users!posts_user_id_fkey(id, username, display_name, avatar_url),
          tags:post_tags(tag:tags(id, label))
        `)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,artist.ilike.%${searchQuery}%`)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20)

      // Search tags
      const tagsPromise = supabase
        .from('tags')
        .select('*')
        .ilike('label', `%${searchQuery}%`)
        .limit(10)

      const [usersRes, postsRes, tagsRes] = await Promise.all([
        usersPromise,
        postsPromise,
        tagsPromise
      ])

      // Process users
      results.value.users = usersRes.data || []

      // Process posts with engagement data
      if (postsRes.data) {
        results.value.posts = await Promise.all(
          postsRes.data.map(async (post: any) => {
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
      } else {
        results.value.posts = []
      }

      // Process tags
      results.value.tags = tagsRes.data || []

    } catch (error) {
      console.error('Error searching:', error)
      results.value = { users: [], posts: [], tags: [] }
    } finally {
      loading.value = false
    }
  }

  // Search by specific tag
  const searchByTag = async (tagLabel: string, currentUserId?: string) => {
    loading.value = true

    try {
      // Get tag ID first
      const { data: tag } = await supabase
        .from('tags')
        .select('id')
        .eq('label', tagLabel)
        .single()

      if (!tag) {
        results.value.posts = []
        return
      }

      // Get posts with this tag
      const { data: postTags } = await supabase
        .from('post_tags')
        .select(`
          post:posts(
            *,
            user:users!posts_user_id_fkey(id, username, display_name, avatar_url),
            tags:post_tags(tag:tags(id, label))
          )
        `)
        .eq('tag_id', tag.id)

      if (!postTags) {
        results.value.posts = []
        return
      }

      // Process posts
      const posts = await Promise.all(
        postTags
          .filter((pt: any) => pt.post && pt.post.visibility === 'public')
          .map(async (pt: any) => {
            const post = pt.post

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

      results.value.posts = posts
      results.value.users = []
      results.value.tags = []

    } catch (error) {
      console.error('Error searching by tag:', error)
      results.value.posts = []
    } finally {
      loading.value = false
    }
  }

  // Clear search results
  const clear = () => {
    results.value = { users: [], posts: [], tags: [] }
    query.value = ''
  }

  return {
    results,
    loading,
    query,
    search,
    searchByTag,
    clear
  }
})
