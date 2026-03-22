# Supabase Setup Guide for MuralMap

This guide will walk you through setting up Supabase for the MuralMap project from scratch.

---

## Prerequisites

- Supabase account ([sign up free](https://supabase.com))
- Your `.env` file with Supabase credentials already created

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `MuralMap` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient to start
4. Click **"Create new project"**
5. Wait 2-3 minutes for project setup to complete

---

## Step 2: Get Your API Credentials

1. Once project is created, go to **Settings** (gear icon) → **API**
2. Copy the following values to your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note**: You already have these in your `.env` file, so you can skip this if already done.

---

## Step 3: Run Database Migration

### Option A: Using Supabase Dashboard (Recommended for beginners)

1. In your Supabase project dashboard, click **SQL Editor** in the left sidebar
2. Click **"New Query"**
3. Open the file `supabase/migrations/20260319_init_schema.sql` from this project
4. Copy the **entire contents** of the file
5. Paste it into the SQL Editor
6. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)
7. Wait for success message: "Success. No rows returned"

### Option B: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

## Step 4: Verify Database Schema

1. In Supabase Dashboard, go to **Table Editor** (table icon in sidebar)
2. You should see these tables:
   - ✅ `users`
   - ✅ `posts`
   - ✅ `collections`
   - ✅ `collection_posts`
   - ✅ `favorites`
   - ✅ `comments`
   - ✅ `comment_reactions`
   - ✅ `friends`
   - ✅ `tags`
   - ✅ `post_tags`
   - ✅ `notifications`
   - ✅ `reports`

3. Click on each table to verify columns are created correctly

---

## Step 5: Enable Authentication Providers

### Email Authentication (Required)

1. Go to **Authentication** → **Providers** in the left sidebar
2. **Email** should be enabled by default
3. Scroll down to **Email Templates** and customize if desired:
   - Confirm signup
   - Reset password
   - Magic link

### OAuth Providers (Optional but Recommended)

#### Google OAuth

1. In **Authentication** → **Providers**, find **Google**
2. Toggle to **Enabled**
3. Follow Supabase instructions to create Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Set authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy **Client ID** and **Client Secret** into Supabase
5. Click **Save**

#### Apple OAuth (Optional)

1. Similar process as Google
2. Requires Apple Developer account ($99/year)
3. Follow Supabase guide for Apple OAuth setup

#### Phone/SMS Authentication (Optional)

1. Go to **Authentication** → **Providers** → **Phone**
2. Enable Phone provider
3. Configure SMS provider (Twilio recommended):
   - Sign up for [Twilio](https://www.twilio.com/)
   - Get phone number and API credentials
   - Add to Supabase Phone settings
4. Click **Save**

---

## Step 6: Create Storage Bucket for Images

1. Go to **Storage** in the left sidebar
2. Click **"New Bucket"**
3. Fill in bucket details:
   - **Name**: `images`
   - **Public bucket**: ✅ **Yes** (check this box)
   - **File size limit**: 50 MB (recommended)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`
4. Click **"Create Bucket"**

### Set up Storage Policies

1. Click on the `images` bucket
2. Go to **Policies** tab
3. Click **"New Policy"**

**Policy 1: Allow authenticated users to upload**
```sql
-- Policy name: Allow authenticated uploads
-- Allowed operation: INSERT
-- Target roles: authenticated

CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');
```

**Policy 2: Allow public read access**
```sql
-- Policy name: Public read access
-- Allowed operation: SELECT
-- Target roles: public

CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');
```

**Policy 3: Allow users to delete their own images**
```sql
-- Policy name: Users can delete own images
-- Allowed operation: DELETE
-- Target roles: authenticated

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

4. Click **"Review"** and **"Save Policy"** for each

---

## Step 7: Configure Row Level Security (RLS)

RLS is already enabled and configured in the migration file! You can verify:

1. Go to **Authentication** → **Policies**
2. Select any table (e.g., `posts`)
3. You should see policies like:
   - "Public posts are viewable by everyone"
   - "Users can insert their own posts"
   - "Users can update their own posts"
   - "Users can delete their own posts"

---

## Step 8: Test the Connection

1. Make sure your `.env` file has correct credentials
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173)
4. Try to sign up for a new account
5. Check if user appears in **Authentication** → **Users** in Supabase dashboard

---

## Step 9: Seed Initial Data (Optional)

You can add some test tags to make the app more useful:

1. Go to **SQL Editor**
2. Run this query:

```sql
-- Insert common tags
INSERT INTO public.tags (label) VALUES
  ('street-art'),
  ('graffiti'),
  ('mural'),
  ('abstract'),
  ('portrait'),
  ('landscape'),
  ('political'),
  ('nature'),
  ('typography'),
  ('3d-art'),
  ('stencil'),
  ('wheatpaste'),
  ('urban'),
  ('colorful'),
  ('monochrome')
ON CONFLICT (label) DO NOTHING;
```

---

## Step 10: Enable Realtime (for Notifications)

1. Go to **Database** → **Replication** in sidebar
2. Find the `notifications` table
3. Toggle **"Realtime"** to **ON**
4. Click **"Save"**

This enables live notifications in the app!

---

## Verification Checklist

Before moving on, verify everything is set up:

- [ ] Project created and active
- [ ] API credentials in `.env` file
- [ ] Database schema migration completed successfully
- [ ] All 12 tables visible in Table Editor
- [ ] Email authentication enabled
- [ ] (Optional) OAuth providers configured
- [ ] `images` storage bucket created and set to public
- [ ] Storage policies configured (upload, read, delete)
- [ ] RLS policies visible in Authentication → Policies
- [ ] App connects successfully (test by signing up)
- [ ] User profile created automatically in `users` table
- [ ] (Optional) Initial tags seeded

---

## Troubleshooting

### Error: "relation does not exist"
- Migration didn't run successfully
- Go to SQL Editor and run the migration again
- Check for error messages in red

### Error: "JWT expired" or "Invalid API key"
- Check `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after changing `.env`

### Error: "new row violates row-level security policy"
- RLS policies not set up correctly
- Verify policies in Authentication → Policies
- Re-run migration if policies are missing

### Images not uploading
- Check storage bucket is set to **Public**
- Verify storage policies are created
- Check file size is under 50MB
- Verify MIME type is allowed (jpeg, jpg, png, webp)

### User profile not created after signup
- Check trigger exists: Go to **Database** → **Triggers**
- Should see `on_auth_user_created` trigger on `auth.users` table
- Re-run migration if missing

### Realtime notifications not working
- Enable Realtime on `notifications` table
- Check Supabase client subscription in browser console
- Verify you're authenticated

---

## Next Steps

Once Supabase is set up:

1. ✅ Start building features
2. ✅ Test authentication flows
3. ✅ Upload test murals
4. ✅ Test friend connections
5. ✅ Try posting comments and likes

---

## Security Best Practices

### DO:
- ✅ Keep `.env` file private (already in `.gitignore`)
- ✅ Use Row Level Security on all tables
- ✅ Validate input on client and server side
- ✅ Use Supabase Storage policies to restrict uploads

### DON'T:
- ❌ Commit `.env` to git
- ❌ Share your `service_role` key publicly (only use in server-side code)
- ❌ Disable RLS without good reason
- ❌ Allow unauthenticated uploads to storage

---

## Useful Supabase Dashboard Links

- **Table Editor**: View and edit data
- **SQL Editor**: Run custom queries
- **Authentication**: Manage users and providers
- **Storage**: Manage file uploads
- **Database → Policies**: View RLS policies
- **Database → Triggers**: View database triggers
- **Logs**: Debug issues with Explorer logs

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)

---

## Support

If you encounter issues:

1. Check [Supabase Discord](https://discord.supabase.com)
2. Search [Supabase GitHub Issues](https://github.com/supabase/supabase/issues)
3. Review [Supabase Status](https://status.supabase.com)

---

**You're all set! 🎉** Your Supabase backend is ready for MuralMap.
