import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { User, Post } from '@/types'

export interface ActivityItem {
  id: string
  type: 'post_created' | 'post_liked' | 'comment_added' | 'friend_added'
  user: User
  post?: Post
  target_user?: User
  created_at: string
}

export const useActivityStore = defineStore('activity', () => {
  const activities = ref<ActivityItem[]>([])
  const loading = ref(false)
  const hasMore = ref(true)
  const limit = 20

  // Fetch activity feed for friends
  const fetchFriendActivity = async (userId: string, reset = true) => {
    try {
      loading.value = true

      if (reset) {
        activities.value = []
        hasMore.value = true
      }

      const from = reset ? 0 : activities.value.length

      // Get user's friends
      const { data: friendships } = await supabase
        .from('friends')
        .select('user_id, friend_id')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)

      if (!friendships || friendships.length === 0) {
        hasMore.value = false
        return
      }

      // Extract friend IDs
      const friendIds = friendships.map(f =>
        f.user_id === userId ? f.friend_id : f.user_id
      )

      const activityItems: ActivityItem[] = []

      // Fetch recent posts from friends
      const { data: posts } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(id, username, display_name, avatar_url),
          tags:post_tags(tag:tags(id, label))
        `)
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1)

      if (posts) {
        posts.forEach((post: any) => {
          activityItems.push({
            id: `post-${post.id}`,
            type: 'post_created',
            user: post.user,
            post: {
              ...post,
              tags: post.tags?.map((pt: any) => pt.tag) || []
            },
            created_at: post.created_at
          })
        })
      }

      // Fetch recent favorites from friends
      const { data: favorites } = await supabase
        .from('favorites')
        .select(`
          *,
          user:users!favorites_user_id_fkey(id, username, display_name, avatar_url),
          post:posts(
            *,
            user:users!posts_user_id_fkey(id, username, display_name, avatar_url),
            tags:post_tags(tag:tags(id, label))
          )
        `)
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (favorites) {
        favorites.forEach((fav: any) => {
          if (fav.post && fav.user) {
            activityItems.push({
              id: `like-${fav.id}`,
              type: 'post_liked',
              user: fav.user,
              post: {
                ...fav.post,
                user: fav.post.user,
                tags: fav.post.tags?.map((pt: any) => pt.tag) || []
              },
              created_at: fav.created_at
            })
          }
        })
      }

      // Fetch recent comments from friends
      const { data: comments } = await supabase
        .from('comments')
        .select(`
          *,
          user:users!comments_user_id_fkey(id, username, display_name, avatar_url),
          post:posts(
            *,
            user:users!posts_user_id_fkey(id, username, display_name, avatar_url),
            tags:post_tags(tag:tags(id, label))
          )
        `)
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (comments) {
        comments.forEach((comment: any) => {
          if (comment.post && comment.user) {
            activityItems.push({
              id: `comment-${comment.id}`,
              type: 'comment_added',
              user: comment.user,
              post: {
                ...comment.post,
                user: comment.post.user,
                tags: comment.post.tags?.map((pt: any) => pt.tag) || []
              },
              created_at: comment.created_at
            })
          }
        })
      }

      // Fetch recent friend additions
      const { data: newFriends } = await supabase
        .from('friends')
        .select(`
          *,
          user1:users!friends_user_id_fkey(id, username, display_name, avatar_url),
          user2:users!friends_friend_id_fkey(id, username, display_name, avatar_url)
        `)
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (newFriends) {
        newFriends.forEach((friendship: any) => {
          if (friendship.user1 && friendship.user2) {
            activityItems.push({
              id: `friend-${friendship.id}`,
              type: 'friend_added',
              user: friendship.user1,
              target_user: friendship.user2,
              created_at: friendship.created_at
            })
          }
        })
      }

      // Sort all activities by created_at
      const sortedActivities = activityItems.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      // Append to existing or replace
      if (reset) {
        activities.value = sortedActivities.slice(0, limit)
      } else {
        activities.value.push(...sortedActivities.slice(0, limit))
      }

      hasMore.value = sortedActivities.length === limit

    } catch (error) {
      console.error('Error fetching activity:', error)
    } finally {
      loading.value = false
    }
  }

  // Clear activity
  const clear = () => {
    activities.value = []
    hasMore.value = true
  }

  return {
    activities,
    loading,
    hasMore,
    fetchFriendActivity,
    clear
  }
})
