// Database types matching Supabase schema

export type PostVisibility = 'public' | 'friends'
export type FriendStatus = 'pending' | 'accepted' | 'declined'
export type NotificationType = 'like' | 'comment' | 'mention' | 'friend_request' | 'friend_accepted'
export type ReportReason = 'spam' | 'inappropriate' | 'offensive' | 'copyright' | 'other'
export type ReferenceType = 'post' | 'comment'

export interface User {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

// Extended user profile with stats
export interface UserProfile extends User {
  posts_count?: number
  favorites_count?: number
  friends_count?: number
  is_friend?: boolean
  friend_status?: FriendStatus | null
}

export interface Post {
  id: string
  user_id: string
  image_url: string
  title: string | null
  description: string | null
  artist: string | null
  lat: number | null
  lng: number | null
  city: string | null
  visibility: PostVisibility
  edited_at: string | null
  created_at: string
  // Relations
  user?: User
  tags?: Tag[]
  favorites_count?: number
  comments_count?: number
  is_favorited?: boolean
}

export interface Collection {
  id: string
  user_id: string
  name: string
  slug: string
  description: string | null
  cover_image_url: string | null
  created_at: string
  // Relations
  user?: User
  posts_count?: number
}

export interface CollectionPost {
  collection_id: string
  post_id: string
  position: number
  added_at: string
}

export interface Favorite {
  user_id: string
  post_id: string
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  body: string
  edited: boolean
  created_at: string
  // Relations
  user?: User
  reactions?: CommentReaction[]
}

export interface CommentReaction {
  id: string
  comment_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface Friend {
  requester_id: string
  addressee_id: string
  status: FriendStatus
  created_at: string
  // Relations
  requester?: User
  addressee?: User
}

export interface Tag {
  id: string
  label: string
}

export interface PostTag {
  post_id: string
  tag_id: string
}

export interface Notification {
  id: string
  user_id: string
  actor_id: string | null
  type: NotificationType
  reference_id: string | null
  read: boolean
  created_at: string
  // Relations
  actor?: User
}

export interface Report {
  id: string
  reporter_id: string
  reference_id: string
  reference_type: ReferenceType
  reason: ReportReason
  detail: string | null
  resolved: boolean
  created_at: string
}

// Client-side only (IndexedDB)
export interface Draft {
  id: string
  user_id: string
  image_blob: Blob
  title: string | null
  description: string | null
  artist: string | null
  tags: string[]
  lat: number | null
  lng: number | null
  visibility: PostVisibility
  created_at: string
}
