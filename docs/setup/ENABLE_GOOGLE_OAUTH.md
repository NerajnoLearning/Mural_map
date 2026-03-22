# Enable Google OAuth in Supabase

You're getting the error because Google OAuth is not enabled in your Supabase project. Here's how to fix it:

---

## Quick Fix (5 minutes)

### Step 1: Go to Supabase Dashboard

1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your **MuralMap** project
3. Go to **Authentication** (shield icon) in the left sidebar
4. Click **Providers**

### Step 2: Enable Google Provider

1. Scroll down to find **Google** in the providers list
2. Toggle it to **Enabled**
3. You'll see two setup options:

---

## Option A: Use Supabase's Google OAuth (Easiest - 2 minutes)

**Best for development and testing**

1. In the Google provider settings, you'll see **"Use Supabase's Google OAuth application"**
2. ✅ **Check this option**
3. Click **Save**
4. **Done!** Google sign-in will now work

**Limitations:**
- Shows "via Supabase" in the OAuth consent screen
- Limited branding customization
- Fine for development/MVP

---

## Option B: Use Your Own Google OAuth (Production - 10 minutes)

**Best for production apps**

### Step 1: Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing:
   - Click project dropdown at top
   - Click **"New Project"**
   - Name: `MuralMap`
   - Click **Create**

### Step 2: Enable Google+ API

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for **"Google+ API"**
3. Click it and press **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have Google Workspace)
3. Click **Create**
4. Fill in required fields:
   - **App name**: `MuralMap`
   - **User support email**: Your email
   - **App logo**: (optional) Upload your logo
   - **Application home page**: `https://your-domain.com` (or leave blank for dev)
   - **Developer contact**: Your email
5. Click **Save and Continue**
6. **Scopes**: Click **Add or Remove Scopes**
   - Add: `userinfo.email`
   - Add: `userinfo.profile`
   - Click **Update**
   - Click **Save and Continue**
7. **Test users** (for development):
   - Add your Gmail address
   - Click **Save and Continue**
8. Click **Back to Dashboard**

### Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** at top
3. Select **OAuth client ID**
4. Choose **Application type**: **Web application**
5. Fill in details:
   - **Name**: `MuralMap Web Client`
   - **Authorized JavaScript origins**: Add these URLs:
     ```
     http://localhost:5174
     https://your-production-domain.com
     ```
   - **Authorized redirect URIs**: Add this URL (IMPORTANT):
     ```
     https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
     ```
     ☝️ **Replace `zrtdaalomfqcvfhxddwz` with YOUR Supabase project reference**

     To find your project reference:
     - Your Supabase URL: `https://YOUR-PROJECT-REF.supabase.co`
     - The part before `.supabase.co` is your project ref

6. Click **Create**
7. **Copy** the **Client ID** and **Client Secret** shown

### Step 5: Add Credentials to Supabase

1. Go back to **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. ❌ **Uncheck** "Use Supabase's Google OAuth application"
3. Paste your **Client ID** from Google
4. Paste your **Client Secret** from Google
5. Click **Save**

### Step 6: Test It

1. Go to your app: `http://localhost:5174/auth/signin`
2. Click **"Sign in with Google"**
3. You should see Google's consent screen
4. Sign in with your Google account
5. Should redirect back to your app, logged in!

---

## Verification

After enabling Google OAuth, test it:

1. Open your app: `http://localhost:5174/auth/signin`
2. Click the **Google sign-in button**
3. You should be redirected to Google
4. Sign in with your Google account
5. You'll be redirected back to your app, authenticated!

---

## Troubleshooting

### Error: "Access blocked: This app's request is invalid"
- **Cause**: Wrong redirect URI in Google Cloud Console
- **Fix**: Make sure redirect URI is exactly: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`

### Error: "Unsupported provider: provider is not enabled"
- **Cause**: Google not enabled in Supabase
- **Fix**: Go to Supabase → Authentication → Providers → Enable Google

### Error: "redirect_uri_mismatch"
- **Cause**: Redirect URI not added to Google OAuth app
- **Fix**: Add `https://YOUR-PROJECT.supabase.co/auth/v1/callback` to Authorized redirect URIs in Google Cloud Console

### Google consent screen shows warning
- **Cause**: App is in testing mode
- **Fix**: This is normal for development. To remove warning, publish app in Google Cloud Console (OAuth consent screen → Publish App)

### After signing in with Google, no user profile created
- **Cause**: Database trigger might have failed
- **Fix**: Check Supabase logs in Dashboard → Logs → Database
- Verify trigger exists: SQL Editor → Run:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```

---

## What Happens When User Signs In with Google?

1. User clicks "Sign in with Google"
2. Redirected to Google consent screen
3. User approves access
4. Google redirects back to Supabase with auth code
5. Supabase exchanges code for Google user info
6. Supabase creates session
7. Database trigger creates user profile in `users` table
8. User redirected to your app, logged in!

---

## Quick Start Checklist

For **Development/Testing** (2 minutes):
- [ ] Go to Supabase → Authentication → Providers
- [ ] Enable Google
- [ ] Check "Use Supabase's Google OAuth application"
- [ ] Click Save
- [ ] Test sign-in

For **Production** (10 minutes):
- [ ] Create Google Cloud project
- [ ] Enable Google+ API
- [ ] Configure OAuth consent screen
- [ ] Create OAuth credentials
- [ ] Add redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
- [ ] Copy Client ID and Secret
- [ ] Paste into Supabase
- [ ] Test sign-in

---

## Your Supabase Redirect URI

Based on your `.env` file:
```
https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
```

Use this exact URL in your Google Cloud Console OAuth configuration!

---

## Need Help?

If you're still having issues:
1. Check Supabase logs: Dashboard → Logs → Auth
2. Check browser console for errors (F12)
3. Verify Google Cloud Console settings match exactly

---

**That's it!** Google OAuth should now work. 🎉
