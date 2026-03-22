import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { Collection, Post, CollectionPost } from '@/types'

interface CollectionWithPosts extends Collection {
  posts?: Post[]
}

export const useCollectionsStore = defineStore('collections', () => {
  const collections = ref<Collection[]>([])
  const currentCollection = ref<CollectionWithPosts | null>(null)
  const loading = ref(false)
  const hasMore = ref(true)
  const limit = 20

  // Fetch user's collections
  const fetchCollections = async (userId: string, reset = true) => {
    try {
      loading.value = true

      if (reset) {
        collections.value = []
        hasMore.value = true
      }

      const from = reset ? 0 : collections.value.length

      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          user:users!collections_user_id_fkey(id, username, display_name, avatar_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1)

      if (error) throw error

      // Get posts count for each collection
      const collectionsWithCounts = await Promise.all(
        (data || []).map(async (collection: any) => {
          const { count } = await supabase
            .from('collection_posts')
            .select('post_id', { count: 'exact', head: true })
            .eq('collection_id', collection.id)

          return {
            ...collection,
            posts_count: count || 0
          }
        })
      )

      if (reset) {
        collections.value = collectionsWithCounts
      } else {
        collections.value.push(...collectionsWithCounts)
      }

      hasMore.value = (data || []).length === limit

    } catch (error) {
      console.error('Error fetching collections:', error)
    } finally {
      loading.value = false
    }
  }

  // Get collection by ID or slug
  const getCollection = async (identifier: string, currentUserId?: string) => {
    try {
      loading.value = true

      // Try by ID first, then by slug
      let query = supabase
        .from('collections')
        .select(`
          *,
          user:users!collections_user_id_fkey(id, username, display_name, avatar_url)
        `)

      // Check if identifier is UUID
      if (identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        query = query.eq('id', identifier)
      } else {
        query = query.eq('slug', identifier)
      }

      const { data: collection, error } = await query.single()

      if (error) throw error
      if (!collection) return null

      // Get posts in collection
      const { data: collectionPosts, error: postsError } = await supabase
        .from('collection_posts')
        .select(`
          position,
          post:posts(
            *,
            user:users!posts_user_id_fkey(id, username, display_name, avatar_url),
            tags:post_tags(tag:tags(id, label))
          )
        `)
        .eq('collection_id', collection.id)
        .order('position', { ascending: true })

      if (postsError) throw postsError

      // Transform posts with engagement data
      const posts = await Promise.all(
        (collectionPosts || []).map(async (cp: any) => {
          const post = cp.post

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

      currentCollection.value = {
        ...collection,
        posts,
        posts_count: posts.length
      }

      return currentCollection.value

    } catch (error) {
      console.error('Error fetching collection:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // Create collection
  const createCollection = async (
    userId: string,
    name: string,
    description: string | null = null,
    coverImageUrl: string | null = null
  ) => {
    try {
      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const { data, error } = await supabase
        .from('collections')
        .insert({
          user_id: userId,
          name,
          slug,
          description,
          cover_image_url: coverImageUrl
        })
        .select(`
          *,
          user:users!collections_user_id_fkey(id, username, display_name, avatar_url)
        `)
        .single()

      if (error) throw error

      if (data) {
        collections.value.unshift({
          ...data,
          posts_count: 0
        })
      }

      return data

    } catch (error) {
      console.error('Error creating collection:', error)
      throw error
    }
  }

  // Update collection
  const updateCollection = async (
    collectionId: string,
    updates: {
      name?: string
      description?: string | null
      cover_image_url?: string | null
    }
  ) => {
    try {
      // If name changed, update slug
      const finalUpdates: any = { ...updates }
      if (updates.name) {
        finalUpdates.slug = updates.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      }

      const { data, error } = await supabase
        .from('collections')
        .update(finalUpdates)
        .eq('id', collectionId)
        .select(`
          *,
          user:users!collections_user_id_fkey(id, username, display_name, avatar_url)
        `)
        .single()

      if (error) throw error

      // Update in list
      const index = collections.value.findIndex(c => c.id === collectionId)
      if (index > -1 && data) {
        collections.value[index] = {
          ...data,
          posts_count: collections.value[index].posts_count
        }
      }

      // Update current collection
      if (currentCollection.value?.id === collectionId && data) {
        currentCollection.value = {
          ...currentCollection.value,
          ...data
        }
      }

      return data

    } catch (error) {
      console.error('Error updating collection:', error)
      throw error
    }
  }

  // Delete collection
  const deleteCollection = async (collectionId: string) => {
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId)

      if (error) throw error

      // Remove from list
      collections.value = collections.value.filter(c => c.id !== collectionId)

      // Clear current if deleted
      if (currentCollection.value?.id === collectionId) {
        currentCollection.value = null
      }

    } catch (error) {
      console.error('Error deleting collection:', error)
      throw error
    }
  }

  // Add post to collection
  const addPostToCollection = async (collectionId: string, postId: string) => {
    try {
      // Get current max position
      const { data: existing, error: fetchError } = await supabase
        .from('collection_posts')
        .select('position')
        .eq('collection_id', collectionId)
        .order('position', { ascending: false })
        .limit(1)

      if (fetchError) throw fetchError

      const position = existing && existing.length > 0 ? existing[0].position + 1 : 0

      const { error } = await supabase
        .from('collection_posts')
        .insert({
          collection_id: collectionId,
          post_id: postId,
          position
        })

      if (error) throw error

      // Update posts count
      const index = collections.value.findIndex(c => c.id === collectionId)
      if (index > -1) {
        collections.value[index].posts_count = (collections.value[index].posts_count || 0) + 1
      }

    } catch (error) {
      console.error('Error adding post to collection:', error)
      throw error
    }
  }

  // Remove post from collection
  const removePostFromCollection = async (collectionId: string, postId: string) => {
    try {
      const { error } = await supabase
        .from('collection_posts')
        .delete()
        .eq('collection_id', collectionId)
        .eq('post_id', postId)

      if (error) throw error

      // Update posts count
      const index = collections.value.findIndex(c => c.id === collectionId)
      if (index > -1) {
        collections.value[index].posts_count = Math.max(0, (collections.value[index].posts_count || 1) - 1)
      }

      // Remove from current collection posts
      if (currentCollection.value?.id === collectionId && currentCollection.value.posts) {
        currentCollection.value.posts = currentCollection.value.posts.filter(p => p.id !== postId)
        currentCollection.value.posts_count = (currentCollection.value.posts_count || 1) - 1
      }

    } catch (error) {
      console.error('Error removing post from collection:', error)
      throw error
    }
  }

  // Reorder posts in collection
  const reorderPosts = async (collectionId: string, postIds: string[]) => {
    try {
      // Update positions for all posts
      const updates = postIds.map((postId, index) => ({
        collection_id: collectionId,
        post_id: postId,
        position: index
      }))

      // Delete existing and insert new positions
      const { error: deleteError } = await supabase
        .from('collection_posts')
        .delete()
        .eq('collection_id', collectionId)

      if (deleteError) throw deleteError

      const { error: insertError } = await supabase
        .from('collection_posts')
        .insert(updates)

      if (insertError) throw insertError

      // Update current collection order
      if (currentCollection.value?.id === collectionId && currentCollection.value.posts) {
        const orderedPosts = postIds
          .map(id => currentCollection.value!.posts!.find(p => p.id === id))
          .filter(Boolean) as Post[]
        currentCollection.value.posts = orderedPosts
      }

    } catch (error) {
      console.error('Error reordering posts:', error)
      throw error
    }
  }

  // Check if post is in collection
  const isPostInCollection = async (collectionId: string, postId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('collection_posts')
        .select('post_id')
        .eq('collection_id', collectionId)
        .eq('post_id', postId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return !!data

    } catch (error) {
      console.error('Error checking collection membership:', error)
      return false
    }
  }

  return {
    collections,
    currentCollection,
    loading,
    hasMore,
    fetchCollections,
    getCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    addPostToCollection,
    removePostFromCollection,
    reorderPosts,
    isPostInCollection
  }
})
