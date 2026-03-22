import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { Comment, CommentReaction } from '@/types'

export const useCommentsStore = defineStore('comments', () => {
  const comments = ref<Comment[]>([])
  const loading = ref(false)
  const hasMore = ref(true)
  const limit = 20

  // Fetch comments for a post
  const fetchComments = async (postId: string, reset = true) => {
    try {
      loading.value = true

      if (reset) {
        comments.value = []
        hasMore.value = true
      }

      const from = reset ? 0 : comments.value.length

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users!comments_user_id_fkey(id, username, display_name, avatar_url),
          reactions:comment_reactions(id, user_id, emoji)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1)

      if (error) throw error

      const newComments = (data || []).map((comment: any) => ({
        ...comment,
        reactions: comment.reactions || []
      }))

      if (reset) {
        comments.value = newComments
      } else {
        comments.value.push(...newComments)
      }

      hasMore.value = newComments.length === limit

    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      loading.value = false
    }
  }

  // Create comment
  const createComment = async (postId: string, userId: string, body: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          body,
          edited: false
        })
        .select(`
          *,
          user:users!comments_user_id_fkey(id, username, display_name, avatar_url)
        `)
        .single()

      if (error) throw error

      // Add to beginning of list
      if (data) {
        comments.value.unshift({
          ...data,
          reactions: []
        })
      }

      return data

    } catch (error) {
      console.error('Error creating comment:', error)
      throw error
    }
  }

  // Update comment
  const updateComment = async (commentId: string, body: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({
          body,
          edited: true
        })
        .eq('id', commentId)
        .select(`
          *,
          user:users!comments_user_id_fkey(id, username, display_name, avatar_url),
          reactions:comment_reactions(id, user_id, emoji)
        `)
        .single()

      if (error) throw error

      // Update in list
      const index = comments.value.findIndex(c => c.id === commentId)
      if (index > -1 && data) {
        comments.value[index] = {
          ...data,
          reactions: data.reactions || []
        }
      }

      return data

    } catch (error) {
      console.error('Error updating comment:', error)
      throw error
    }
  }

  // Delete comment
  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      // Remove from list
      comments.value = comments.value.filter(c => c.id !== commentId)

    } catch (error) {
      console.error('Error deleting comment:', error)
      throw error
    }
  }

  // Toggle reaction on comment
  const toggleReaction = async (commentId: string, userId: string, emoji: string) => {
    try {
      const comment = comments.value.find(c => c.id === commentId)
      if (!comment) return

      // Check if user already reacted with this emoji
      const existingReaction = comment.reactions?.find(
        r => r.user_id === userId && r.emoji === emoji
      )

      if (existingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('comment_reactions')
          .delete()
          .eq('id', existingReaction.id)

        if (error) throw error

        // Update local state
        comment.reactions = comment.reactions?.filter(r => r.id !== existingReaction.id) || []

      } else {
        // Add reaction
        const { data, error } = await supabase
          .from('comment_reactions')
          .insert({
            comment_id: commentId,
            user_id: userId,
            emoji
          })
          .select()
          .single()

        if (error) throw error

        // Update local state
        if (data && comment.reactions) {
          comment.reactions.push(data)
        }
      }

    } catch (error) {
      console.error('Error toggling reaction:', error)
      throw error
    }
  }

  // Get reaction counts for a comment
  const getReactionCounts = (commentId: string): Record<string, number> => {
    const comment = comments.value.find(c => c.id === commentId)
    if (!comment || !comment.reactions) return {}

    const counts: Record<string, number> = {}
    comment.reactions.forEach(r => {
      counts[r.emoji] = (counts[r.emoji] || 0) + 1
    })
    return counts
  }

  // Check if user reacted to comment
  const hasUserReacted = (commentId: string, userId: string, emoji: string): boolean => {
    const comment = comments.value.find(c => c.id === commentId)
    if (!comment || !comment.reactions) return false

    return comment.reactions.some(r => r.user_id === userId && r.emoji === emoji)
  }

  return {
    comments,
    loading,
    hasMore,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    toggleReaction,
    getReactionCounts,
    hasUserReacted
  }
})
