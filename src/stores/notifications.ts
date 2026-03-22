import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const loading = ref(false)
  const hasMore = ref(true)
  const limit = 20

  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  // Fetch notifications
  const fetchNotifications = async (userId: string, reset = true) => {
    try {
      loading.value = true

      if (reset) {
        notifications.value = []
        hasMore.value = true
      }

      const from = reset ? 0 : notifications.value.length

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:users!notifications_actor_id_fkey(id, username, display_name, avatar_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1)

      if (error) throw error

      const newNotifications = data || []

      if (reset) {
        notifications.value = newNotifications
      } else {
        notifications.value.push(...newNotifications)
      }

      hasMore.value = newNotifications.length === limit

    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      loading.value = false
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }

    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  // Mark all as read
  const markAllAsRead = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) throw error

      // Update local state
      notifications.value.forEach(n => {
        n.read = true
      })

    } catch (error) {
      console.error('Error marking all as read:', error)
      throw error
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      // Remove from local state
      notifications.value = notifications.value.filter(n => n.id !== notificationId)

    } catch (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  }

  // Create notification (helper for other stores to use)
  const createNotification = async (
    userId: string,
    actorId: string | null,
    type: Notification['type'],
    referenceId: string | null = null
  ) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          actor_id: actorId,
          type,
          reference_id: referenceId,
          read: false
        })

      if (error) throw error

    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  // Subscribe to realtime notifications
  const subscribeToNotifications = (userId: string) => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          // Fetch the complete notification with actor info
          const { data } = await supabase
            .from('notifications')
            .select(`
              *,
              actor:users!notifications_actor_id_fkey(id, username, display_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            notifications.value.unshift(data)
          }
        }
      )
      .subscribe()

    return channel
  }

  // Unsubscribe from realtime
  const unsubscribe = (channel: any) => {
    if (channel) {
      supabase.removeChannel(channel)
    }
  }

  return {
    notifications,
    loading,
    hasMore,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    subscribeToNotifications,
    unsubscribe
  }
})
