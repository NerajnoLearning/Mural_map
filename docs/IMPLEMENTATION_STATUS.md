# MuralMap - Implementation Status

**Last Updated**: 2026-03-22
**Overall Progress**: ~90% Complete

---

## ✅ Completed Milestones

### M0 - Foundation (100% Complete)
- ✅ Project setup (Vite, Vue 3, TypeScript, TailwindCSS)
- ✅ Database schema with RLS policies
- ✅ Vue Router with Clerk-based navigation guards
- ✅ Pinia stores (auth, clerkAuth, app, posts, users, friends, comments, collections, search, notifications, activity)
- ✅ Type definitions (`database.ts`, `index.ts`)
- ✅ Base UI components (BaseButton, BaseInput, BaseCheckbox, BaseDivider, TagsInput)

### M1 - Core Loop (100% Complete)
- ✅ Photo upload with drag-and-drop
- ✅ Client-side image compression (70-90% reduction)
- ✅ EXIF metadata extraction (GPS, date, camera)
- ✅ Mural details form with tags (max 5)
- ✅ Reverse geocoding (GPS → city/address)
- ✅ Post CRUD operations with retry logic
- ✅ Masonry grid feed with infinite scroll (20/page)
- ✅ Post detail page
- ✅ Favorites functionality with optimistic UI

### M2 - Map Features (100% Complete)
- ✅ Leaflet map integration
- ✅ OpenStreetMap tiles
- ✅ Marker clustering (leaflet.markercluster)
- ✅ Interactive map with popups
- ✅ User geolocation
- ✅ MapView component
- ✅ MapPage with sidebar/bottom sheet

### M3 - Social Features (100% Complete)
- ✅ User profiles with stats
- ✅ User search with debouncing (300ms)
- ✅ Friend request system (send, accept, decline, cancel)
- ✅ Friends management page
- ✅ Comments CRUD with infinite scroll
- ✅ Comment reactions with emojis (6 common + picker)
- ✅ Edit/delete own comments with "edited" indicator
- ✅ Character limit (500) and keyboard shortcuts

### M4 - Collections & Discovery (100% Complete)
- ✅ Collections CRUD operations
- ✅ CollectionsPage with grid view
- ✅ CollectionDetailPage
- ✅ Drag-and-drop post reordering
- ✅ Add/remove posts from collections
- ✅ Collection metadata editing
- ✅ Global search (users + posts + tags)
- ✅ SearchPage with tabs and filters
- ✅ Tag-based search

### M5 - Polish & PWA (100% Complete)
- ✅ Notifications system with realtime updates
- ✅ NotificationsPage with filtering
- ✅ Navigation with notification badges (TopNav + BottomNav)
- ✅ Dark mode theme switching
- ✅ PWA manifest and service worker
- ✅ Offline support with caching strategies
- ✅ Offline drafts with IndexedDB
- ✅ DraftsPage for managing saved drafts
- ✅ Background sync for pending posts

### Auth Migration — Supabase → Clerk (100% Code Complete)
- ✅ `@clerk/vue` installed and configured in `main.ts`
- ✅ `App.vue` wrapped with `<ClerkProvider>`
- ✅ Router updated with Clerk-based navigation guards (`waitForClerk` pattern)
- ✅ `lib/supabase.ts` configured to inject Clerk JWT for RLS
- ✅ `ClerkSignInPage.vue` / `ClerkSignUpPage.vue` using Clerk `<SignIn>` / `<SignUp>` components
- ✅ `/auth/signin` and `/auth/signup` redirect to Clerk routes
- ✅ `auth.ts` store updated to use Clerk hooks (top-level ESM import)
- ✅ Database migration SQL created (`supabase/migrations/20260320_clerk_migration.sql`)
- ✅ Clerk webhook for user sync (`netlify/functions/clerk-webhook.ts`)
- ⚠️ Migration to `clerkAuth.ts` store not fully adopted — components still use `useAuthStore` (see known issues)

### Enhancement Features (Largely Complete)
- ✅ Trending posts algorithm (`fetchTrendingPosts` in posts store)
- ✅ Activity feed (ActivityPage + activity store)
- ✅ Settings page (SettingsPage)
- ✅ Retry logic for Supabase queries (`utils/retry.ts`)
- ✅ Input sanitization / XSS prevention (`utils/sanitize.ts`)
- ⏳ Web Share API integration — not yet implemented

---

## 🚧 Known Issues & Technical Debt

### Auth Architecture
1. **Dual auth stores coexist** — `auth.ts` (in use) and `clerkAuth.ts` (from migration, largely unused). Components import `useAuthStore`; migration docs say to switch to `useClerkAuthStore` but this hasn't been done. `clerkAuth.ts` is likely dead code.
2. **`getAuthenticatedClient()` in `auth.ts`** — returns the base Supabase client without attaching the Clerk token to headers. The token is fetched but not used. Authenticated Supabase calls may fail RLS.
3. **Legacy auth pages** — `SignInPage.vue`, `SignUpPage.vue`, `ForgotPasswordPage.vue` exist but are never reached (router redirects away from them). Dead code.

### Incomplete TODOs
- `logger.ts`: Sentry/error tracking integration is TODO
- `ErrorBoundary.vue`: Error reporting to tracking service is TODO
- `OnboardingPage.vue`: Username availability check via Supabase is TODO

### Testing
- ✅ Unit tests: 85/85 passing (validation, auth store, posts store, BaseButton)
- ✅ Test infrastructure: vitest + @vue/test-utils + happy-dom
- ⚠️ E2E tests (`tests/e2e/`) require dev server on port 3000 — run separately with `npm run test:e2e`
- ⏳ Coverage below configured 60% thresholds (many views/stores not yet tested)

---

