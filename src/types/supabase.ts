// Supabase Database type definitions matching the MuralMap schema

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_id: string | null
          email: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          clerk_id?: string | null
          email: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          clerk_id?: string | null
          email?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          image_url: string
          title: string | null
          description: string | null
          artist: string | null
          lat: number | null
          lng: number | null
          city: string | null
          visibility: 'public' | 'friends'
          edited_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          title?: string | null
          description?: string | null
          artist?: string | null
          lat?: number | null
          lng?: number | null
          city?: string | null
          visibility?: 'public' | 'friends'
          edited_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          title?: string | null
          description?: string | null
          artist?: string | null
          lat?: number | null
          lng?: number | null
          city?: string | null
          visibility?: 'public' | 'friends'
          edited_at?: string | null
          created_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          description: string | null
          cover_image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          description?: string | null
          cover_image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string
          description?: string | null
          cover_image_url?: string | null
          created_at?: string
        }
      }
      collection_posts: {
        Row: {
          collection_id: string
          post_id: string
          position: number
          added_at: string
        }
        Insert: {
          collection_id: string
          post_id: string
          position?: number
          added_at?: string
        }
        Update: {
          collection_id?: string
          post_id?: string
          position?: number
          added_at?: string
        }
      }
      favorites: {
        Row: {
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          body: string
          edited: boolean
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          body: string
          edited?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          body?: string
          edited?: boolean
          created_at?: string
        }
      }
      comment_reactions: {
        Row: {
          id: string
          comment_id: string
          user_id: string
          emoji: string
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          user_id: string
          emoji: string
          created_at?: string
        }
        Update: {
          id?: string
          comment_id?: string
          user_id?: string
          emoji?: string
          created_at?: string
        }
      }
      friends: {
        Row: {
          requester_id: string
          addressee_id: string
          status: 'pending' | 'accepted' | 'declined'
          created_at: string
        }
        Insert: {
          requester_id: string
          addressee_id: string
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
        }
        Update: {
          requester_id?: string
          addressee_id?: string
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          label: string
        }
        Insert: {
          id?: string
          label: string
        }
        Update: {
          id?: string
          label?: string
        }
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          actor_id: string | null
          type: 'like' | 'comment' | 'mention' | 'friend_request' | 'friend_accepted'
          reference_id: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          actor_id?: string | null
          type: 'like' | 'comment' | 'mention' | 'friend_request' | 'friend_accepted'
          reference_id?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          actor_id?: string | null
          type?: 'like' | 'comment' | 'mention' | 'friend_request' | 'friend_accepted'
          reference_id?: string | null
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clerk_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
  }
}
