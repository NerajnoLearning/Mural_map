# Clerk + Supabase Integration Guide for MuralMap

This guide explains how to set up Clerk authentication with Supabase database for MuralMap.

---

## Why Clerk + Supabase?

**Clerk handles:** Authentication, user management, OAuth providers, MFA
**Supabase handles:** Database, storage, realtime subscriptions

This gives you the best of both worlds:
- ✅ Clerk's superior auth UX and features
- ✅ Supabase's powerful PostgreSQL database
- ✅ Easy integration via webhooks and JWTs

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Create Clerk Account](#step-1-create-clerk-account)
3. [Step 2: Configure Clerk Application](#step-2-configure-clerk-application)
4. [Step 3: Install Clerk in Vue](#step-3-install-clerk-in-vue)
5. [Step 4: Update Supabase Schema](#step-4-update-supabase-schema)
6. [Step 5: Create Webhook Endpoint](#step-5-create-webhook-endpoint)
7. [Step 6: Configure RLS Policies](#step-6-configure-rls-policies)
8. [Step 7: Update Frontend Code](#step-7-update-frontend-code)
9. [Testing the Integration](#testing-the-integration)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- ✅ Supabase project already created
- ✅ `@clerk/vue` installed (`npm install @clerk/vue`)
- ✅ Vercel or Netlify account (for webhook endpoint)

---

## Step 1: Create Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Click **"Start building for free"**
3. Sign up with your preferred method
4. Create a new application:
   - **Application name**: `MuralMap`
   - **Select your sign-in options**: Check all that apply:
     - ✅ Email
     - ✅ Google
     - ✅ GitHub
     - ✅ Apple (if you have Apple Developer account)
     - ✅ Phone (OTP)
5. Click **"Create Application"**

---

## Step 2: Configure Clerk Application

### Enable OAuth Providers

1. In Clerk Dashboard, go to **User & Authentication** → **Social Connections**
2. Enable the providers you want:
   - **Google**: Toggle on (works immediately with Clerk's OAuth)
   - **GitHub**: Toggle on
   - **Apple**: Requires Apple Developer account
   - **Discord**: Toggle on (popular with tech users)

### Configure Email Settings

1. Go to **User & Authentication** → **Email, Phone, Username**
2. Configure:
   - **Email address**: Required ✅
   - **Phone number**: Optional (for OTP)
   - **Username**: Optional (or required)
3. **Email verification**: Enable (recommended)
4. Click **Save**

### Customize Sign-In Experience

1. Go to **Customization** → **Branding**
2. Upload your MuralMap logo
3. Set brand color: `#FF6B35` (MuralMap primary color)
4. Click **Save**

### Get API Keys

1. Go to **API Keys** in sidebar
2. Copy:
   - **Publishable Key** (starts with `pk_test_...`)
   - **Secret Key** (starts with `sk_test_...`)
3. Add to your `.env` file:

```env
# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Step 3: Install Clerk in Vue

### 1. Update `main.ts`

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { clerkPlugin } from '@clerk/vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(clerkPlugin, {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
})

app.mount('#app')
```

### 2. Wrap App with ClerkProvider

Update `App.vue`:

```vue
<script setup lang="ts">
import { ClerkProvider } from '@clerk/vue'
import { RouterView } from 'vue-router'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
</script>

<template>
  <ClerkProvider :publishable-key="clerkPubKey">
    <div id="app" class="min-h-screen bg-surface text-text">
      <RouterView />
    </div>
  </ClerkProvider>
</template>
```

### 3. Create Sign In Page

Create `src/views/auth/SignInPage.vue`:

```vue
<script setup lang="ts">
import { SignIn } from '@clerk/vue'
</script>

<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-16">
    <SignIn
      path="/sign-in"
      routing="path"
      sign-up-url="/sign-up"
    />
  </div>
</template>
```

### 4. Create Sign Up Page

Create `src/views/auth/SignUpPage.vue`:

```vue
<script setup lang="ts">
import { SignUp } from '@clerk/vue'
</script>

<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-16">
    <SignUp
      path="/sign-up"
      routing="path"
      sign-in-url="/sign-in"
    />
  </div>
</template>
```

### 5. Update Router

Update `src/router/index.ts`:

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@clerk/vue'

const routes = [
  {
    path: '/sign-in',
    name: 'SignIn',
    component: () => import('@/views/auth/SignInPage.vue')
  },
  {
    path: '/sign-up',
    name: 'SignUp',
    component: () => import('@/views/auth/SignUpPage.vue')
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue')
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('@/views/UploadPage.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Auth guard
router.beforeEach((to, from, next) => {
  const { isSignedIn } = useAuth()

  if (to.meta.requiresAuth && !isSignedIn.value) {
    next('/sign-in')
  } else {
    next()
  }
})

export default router
```

---

## Step 4: Update Supabase Schema

Run this SQL in Supabase SQL Editor:

```sql
-- Drop old auth-dependent schema
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Update users table for Clerk
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Add clerk_id column
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;

-- Backfill existing users (if migrating)
-- UPDATE public.users SET clerk_id = id::text WHERE clerk_id IS NULL;

-- Make clerk_id NOT NULL after backfill
ALTER TABLE public.users
  ALTER COLUMN clerk_id SET NOT NULL;

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_id);

-- Add updated_at column if not exists
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Step 5: Create Webhook Endpoint

### Option A: Netlify Function (Recommended)

Create `netlify/functions/clerk-webhook.ts`:

```typescript
import { Handler } from '@netlify/functions'
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key!
)

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    // Verify webhook signature
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!
    const svixHeaders = {
      'svix-id': event.headers['svix-id']!,
      'svix-timestamp': event.headers['svix-timestamp']!,
      'svix-signature': event.headers['svix-signature']!
    }

    const wh = new Webhook(webhookSecret)
    const payload = wh.verify(event.body!, svixHeaders)

    const { type, data } = payload as any

    switch (type) {
      case 'user.created':
        await supabase.from('users').insert({
          clerk_id: data.id,
          email: data.email_addresses[0]?.email_address,
          username: data.username || data.email_addresses[0]?.email_address.split('@')[0],
          display_name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
          avatar_url: data.image_url
        })
        break

      case 'user.updated':
        await supabase.from('users')
          .update({
            email: data.email_addresses[0]?.email_address,
            username: data.username,
            display_name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
            avatar_url: data.image_url
          })
          .eq('clerk_id', data.id)
        break

      case 'user.deleted':
        await supabase.from('users')
          .delete()
          .eq('clerk_id', data.id)
        break
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    }
  } catch (err) {
    console.error('Webhook error:', err)
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Webhook verification failed' })
    }
  }
}
```

### Add Environment Variables

In Netlify dashboard (**Site settings** → **Environment variables**):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLERK_WEBHOOK_SECRET=whsec_...
```

### Deploy and Get Webhook URL

1. Deploy to Netlify: `netlify deploy --prod`
2. Your webhook URL: `https://your-site.netlify.app/.netlify/functions/clerk-webhook`

### Configure Webhook in Clerk

1. Go to Clerk Dashboard → **Webhooks**
2. Click **+ Add Endpoint**
3. **Endpoint URL**: `https://your-site.netlify.app/.netlify/functions/clerk-webhook`
4. **Subscribe to events**:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Click **Create**
6. Copy the **Signing Secret** (starts with `whsec_...`)
7. Add to Netlify environment variables as `CLERK_WEBHOOK_SECRET`

---

## Step 6: Configure RLS Policies

Update RLS policies to use Clerk JWT:

```sql
-- Helper function to get Clerk user ID from JWT
CREATE OR REPLACE FUNCTION auth.clerk_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update users policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (clerk_id = auth.clerk_user_id());

DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
CREATE POLICY "Users are viewable by everyone"
ON public.users FOR SELECT
USING (true);

-- Update posts policies
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
CREATE POLICY "Users can insert their own posts"
ON public.posts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.clerk_id = auth.clerk_user_id()
    AND users.id = user_id
  )
);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts"
ON public.posts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.clerk_id = auth.clerk_user_id()
    AND users.id = user_id
  )
);

-- Similar updates for other tables...
```

---

## Step 7: Update Frontend Code

### Create Supabase Client with Clerk JWT

Update `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/vue'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: async () => {
      const { getToken } = useAuth()
      const token = await getToken({ template: 'supabase' })

      return token ? { Authorization: `Bearer ${token}` } : {}
    }
  }
})
```

### Configure Clerk JWT Template

1. Go to Clerk Dashboard → **JWT Templates**
2. Click **+ New template**
3. Select **Supabase** from templates
4. Name it `supabase`
5. Click **Create**

This template ensures Clerk JWTs are compatible with Supabase RLS.

---

## Testing the Integration

### 1. Test Sign Up

1. Go to `http://localhost:5174/sign-up`
2. Sign up with email or OAuth
3. Check Clerk Dashboard → **Users** (should see new user)
4. Check Supabase → **Table Editor** → **users** (should see synced user)

### 2. Test Data Access

Create a test post:

```typescript
import { supabase } from '@/lib/supabase'
import { useAuth, useUser } from '@clerk/vue'

const { isSignedIn } = useAuth()
const { user } = useUser()

async function createPost() {
  if (!isSignedIn.value) return

  // Get user ID from Supabase
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', user.value.id)
    .single()

  // Create post
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userData.id,
      title: 'Test Post',
      image_url: 'https://example.com/image.jpg'
    })

  console.log('Post created:', data, error)
}
```

---

## Troubleshooting

### Error: "JWT verification failed"

**Cause**: Clerk JWT template not configured
**Fix**: Create Supabase JWT template in Clerk Dashboard

### Error: "User not found in database"

**Cause**: Webhook not triggered or failed
**Fix**:
1. Check Clerk Dashboard → Webhooks → Logs
2. Check Netlify Functions logs
3. Manually create user in Supabase if needed

### Error: "Permission denied"

**Cause**: RLS policy not allowing access
**Fix**:
1. Check if `clerk_id` matches in JWT and database
2. Verify RLS policies use `auth.clerk_user_id()`
3. Check Supabase logs for RLS violations

### Webhook not receiving events

**Cause**: Wrong URL or signing secret
**Fix**:
1. Verify webhook URL in Clerk Dashboard
2. Check `CLERK_WEBHOOK_SECRET` environment variable
3. Redeploy Netlify function

---

## Summary

✅ Clerk handles authentication (email, OAuth, phone, MFA)
✅ Supabase stores user data and application data
✅ Webhooks keep Clerk and Supabase in sync
✅ RLS policies validate Clerk JWTs for secure data access

Your MuralMap app now has enterprise-grade authentication with the flexibility of Supabase! 🎉
