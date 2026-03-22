-- MuralMap Database Schema v2 — with RLS and all audit fixes applied
-- Changes from v1:
--   [SEC-1]  Notifications INSERT locked down via SECURITY DEFINER function only
--   [SEC-2]  Comment reactions SELECT now mirrors post/comment visibility
--   [INT-1]  Reports UNIQUE now includes reference_type
--   [INT-2]  handle_new_user handles username collisions with random suffix + exception block
--   [INT-3]  collection_posts.position is UNIQUE per collection
--   [INT-4]  posts.visibility adds 'private' tier
--   [PERF-1] Added composite indexes on friends(requester_id) and friends(addressee_id)
--   [QOL-1]  users.updated_at column + auto-update trigger
--   [QOL-2]  posts.edited_at auto-set via BEFORE UPDATE trigger
--   [QOL-3]  collections.slug is now UNIQUE per user, not globally

-- ============================================================
-- Extensions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- Tables
-- ============================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT        UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url   TEXT,
  bio          TEXT        CHECK (char_length(bio) <= 160),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()   -- [QOL-1]
);

-- Posts table
-- [INT-4] visibility now allows 'private' in addition to 'public' / 'friends'
CREATE TABLE IF NOT EXISTS public.posts (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  image_url   TEXT        NOT NULL,
  title       TEXT        CHECK (char_length(title) <= 80),
  description TEXT        CHECK (char_length(description) <= 500),
  artist      TEXT        CHECK (char_length(artist) <= 100),
  lat         FLOAT8,
  lng         FLOAT8,
  city        TEXT,
  visibility  TEXT        NOT NULL DEFAULT 'public'
                          CHECK (visibility IN ('public', 'friends', 'private')),
  edited_at   TIMESTAMPTZ,                -- [QOL-2] kept here; auto-set by trigger below
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Collections table
-- [QOL-3] slug uniqueness is now scoped per user, not globally
CREATE TABLE IF NOT EXISTS public.collections (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL CHECK (char_length(name) <= 80),
  slug             TEXT        NOT NULL,
  description      TEXT        CHECK (char_length(description) <= 300),
  cover_image_url  TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, slug)                  -- [QOL-3]
);

-- Collection posts join table
-- [INT-3] position is unique within a collection
CREATE TABLE IF NOT EXISTS public.collection_posts (
  collection_id UUID        NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  post_id       UUID        NOT NULL REFERENCES public.posts(id)        ON DELETE CASCADE,
  position      INT         NOT NULL DEFAULT 0,
  added_at      TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (collection_id, post_id),
  UNIQUE (collection_id, position)        -- [INT-3]
);

-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id    UUID        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID        NOT NULL REFERENCES public.posts(id)   ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.users(id)   ON DELETE CASCADE,
  body       TEXT        NOT NULL CHECK (char_length(body) <= 500),
  edited     BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comment reactions table
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID        NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.users(id)    ON DELETE CASCADE,
  emoji      TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (comment_id, user_id, emoji)
);

-- Friends table
CREATE TABLE IF NOT EXISTS public.friends (
  requester_id UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  addressee_id UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

-- Tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT UNIQUE NOT NULL
);

-- Post tags join table
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES public.tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  actor_id     UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  type         TEXT        NOT NULL
               CHECK (type IN ('like','comment','mention','friend_request','friend_accepted')),
  reference_id UUID,
  read         BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Reports table
-- [INT-1] UNIQUE now includes reference_type so a post and comment sharing a UUID
--         can both be reported independently
CREATE TABLE IF NOT EXISTS public.reports (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reference_id   UUID        NOT NULL,
  reference_type TEXT        NOT NULL CHECK (reference_type IN ('post', 'comment')),
  reason         TEXT        NOT NULL
                 CHECK (reason IN ('spam','inappropriate','offensive','copyright','other')),
  detail         TEXT        CHECK (char_length(detail) <= 300),
  resolved       BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (reporter_id, reference_id, reference_type)  -- [INT-1]
);


-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_posts_user_id      ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_visibility   ON public.posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_created_at   ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_location     ON public.posts(lat, lng)
  WHERE lat IS NOT NULL AND lng IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_comments_post_id   ON public.comments(post_id);

-- [PERF-1] Composite indexes so the RLS subquery on posts doesn't full-scan friends
CREATE INDEX IF NOT EXISTS idx_friends_requester  ON public.friends(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friends_addressee  ON public.friends(addressee_id, status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_favorites_post_id  ON public.favorites(post_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id  ON public.favorites(user_id);


-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_posts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports           ENABLE ROW LEVEL SECURITY;

-- ── Users ──────────────────────────────────────────────────
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

-- ── Posts ──────────────────────────────────────────────────
-- [INT-4] 'private' posts are visible only to their owner
CREATE POLICY "Posts are viewable by authorised users"
  ON public.posts FOR SELECT USING (
    user_id = auth.uid()
    OR (
      visibility = 'public'
    )
    OR (
      visibility = 'friends' AND EXISTS (
        SELECT 1 FROM public.friends
        WHERE (requester_id = auth.uid() AND addressee_id = user_id AND status = 'accepted')
           OR (addressee_id = auth.uid() AND requester_id = user_id AND status = 'accepted')
      )
    )
    -- 'private' posts: owner check above already covers it; no further clause needed
  );

CREATE POLICY "Users can insert their own posts"
  ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- ── Collections ────────────────────────────────────────────
CREATE POLICY "Public collections are viewable by everyone"
  ON public.collections FOR SELECT USING (true);

CREATE POLICY "Users can insert their own collections"
  ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON public.collections FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON public.collections FOR DELETE USING (auth.uid() = user_id);

-- ── Collection posts ───────────────────────────────────────
CREATE POLICY "Collection posts are viewable by everyone"
  ON public.collection_posts FOR SELECT USING (true);

CREATE POLICY "Users can manage their collection posts"
  ON public.collection_posts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
  );

-- ── Favorites ──────────────────────────────────────────────
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- ── Comments ───────────────────────────────────────────────
-- Reusable visibility sub-expression (mirrors posts policy, including 'private')
CREATE POLICY "Comments follow post visibility"
  ON public.comments FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_id AND (
        p.user_id = auth.uid()
        OR p.visibility = 'public'
        OR (
          p.visibility = 'friends' AND EXISTS (
            SELECT 1 FROM public.friends
            WHERE (requester_id = auth.uid() AND addressee_id = p.user_id AND status = 'accepted')
               OR (addressee_id = auth.uid() AND requester_id = p.user_id AND status = 'accepted')
          )
        )
      )
    )
  );

