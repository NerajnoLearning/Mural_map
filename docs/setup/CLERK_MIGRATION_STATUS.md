# Clerk Migration Status

## ✅ Completed

### 1. Documentation Updated
- ✅ PROJECT_OVERVIEW.md updated with Clerk architecture
- ✅ Added Clerk + Supabase integration section
- ✅ Updated tech stack to show Clerk for auth
- ✅ Updated all auth-related user stories
- ✅ Created CLERK_SETUP_GUIDE.md with full implementation guide

### 2. Environment & Dependencies
- ✅ Installed `@clerk/vue` package
- ✅ Updated `.env` with `VITE_CLERK_PUBLISHABLE_KEY`
- ✅ Updated `.env.example` with Clerk variables

### 3. Core Integration
- ✅ Updated `src/main.ts` to initialize Clerk plugin
- ✅ Updated `src/App.vue` with ClerkProvider wrapper
- ✅ Created `ClerkSignInPage.vue` using Clerk's SignIn component
- ✅ Created `ClerkSignUpPage.vue` using Clerk's SignUp component
- ✅ Created `UserProfilePage.vue` using Clerk's UserProfile component

---

## 🚧 Still TODO

### 4. Router Updates
- [ ] Update `src/router/index.ts` to use Clerk auth guards
- [ ] Add routes for `/sign-in`, `/sign-up`, `/user-profile`
- [ ] Update protected route logic to use `useAuth()` from Clerk

### 5. Supabase Integration
- [ ] Update `src/lib/supabase.ts` to include Clerk JWT in requests
- [ ] Configure Clerk JWT template in Clerk Dashboard
- [ ] Test Supabase + Clerk JWT integration

### 6. Database Migration
- [ ] Run SQL migration in Supabase to add `clerk_id` column
- [ ] Update `users` table schema
- [ ] Remove old Supabase auth trigger
- [ ] Create index on `clerk_id`

### 7. Webhook Setup
- [ ] Create Netlify function for Clerk webhooks
- [ ] Configure webhook endpoint in Clerk Dashboard
- [ ] Test user sync from Clerk to Supabase
- [ ] Add webhook signing secret to environment

### 8. RLS Policies
- [ ] Create `auth.clerk_user_id()` helper function
- [ ] Update all RLS policies to use Clerk JWT
- [ ] Test RLS policies with Clerk authentication

### 9. Auth Store Refactor
- [ ] Update `src/stores/auth.ts` to use Clerk hooks
- [ ] Remove Supabase auth methods
- [ ] Add Clerk user sync methods
- [ ] Update components using auth store

### 10. Component Updates
- [ ] Update TopNav to use Clerk's UserButton
- [ ] Update all components using `authStore` to use `useAuth()`
- [ ] Update sign-out logic
- [ ] Remove old Supabase auth pages

---

## 📋 Next Steps

1. **Get Clerk Account & Keys**
   - Sign up at https://clerk.com
   - Create application
   - Copy publishable key to `.env`

2. **Update Router**
   ```bash
   # Update router to use Clerk
   ```

3. **Test Basic Auth**
   - Try signing up via `/sign-up`
   - Verify user appears in Clerk Dashboard

4. **Set Up Database**
   - Run migration SQL in Supabase
   - Add `clerk_id` column

5. **Create Webhook**
   - Deploy Netlify function
   - Configure in Clerk Dashboard

6. **Test Full Flow**
   - Sign up → Webhook fires → User in Supabase
   - Sign in → Can access protected routes
   - Create post → RLS allows access

---

## 🔑 Required Environment Variables

```env
# .env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...  # From Clerk Dashboard
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Netlify Environment (for webhook)
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Service role, not anon!
CLERK_WEBHOOK_SECRET=whsec_...  # From Clerk webhook config
```

---

## 📚 Key Files to Review

1. **CLERK_SETUP_GUIDE.md** - Complete step-by-step setup instructions
2. **PROJECT_OVERVIEW.md** - Updated architecture and requirements
3. **src/main.ts** - Clerk plugin initialization
4. **src/App.vue** - ClerkProvider wrapper
5. **src/views/auth/ClerkSignInPage.vue** - New sign-in page
6. **src/views/auth/ClerkSignUpPage.vue** - New sign-up page

---

## ⚠️ Important Notes

- **Don't delete old auth code yet** - Keep it until Clerk is fully working
- **Test incrementally** - Verify each step works before moving to next
- **Clerk free tier** - 10,000 MAU (monthly active users)
- **Webhook security** - Always validate webhook signatures
- **RLS policies** - Must extract `clerk_id` from JWT claims

---

## 🐛 Common Issues & Solutions

### Issue: "Missing Clerk configuration"
**Solution**: Add `VITE_CLERK_PUBLISHABLE_KEY` to `.env` and restart dev server

### Issue: "Clerk components not showing"
**Solution**: Ensure ClerkProvider wraps RouterView in App.vue

### Issue: "Can't access Supabase data"
**Solution**: Need to configure Clerk JWT template and update RLS policies

### Issue: "Webhook not firing"
**Solution**: Check webhook URL, signing secret, and Netlify function logs

---

**Last Updated**: March 20, 2026
**Status**: ~40% Complete - Core integration done, need router/database/webhook
