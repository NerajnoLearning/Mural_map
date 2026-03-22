# Supabase Backend

## Overview
Supabase is an open-source Firebase alternative providing PostgreSQL database, authentication, storage, and real-time subscriptions. MuralMap uses Supabase as its complete backend solution.

---

## Features Used in MuralMap

### 1. Authentication
### 2. Database (PostgreSQL)
### 3. Storage (File Uploads)
### 4. Realtime Subscriptions
### 5. Row Level Security (RLS)

---

## 1. Authentication

### Setup (`src/lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Auth Store (`src/stores/auth.ts`)

**Sign Up:**
```typescript
const signUp = async (email: string, password: string, displayName: string) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  })

  if (authError) throw authError

  // Create user profile
  const { error: profileError } = await supabase
    .from('users')
    .insert([{
      id: authData.user!.id,
      email: authData.user!.email,
      display_name: displayName
    }])

  if (profileError) throw profileError

  user.value = {
    id: authData.user!.id,
    email: authData.user!.email!,
    display_name: displayName
  }
}
```

**Sign In:**
```typescript
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error

  // Fetch full user profile
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single()

  user.value = userData
}
```

**Sign Out:**
```typescript
const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error

  user.value = null
  router.push('/auth/signin')
}
```

**Session Persistence:**
```typescript
const initAuth = async () => {
  const { data } = await supabase.auth.getSession()

  if (data.session) {
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.session.user.id)
      .single()

    user.value = userData
  }

  // Listen for auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      loadUserProfile(session.user.id)
    } else {
      user.value = null
    }
  })
}
```

---

## 2. Database Operations

### Basic CRUD

**Create (Insert):**
```typescript
const createPost = async (post: CreatePostForm) => {
  const { data, error } = await supabase
    .from('posts')
    .insert([{
      user_id: authStore.user!.id,
      title: post.title,
      description: post.description,
      artist: post.artist,
      location: post.location,
      city: post.city,
      country: post.country,
      latitude: post.latitude,
      longitude: post.longitude,
      image_url: post.image_url,
      visibility: post.visibility
    }])
    .select()
    .single()

  if (error) throw error
  return data
}
```

**Read (Select):**
```typescript
// Simple select
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('visibility', 'public')
  .order('created_at', { ascending: false })
  .limit(20)

// With relations
const { data, error } = await supabase
  .from('posts')
  .select(`
    *,
    user:users!posts_user_id_fkey(id, display_name, avatar_url),
    favorites:favorites(user_id),
    comments:comments(count)
  `)
  .eq('id', postId)
  .single()
```

**Update:**
```typescript
const updatePost = async (id: string, updates: Partial<Post>) => {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
```

**Delete:**
```typescript
const deletePost = async (id: string) => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) throw error
}
```

### Advanced Queries

**Filtering:**
```typescript
// Multiple conditions
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('visibility', 'public')
  .gte('created_at', sevenDaysAgo)
  .order('created_at', { ascending: false })

// Text search
const { data } = await supabase
  .from('posts')
  .select('*')
  .or(`title.ilike.%${query}%,description.ilike.%${query}%,artist.ilike.%${query}%`)

// In array
const { data } = await supabase
  .from('posts')
  .select('*')
  .in('id', [id1, id2, id3])
```

**Geospatial Queries (PostGIS):**
```typescript
// Find posts within radius
const { data } = await supabase
  .rpc('nearby_posts', {
    lat: userLatitude,
    long: userLongitude,
    radius_km: 10
  })

// PostgreSQL function:
// CREATE OR REPLACE FUNCTION nearby_posts(lat float, long float, radius_km float)
// RETURNS SETOF posts AS $$
//   SELECT *
//   FROM posts
//   WHERE ST_DWithin(
//     ST_MakePoint(longitude, latitude)::geography,
//     ST_MakePoint(long, lat)::geography,
//     radius_km * 1000
//   )
// $$ LANGUAGE sql;
```

**Aggregations:**
```typescript
// Count posts by user
const { data, count } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })
  .eq('user_id', userId)

// Count with filters
const { count } = await supabase
  .from('favorites')
  .select('*', { count: 'exact', head: true })
  .eq('post_id', postId)
```

