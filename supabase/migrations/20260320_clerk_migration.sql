-- MuralMap - Clerk Migration
-- This migration updates the database schema to work with Clerk authentication
-- Run this in Supabase SQL Editor after setting up Clerk

-- Step 1: Drop old Supabase auth dependencies
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Add clerk_id column to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;

-- Step 3: Add updated_at column if not exists
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Step 4: Create index for fast clerk_id lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_id);

-- Step 5: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Create helper function to get Clerk user ID from JWT
CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS TEXT AS $$
BEGIN
  -- Extract Clerk user ID from JWT 'sub' claim
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Update RLS policies for users table
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (clerk_id = public.clerk_user_id());

DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
CREATE POLICY "Users are viewable by everyone"
ON public.users FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
ON public.users FOR INSERT
WITH CHECK (clerk_id = public.clerk_user_id());

-- Step 8: Update RLS policies for posts table
-- Posts are associated with users via user_id (UUID)
-- We need to check that the post's user has the matching clerk_id

DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
CREATE POLICY "Users can insert their own posts"
ON public.posts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = user_id
    AND users.clerk_id = public.clerk_user_id()
  )
);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts"
ON public.posts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = user_id
    AND users.clerk_id = public.clerk_user_id()
  )
);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts"
ON public.posts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = user_id
    AND users.clerk_id = public.clerk_user_id()
  )
);

-- Keep public posts viewable by everyone
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
CREATE POLICY "Public posts are viewable by everyone"
ON public.posts FOR SELECT
USING (
  visibility = 'public' OR
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = posts.user_id
    AND users.clerk_id = public.clerk_user_id()
  ) OR
  (visibility = 'friends' AND EXISTS (
    SELECT 1 FROM public.friends
    JOIN public.users u1 ON u1.id = friends.requester_id
    JOIN public.users u2 ON u2.id = friends.addressee_id
    WHERE friends.status = 'accepted'
    AND (
      (u1.clerk_id = public.clerk_user_id() AND u2.id = posts.user_id) OR
      (u2.clerk_id = public.clerk_user_id() AND u1.id = posts.user_id)
    )
  ))
);

-- Step 9: Update collections policies
DROP POLICY IF EXISTS "Users can insert their own collections" ON public.collections;
CREATE POLICY "Users can insert their own collections"
ON public.collections FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = user_id
    AND users.clerk_id = public.clerk_user_id()
  )
);

DROP POLICY IF EXISTS "Users can update their own collections" ON public.collections;
CREATE POLICY "Users can update their own collections"
ON public.collections FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = user_id
    AND users.clerk_id = public.clerk_user_id()
  )
);

DROP POLICY IF EXISTS "Users can delete their own collections" ON public.collections;
CREATE POLICY "Users can delete their own collections"
ON public.collections FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = user_id
    AND users.clerk_id = public.clerk_user_id()
  )
);

-- Step 10: Update favorites policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
CREATE POLICY "Users can view their own favorites"
ON public.favorites FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = favorites.user_id
    AND users.clerk_id = public.clerk_user_id()
  )
);

DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
CREATE POLICY "Users can insert their own favorites"
ON public.favorites FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = user_id
    AND users.clerk_id = public.clerk_user_id()
  )
);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
CREATE POLICY "Users can delete their own favorites"
ON public.favorites FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = favorites.user_id
    AND users.clerk_id = public.clerk_user_id()
  )
);

-- Step 11: Update comments policies
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
CREATE POLICY "Users can insert their own comments"
ON public.comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = user_id
    AND users.clerk_id = public.clerk_user_id()
  )
);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
CREATE POLICY "Users can update their own comments"
ON public.comments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = comments.user_id
    AND users.clerk_id = public.clerk_user_id()
  )
);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = comments.user_id
    AND users.clerk_id = public.clerk_user_id()
  )
);

-- Step 12: Update friends policies
DROP POLICY IF EXISTS "Users can send friend requests" ON public.friends;
CREATE POLICY "Users can send friend requests"
ON public.friends FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = requester_id
    AND users.clerk_id = public.clerk_user_id()
  )
);

DROP POLICY IF EXISTS "Users can update friend requests they received" ON public.friends;
CREATE POLICY "Users can update friend requests they received"
ON public.friends FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = addressee_id
    AND users.clerk_id = public.clerk_user_id()
  )
);

DROP POLICY IF EXISTS "Users can delete their friend connections" ON public.friends;
CREATE POLICY "Users can delete their friend connections"
ON public.friends FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users u1
    WHERE (u1.id = requester_id OR u1.id = addressee_id)
    AND u1.clerk_id = public.clerk_user_id()
  )
);

-- Step 13: Update notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = notifications.user_id
    AND users.clerk_id = public.clerk_user_id()
  )
);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = notifications.user_id
    AND users.clerk_id = public.clerk_user_id()
  )
);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = notifications.user_id
    AND users.clerk_id = public.clerk_user_id()
  )
);

-- Migration complete!
-- Remember to:
-- 1. Set up Clerk JWT template in Clerk Dashboard (select "Supabase" template)
-- 2. Configure webhook endpoint to sync users from Clerk to Supabase
-- 3. Test authentication flow end-to-end