## 📋 Remaining Work

### Pre-Launch
- [ ] Resolve dual auth store — either complete migration to `useClerkAuthStore` or remove `clerkAuth.ts`
- [ ] Fix `getAuthenticatedClient()` to actually attach Clerk token to Supabase client headers
- [ ] Remove dead auth pages (`SignInPage.vue`, `SignUpPage.vue`, `ForgotPasswordPage.vue`)
- [ ] Run Clerk environment setup (see `docs/setup/CLERK_MIGRATION_COMPLETE.md`)
- [ ] Run Supabase migration `20260320_clerk_migration.sql`
- [ ] Wire up error tracking (Sentry or similar)
- [ ] Implement username availability check in OnboardingPage

### Enhancement Features
- [ ] Web Share API integration
- [ ] Report/moderation system
- [ ] Block/mute users
- [ ] Push notifications (browser push API)

### Quality & Polish
- [ ] Expand unit test coverage to 60%+ threshold
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Lighthouse optimization (target >90)
- [ ] No-cache strategy: posts currently refetch on every navigation

### Deployment
- [ ] CI/CD pipeline
- [ ] Netlify env vars configured (Supabase + Clerk + webhook secret)
- [ ] Production domain setup
- [ ] README finalized

---

## 📊 Feature Completion by Epic

| Epic | Status | Progress | Notes |
|------|--------|----------|-------|
| Authentication & Identity | ✅ Code complete | 100% | Clerk integrated; env setup needed |
| Photo Upload & Management | ✅ Complete | 100% | Compression, EXIF, CRUD |
| Collections | ✅ Complete | 100% | CRUD, drag-drop reorder |
| Favorites | ✅ Complete | 100% | Toggle, count, optimistic UI |
| Geolocation & Map | ✅ Complete | 100% | Leaflet, clustering, interactive |
| Comments | ✅ Complete | 100% | CRUD, reactions, edit/delete |
| Friends & Social | ✅ Complete | 100% | Profiles, search, friend requests |
| Discovery & Search | ✅ Complete | 100% | Global search, tags, collections |
| Notifications | ✅ Complete | 100% | Realtime, badges, filtering |
| PWA & Polish | ✅ Complete | 100% | Dark mode, offline, service worker |
| Trending / Activity | ✅ Complete | 100% | Algorithm + activity feed |
| Settings | ✅ Complete | 100% | Preferences page |
| Error Tracking | ⏳ Not started | 0% | Sentry integration pending |
| Web Share API | ⏳ Not started | 0% | — |
| Report / Moderation | ⏳ Not started | 0% | — |

---

## 🗂️ Codebase Inventory

### Views (24)
| Group | Files |
|-------|-------|
| Public | Home, Discover, Map, Search, Trending, PostDetail, NotFound |
| Auth (active) | ClerkSignIn, ClerkSignUp, UserProfile |
| Auth (legacy — dead code) | SignIn, SignUp, ForgotPassword |
| Protected | Upload, Collections, CollectionDetail, Favorites, Friends, Notifications, Activity, Profile, Settings, Drafts, Onboarding |

### Stores (11)
| Store | Purpose |
|-------|---------|
| `auth.ts` | Clerk hooks wrapper + Supabase user sync |
| `clerkAuth.ts` | Alternate Clerk store (migration artifact — largely unused) |
| `app.ts` | Theme, toasts, online status, modal state |
| `posts.ts` | Post CRUD, pagination, trending |
| `collections.ts` | Collection CRUD |
| `friends.ts` | Friend requests and management |
| `comments.ts` | Comment CRUD and reactions |
| `notifications.ts` | Notification fetching and read state |
| `search.ts` | Global search across posts/users/tags |
| `activity.ts` | User activity feed |
| `users.ts` | User profile management |

### Components (18)
`auth/` OAuthButton, PasswordStrength · `collections/` AddToCollectionModal · `comments/` CommentItem, CommentsList · `common/` ErrorBoundary · `feed/` PostCard, MasonryGrid · `layout/` TopNav, BottomNav · `map/` MapView · `search/` UserSearch · `ui/` BaseButton, BaseInput, BaseCheckbox, BaseDivider, TagsInput · `upload/` PhotoUpload, MuralDetailsForm

### Composables (2)
`useMap.ts` · `useOfflineDrafts.ts`

### Utils (6)
`env.ts` · `imageProcessing.ts` · `logger.ts` · `retry.ts` · `sanitize.ts` · `validation.ts`

---

## 🔧 Tech Stack

### Frontend
- Vue 3 (Composition API) + TypeScript (strict)
- Vite 8 · Vue Router 5 · Pinia 3
- TailwindCSS v3 · Leaflet · browser-image-compression · exifr

### Auth & Backend Services
- **Clerk** (`@clerk/vue`) — authentication, pre-built UI, OAuth providers
- **Supabase** — PostgreSQL, RLS policies, Storage (images)
- Clerk JWT template → Supabase RLS integration
- Clerk webhook → Supabase user sync (via Netlify function)

### Testing
- Vitest 4 · @vue/test-utils · happy-dom
- Playwright (E2E, requires running dev server)

---

## 📈 Progress Metrics

| Metric | Value |
|--------|-------|
| Total Milestones | 5 + auth migration |
| Completed Milestones | 6/6 (code complete) |
| Views | 24 |
| Stores | 11 |
| Components | 18 |
| Composables | 2 |
| Utils | 6 |
| Unit Tests | 85/85 passing |
| Routes | 25+ |
| Type Safety | 100% (strict mode) |

---

**Status Summary**: MuralMap is code-complete for all planned features (~90%). Remaining work is primarily: resolving the auth store migration, wiring up real environment credentials (Clerk + Supabase), expanding test coverage, and deployment setup.