**Pagination:**
```typescript
const POSTS_PER_PAGE = 20

const fetchPosts = async (page: number = 1) => {
  const from = (page - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

---

## 3. Storage (File Uploads)

### Image Upload

```typescript
const uploadImage = async (file: File): Promise<string> => {
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `posts/${fileName}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}
```

### Image Deletion

```typescript
const deleteImage = async (imageUrl: string) => {
  // Extract path from URL
  const path = imageUrl.split('/storage/v1/object/public/images/')[1]

  const { error } = await supabase.storage
    .from('images')
    .remove([path])

  if (error) throw error
}
```

### Storage Bucket Setup

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Set up RLS policies for storage
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 4. Realtime Subscriptions

### Notifications Subscription

```typescript
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
        // Fetch full notification with relations
        const { data } = await supabase
          .from('notifications')
          .select(`
            *,
            actor:users!notifications_actor_id_fkey(id, display_name, avatar_url),
            post:posts(id, title, image_url)
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

// Cleanup
onUnmounted(() => {
  supabase.removeChannel(channel)
})
```

### Comments Realtime

```typescript
const subscribeToComments = (postId: string) => {
  return supabase
    .channel(`comments:${postId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`
      },
      async (payload) => {
        const { data } = await supabase
          .from('comments')
          .select('*, user:users(*)')
          .eq('id', payload.new.id)
          .single()

        if (data) {
          comments.value.push(data)
        }
      }
    )
    .subscribe()
}
```

---

## 5. Row Level Security (RLS)

### Posts Table Policies

```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view public posts
CREATE POLICY "Public posts are viewable by everyone"
ON posts FOR SELECT
USING (visibility = 'public');

-- Users can view their own posts
CREATE POLICY "Users can view own posts"
ON posts FOR SELECT
USING (auth.uid() = user_id);

-- Friends can view friends-only posts
CREATE POLICY "Friends can view friends-only posts"
ON posts FOR SELECT
USING (
  visibility = 'friends' AND
  EXISTS (
    SELECT 1 FROM friends
    WHERE (user_id = auth.uid() AND friend_id = posts.user_id)
       OR (friend_id = auth.uid() AND user_id = posts.user_id)
  )
);

-- Users can insert their own posts
CREATE POLICY "Users can insert own posts"
ON posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
USING (auth.uid() = user_id);
```

### Comments Policies

```sql
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments on public posts
CREATE POLICY "Comments on public posts are viewable"
ON comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = comments.post_id
    AND posts.visibility = 'public'
  )
);

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can comment"
ON comments FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Users can delete own comments
CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE
USING (auth.uid() = user_id);
```

---

## Database Schema

### Posts Table

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  artist TEXT,
  location TEXT NOT NULL,
  city TEXT,
  country TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  image_url TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_location ON posts USING GIST(ST_MakePoint(longitude, latitude));
```

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Favorites Table

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_post_id ON favorites(post_id);
```

### Comments Table

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
```

---

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Best Practices

### ✅ Do:
- Use RLS policies for security
- Create indexes for frequently queried columns
- Use `.select()` to only fetch needed columns
- Handle errors gracefully
- Use `.single()` when expecting one result
- Clean up realtime subscriptions
- Use foreign keys for referential integrity

### ❌ Don't:
- Expose service role key in client
- Fetch more data than needed
- Forget to enable RLS
- Ignore Supabase errors
- Create N+1 query problems
- Use `SELECT *` in production

---

## Common Patterns

### Check if User Favorited Post

```typescript
const checkIfFavorited = async (postId: string, userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  return !!data
}
```

### Get Posts with Favorite Status

```typescript
const fetchPostsWithFavorites = async (userId: string) => {
  const { data } = await supabase
    .from('posts')
    .select(`
      *,
      user:users(*),
      is_favorited:favorites!left(user_id)
    `)
    .eq('visibility', 'public')
    .eq('favorites.user_id', userId)

  return data
}
```

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS Documentation](https://postgis.net/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## Impact on MuralMap

### Backend Simplicity
- No custom server needed
- Built-in authentication
- Real-time out of the box
- Automatic API generation

### Security
- RLS policies protect data
- JWT-based authentication
- Encrypted connections
- Fine-grained access control

### Scalability
- Auto-scaling infrastructure
- CDN for storage
- Connection pooling
- Built-in caching
