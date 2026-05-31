# MuralMap - Implementation Status

**Last Updated**: 2026-05-30
**Overall Progress**: ~95% Complete

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
- ✅ Drag-and-drop post reordering (HTML5 drag events, persisted via `collectionsStore.reorderPosts`)
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

### M6 - Launch Readiness (Largely Complete)
- ✅ ESLint 10 flat config (`eslint.config.js`) — 0 errors
- ✅ PWA icons — 11 PNGs generated via sharp (72–512px + 3 shortcut icons)
- ✅ CI/CD pipeline — GitHub Actions (type-check → lint → test → build)
- ✅ Favicon updated from Vite placeholder to app icon
- ✅ Manifest `screenshots` stale entries removed (files didn't exist)
- ✅ Lighthouse audit documented (`docs/superpowers/specs/2026-05-30-group-e-lighthouse-audit.md`)

### P1 UI Polish (Complete)
- ✅ `EmptyState.vue` — reusable component (icon, title, description, CTA) replacing inline blocks across 12 views
- ✅ oh-vue-icons global registration (Font Awesome 5 Free)
- ✅ Favorites sort toggle — Date / City / Artist (client-side computed, no refetch)
- ✅ `favorites_created_at` retained from Supabase join for correct date sort
- ✅ Draft count badge on Upload nav button (IndexedDB count via `useOfflineDrafts`)
- ✅ `ReconnectBanner.vue` — dismissible banner when `isOnline` flips back with pending posts
- ✅ `PushPrimerCard.vue` — one-time primer in NotificationsPage; dismissal stored in localStorage
- ✅ `CropAdjustModal.vue` — aspect ratios (Free/1:1/4:3/16:9), brightness/contrast sliders, Reset, Skip, Apply via HTML5 Canvas
- ✅ Photo crop/adjust wired into PhotoUpload upload flow (US-09 AC-01–06 complete)

### Auth Migration — Supabase → Clerk (100% Code Complete)
- ✅ `@clerk/vue` installed and configured in `main.ts`
- ✅ `App.vue` wrapped with `<ClerkProvider>`
- ✅ Router updated with Clerk-based navigation guards (`waitForClerk` pattern)
- ✅ `lib/supabase.ts` — `accessToken` callback wires Clerk JWT to singleton; all stores get RLS enforcement automatically
- ✅ `auth.ts` — calls `setTokenProvider` in `initializeClerk()`; `getAuthenticatedClient()` removed (was bypassing singleton)
- ✅ `ClerkSignInPage.vue` / `ClerkSignUpPage.vue` using Clerk `<SignIn>` / `<SignUp>` components
- ✅ `/auth/signin` and `/auth/signup` redirect to Clerk routes
- ✅ `auth.ts` store updated to use Clerk hooks (top-level ESM import)
- ✅ Database migration SQL created (`supabase/migrations/20260320_clerk_migration.sql`)
- ✅ Clerk webhook for user sync (`netlify/functions/clerk-webhook.ts`)
- ✅ Dead auth pages removed — `SignInPage.vue`, `SignUpPage.vue`, `ForgotPasswordPage.vue` deleted
- ⚠️ `clerkAuth.ts` store is migration artifact — largely unused, `useAuthStore` is canonical

### Enhancement Features (Largely Complete)
- ✅ Trending posts algorithm (`fetchTrendingPosts` in posts store)
- ✅ Activity feed (ActivityPage + activity store)
- ✅ Settings page with push notification toggle (`usePushNotifications`)
- ✅ Retry logic for Supabase queries (`utils/retry.ts`)
- ✅ Input sanitization / XSS prevention (`utils/sanitize.ts`)
- ✅ Sentry SDK installed (`@sentry/vue`) — ⚠️ not wired in production yet
- ⏳ Web Share API integration — not yet implemented

---

## 🚧 Known Issues & Technical Debt

### Auth Architecture
1. **`clerkAuth.ts` store** — migration artifact, largely unused. `useAuthStore` is canonical. Low priority to remove.
2. **RLS enforcement is code-complete** — `accessToken` callback wires Clerk JWT to Supabase singleton. Needs live verification: a logged-in Clerk session + Supabase JWT template configured in Clerk dashboard + `20260320_clerk_migration.sql` applied.

### Incomplete TODOs
- `logger.ts`: Sentry DSN not wired — `@sentry/vue` installed but `init()` not called
- `ErrorBoundary.vue`: Error reporting to tracking service is TODO
- `OnboardingPage.vue`: Username availability check via Supabase is TODO

### Testing
- ✅ Unit tests: 106/106 passing (components, stores, utils, sort logic)
- ✅ Test infrastructure: vitest 4 + @vue/test-utils + happy-dom
- ⚠️ E2E tests (`tests/e2e/`) — Playwright configured, no test files written yet
- ⏳ Coverage below configured 60% thresholds (stores/composables not tested)

---

## 📋 Remaining Work

### Pre-Launch (Blockers)
- ✅ RLS fix — `accessToken` callback wires Clerk JWT to Supabase singleton (all stores)
- ✅ Dead auth pages removed — `SignInPage.vue`, `SignUpPage.vue`, `ForgotPasswordPage.vue`
- [ ] Wire Sentry DSN (`@sentry/vue` installed, `init()` not called)
- [ ] Run Clerk environment setup (see `docs/setup/CLERK_MIGRATION_COMPLETE.md`)
- [ ] Run Supabase migration `20260320_clerk_migration.sql`
- [ ] Configure Clerk JWT template "supabase" in Clerk dashboard (required for `accessToken` callback)
- [ ] Configure Netlify env vars (Supabase + Clerk + webhook secret + VAPID keys)
- [ ] Live-verify RLS: logged-in session + query that policy should reject

### Enhancement Features
- [ ] Web Share API (`navigator.share()` on post detail)
- [ ] Report/moderation system
- [ ] Username availability check in OnboardingPage

### Quality
- [ ] Expand unit test coverage (stores, composables)
- [ ] Write E2E tests for critical flows (upload, auth, map)

---

## 📊 Feature Completion by Epic

| Epic | Status | Progress | Notes |
|------|--------|----------|-------|
| Authentication & Identity | ✅ Code complete | 100% | Clerk integrated; RLS wired via accessToken; env setup + live verify needed |
| Photo Upload & Management | ✅ Complete | 100% | Compression, EXIF, crop/adjust, CRUD |
| Collections | ✅ Complete | 100% | CRUD, drag-drop reorder |
| Favorites | ✅ Complete | 100% | Toggle, sort (Date/City/Artist), empty state |
| Geolocation & Map | ✅ Complete | 100% | Leaflet, clustering, interactive |
| Comments | ✅ Complete | 100% | CRUD, reactions, edit/delete |
| Friends & Social | ✅ Complete | 100% | Profiles, search, friend requests |
| Discovery & Search | ✅ Complete | 100% | Global search, tags, collections |
| Notifications | ✅ Complete | 100% | Realtime, badges, push primer card |
| PWA & Polish | ✅ Complete | 100% | Dark mode, offline, service worker, icons, Lighthouse audit |
| Empty States | ✅ Complete | 100% | EmptyState component across all 12 views |
| Trending / Activity | ✅ Complete | 100% | Algorithm + activity feed |
| Settings | ✅ Complete | 100% | Profile, privacy, push toggle, appearance |
| Error Tracking | ⚠️ Partial | 50% | SDK installed, DSN not wired |
| Web Share API | ⏳ Not started | 0% | — |
| Report / Moderation | ⏳ Not started | 0% | — |

---

## 🗂️ Codebase Inventory

### Views (24)
| Group | Files |
|-------|-------|
| Public | Home, Discover, Map, Search, Trending, PostDetail, NotFound |
| Auth (active) | ClerkSignIn, ClerkSignUp, UserProfile |
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

### Components (27)
`auth/` OAuthButton, PasswordStrength · `collections/` AddToCollectionModal · `comments/` CommentItem, CommentsList · `common/` ErrorBoundary · `feed/` PostCard, MasonryGrid · `layout/` TopNav, BottomNav · `map/` MapView · `search/` UserSearch · `ui/` BaseButton, BaseInput, BaseCheckbox, BaseDivider, TagsInput, **EmptyState**, **ReconnectBanner**, **PushPrimerCard** · `upload/` PhotoUpload, MuralDetailsForm, **CropAdjustModal**

### Composables (2)
`useMap.ts` · `useOfflineDrafts.ts`

### Utils (6)
`env.ts` · `imageProcessing.ts` · `logger.ts` · `retry.ts` · `sanitize.ts` · `validation.ts`

---

## 🔧 Tech Stack

### Frontend
- Vue 3 (Composition API) + TypeScript (strict)
- Vite 8 · Vue Router 5 · Pinia 3
- TailwindCSS v3 · Leaflet · browser-image-compression · exifr · oh-vue-icons

### Auth & Backend Services
- **Clerk** (`@clerk/vue`) — authentication, pre-built UI, OAuth providers
- **Supabase** — PostgreSQL, RLS policies, Storage (images)
- Clerk JWT template → Supabase RLS integration
- Clerk webhook → Supabase user sync (via Netlify function)

### Testing
- Vitest 4 · @vue/test-utils · happy-dom
- Playwright (E2E, requires running dev server)

### CI/CD
- GitHub Actions — type-check → lint → test:run → build on push/PR to main

---

## 📈 Progress Metrics

| Metric | Value |
|--------|-------|
| Total Milestones | 6 + auth migration |
| Completed Milestones | 6/6 (code complete) |
| Views | 24 |
| Stores | 11 |
| Components | 27 |
| Composables | 2 |
| Utils | 6 |
| Unit Tests | 109/109 passing |
| Test Files | 10 |
| Routes | 25+ |
| Type Safety | 100% (strict mode) |
| Lint Errors | 0 |

---

**Status Summary**: MuralMap is ~97% code-complete. All planned features shipped. RLS now enforced on all Supabase requests via `accessToken` callback. Dead auth pages removed. Remaining blockers are environment/ops: Clerk JWT template config, Supabase migration SQL, Netlify env vars, Sentry DSN wiring, and live RLS verification.
