import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { Friend, User, FriendStatus } from '@/types'

interface FriendWithUser extends Omit<Friend, 'requester' | 'addressee'> {
  user: User
}

export const useFriendsStore = defineStore('friends', () => {
  const friends = ref<FriendWithUser[]>([])
  const requests = ref<FriendWithUser[]>([])
  const sentRequests = ref<FriendWithUser[]>([])
  const loading = ref(false)

  // Fetch friends (accepted)
  const fetchFriends = async (userId: string) => {
    try {
      loading.value = true

      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          requester:users!friends_requester_id_fkey(id, username, display_name, avatar_url, bio),
          addressee:users!friends_addressee_id_fkey(id, username, display_name, avatar_url, bio)
        `)
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform to include the other user
      friends.value = (data || []).map((friend: any) => ({
        requester_id: friend.requester_id,
        addressee_id: friend.addressee_id,
        status: friend.status,
        created_at: friend.created_at,
        user: friend.requester_id === userId ? friend.addressee : friend.requester
      }))

    } catch (error) {
      console.error('Error fetching friends:', error)
    } finally {
      loading.value = false
    }
  }

  // Fetch incoming requests
  const fetchRequests = async (userId: string) => {
    try {
      loading.value = true

      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          requester:users!friends_requester_id_fkey(id, username, display_name, avatar_url, bio)
        `)
        .eq('addressee_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      requests.value = (data || []).map((friend: any) => ({
        requester_id: friend.requester_id,
        addressee_id: friend.addressee_id,
        status: friend.status,
        created_at: friend.created_at,
        user: friend.requester
      }))

    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      loading.value = false
    }
  }

  // Fetch sent requests
  const fetchSentRequests = async (userId: string) => {
    try {
      loading.value = true

      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          addressee:users!friends_addressee_id_fkey(id, username, display_name, avatar_url, bio)
        `)
        .eq('requester_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      sentRequests.value = (data || []).map((friend: any) => ({
        requester_id: friend.requester_id,
        addressee_id: friend.addressee_id,
        status: friend.status,
        created_at: friend.created_at,
        user: friend.addressee
      }))

    } catch (error) {
      console.error('Error fetching sent requests:', error)
    } finally {
      loading.value = false
    }
  }

  // Send friend request
  const sendRequest = async (requesterId: string, addresseeId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .insert({
          requester_id: requesterId,
          addressee_id: addresseeId,
          status: 'pending'
        })

      if (error) throw error

      // Refresh sent requests
      await fetchSentRequests(requesterId)

    } catch (error) {
      console.error('Error sending friend request:', error)
      throw error
    }
  }

  // Accept friend request
  const acceptRequest = async (requesterId: string, addresseeId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('requester_id', requesterId)
        .eq('addressee_id', addresseeId)

      if (error) throw error

      // Refresh lists
      await Promise.all([
        fetchRequests(addresseeId),
        fetchFriends(addresseeId)
      ])

    } catch (error) {
      console.error('Error accepting friend request:', error)
      throw error
    }
  }

  // Decline friend request
  const declineRequest = async (requesterId: string, addresseeId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'declined' })
        .eq('requester_id', requesterId)
        .eq('addressee_id', addresseeId)

      if (error) throw error

      // Refresh requests
      await fetchRequests(addresseeId)

    } catch (error) {
      console.error('Error declining friend request:', error)
      throw error
    }
  }

  // Cancel sent request
  const cancelRequest = async (requesterId: string, addresseeId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('requester_id', requesterId)
        .eq('addressee_id', addresseeId)
        .eq('status', 'pending')

      if (error) throw error

      // Refresh sent requests
      await fetchSentRequests(requesterId)

    } catch (error) {
      console.error('Error canceling friend request:', error)
      throw error
    }
  }

  // Remove friend
  const removeFriend = async (userId: string, friendId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(requester_id.eq.${userId},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${userId})`)
        .eq('status', 'accepted')

      if (error) throw error

      // Refresh friends
      await fetchFriends(userId)

    } catch (error) {
      console.error('Error removing friend:', error)
      throw error
    }
  }

  // Check if users are friends
  const areFriends = async (userId1: string, userId2: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('status')
        .or(`and(requester_id.eq.${userId1},addressee_id.eq.${userId2}),and(requester_id.eq.${userId2},addressee_id.eq.${userId1})`)
        .eq('status', 'accepted')
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error

      return !!data

    } catch (error) {
      console.error('Error checking friendship:', error)
      return false
    }
  }

  return {
    friends,
    requests,
    sentRequests,
    loading,
    fetchFriends,
    fetchRequests,
    fetchSentRequests,
    sendRequest,
    acceptRequest,
    declineRequest,
    cancelRequest,
    removeFriend,
    areFriends
  }
})