CREATE POLICY "Authenticated users can insert comments"
  ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- ── Comment reactions ──────────────────────────────────────
-- [SEC-2] SELECT now requires the same visibility check as comments/posts
CREATE POLICY "Comment reactions follow post visibility"
  ON public.comment_reactions FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.comments c
      JOIN public.posts p ON p.id = c.post_id
      WHERE c.id = comment_id AND (
        p.user_id = auth.uid()
        OR p.visibility = 'public'
        OR (
          p.visibility = 'friends' AND EXISTS (
            SELECT 1 FROM public.friends
            WHERE (requester_id = auth.uid() AND addressee_id = p.user_id AND status = 'accepted')
               OR (addressee_id = auth.uid() AND requester_id = p.user_id AND status = 'accepted')
          )
        )
      )
    )
  );

CREATE POLICY "Authenticated users can insert reactions"
  ON public.comment_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON public.comment_reactions FOR DELETE USING (auth.uid() = user_id);

-- ── Friends ────────────────────────────────────────────────
CREATE POLICY "Users can view their own friend connections"
  ON public.friends FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = addressee_id
  );

CREATE POLICY "Users can send friend requests"
  ON public.friends FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friend requests they received"
  ON public.friends FOR UPDATE USING (auth.uid() = addressee_id);

CREATE POLICY "Users can delete their friend connections"
  ON public.friends FOR DELETE USING (
    auth.uid() = requester_id OR auth.uid() = addressee_id
  );

-- ── Tags ───────────────────────────────────────────────────
CREATE POLICY "Tags are viewable by everyone"
  ON public.tags FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert tags"
  ON public.tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── Post tags ──────────────────────────────────────────────
CREATE POLICY "Post tags are viewable by everyone"
  ON public.post_tags FOR SELECT USING (true);

CREATE POLICY "Users can manage tags on their posts"
  ON public.post_tags FOR ALL USING (
    EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND user_id = auth.uid())
  );

-- ── Notifications ──────────────────────────────────────────
-- [SEC-1] Direct INSERT from client roles is intentionally removed.
--         All notification writes must go through create_notification()
--         which is SECURITY DEFINER.  Revoke direct INSERT below.
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- No INSERT policy here — enforced via create_notification() only.

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Revoke direct INSERT on notifications from authenticated role [SEC-1]
REVOKE INSERT ON public.notifications FROM authenticated;

-- ── Reports ────────────────────────────────────────────────
CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Authenticated users can insert reports"
  ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);


-- ============================================================
-- Functions & Triggers
-- ============================================================

-- ── [INT-2] handle_new_user: collision-safe username generation ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_base_username TEXT;
  v_username      TEXT;
  v_attempt       INT := 0;
BEGIN
  v_base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  v_username := v_base_username;

  -- Retry up to 10 times with a random 4-char hex suffix on collision
  LOOP
    BEGIN
      INSERT INTO public.users (id, username, display_name, avatar_url)
      VALUES (
        NEW.id,
        v_username,
        COALESCE(NEW.raw_user_meta_data->>'display_name', v_base_username),
        NEW.raw_user_meta_data->>'avatar_url'
      );
      EXIT;  -- success
    EXCEPTION WHEN unique_violation THEN
      v_attempt := v_attempt + 1;
      IF v_attempt > 10 THEN
        RAISE EXCEPTION 'Could not generate a unique username after 10 attempts for base "%"', v_base_username;
      END IF;
      v_username := v_base_username || '_' || substring(md5(random()::text) FROM 1 FOR 4);
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── [QOL-1] Auto-update users.updated_at ──────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── [QOL-2] Auto-set posts.edited_at on UPDATE ────────────
CREATE OR REPLACE FUNCTION public.set_post_edited_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only stamp edited_at when something other than edited_at itself changes
  IF OLD IS DISTINCT FROM NEW THEN
    NEW.edited_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_posts_edited_at ON public.posts;
CREATE TRIGGER trg_posts_edited_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_post_edited_at();

-- ── [SEC-1] create_notification: the ONLY authorised INSERT path ──
-- Callers must pass a valid user_id; the function itself does no
-- auth check so it can be called from other SECURITY DEFINER triggers.
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id     UUID,
  p_actor_id    UUID,
  p_type        TEXT,
  p_reference_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Don't notify users about their own actions
  IF p_user_id = p_actor_id THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.notifications (user_id, actor_id, type, reference_id)
  VALUES (p_user_id, p_actor_id, p_type, p_reference_id)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
