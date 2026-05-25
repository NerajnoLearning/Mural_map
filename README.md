# MuralMap 🎨

> Discover, photograph, and share street murals around the world

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-green)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-purple)](https://vitejs.dev/)

MuralMap is a **production-ready, mobile-first Progressive Web App** that allows users to discover, photograph, and share street murals. Users can log mural locations via GPS, organize finds into collections, connect with friends, and explore an interactive map of street art in their city and beyond.

**🚀 Project Status**: ~90% Complete | Production-Ready

---

## ✨ Features

### Core Functionality
- 📸 **Photo Upload** - Upload mural photos with automatic EXIF GPS extraction and image compression
- 📍 **Geolocation** - Automatic location capture or manual pin placement on map
- 🗺️ **Interactive Map** - Explore murals with Leaflet maps, custom markers, and clustering
- 🔍 **Smart Search** - Search murals by title, artist, location, or tags
- 🔥 **Trending Algorithm** - Discover popular murals with time-decay scoring
- ⭐ **Collections** - Organize favorite murals into themed collections
- 🎨 **Color Filter** - Browse murals by dominant color palette (extracted client-side on upload)
- 🖼️ **Style & Theme Tags** - Filter by art style (graffiti, stencil, mosaic, photorealistic…) and theme (portrait, nature, political…)

### Mural Archive & Location History
- 📜 **Mural Timeline** - Each GPS location maintains a full history of murals painted there over time
- 🪦 **Painted-Over Tracking** - Report when a mural has been painted over; the wall's history is preserved
- 🏷️ **Mural Status Badges** - Active, Painted Over, Damaged, Removed, and Unknown states displayed on cards and map markers
- 📍 **Location Page** - Dedicated view per wall showing every mural ever documented at that site, oldest to newest
- 🔗 **Successor Linking** - Connect a painted-over mural to the new work that replaced it

### Social Features
- 👥 **Friends System** - Follow friends and view their activity
- 💬 **Comments** - Discuss murals with the community
- ❤️ **Favorites** - Like and save murals
- 📲 **Share** - Native Web Share API with clipboard fallback
- 🔔 **Notifications** - Real-time notifications for interactions
- 📰 **Activity Feed** - See what your friends are posting and liking

### Progressive Web App
- 📱 **Installable** - Add to home screen on iOS and Android
- 🔌 **Offline Support** - Browse cached murals without internet
- 💾 **Offline Drafts** - Save posts in IndexedDB and sync when online
- ⚡ **Fast Loading** - Service worker caching for instant loads
- 🔄 **Background Sync** - Auto-submit posts when connection restored

### User Experience
- 🌙 **Dark Mode** - Automatic theme switching based on system preference
- 📱 **Responsive** - Mobile-first design, optimized for all screen sizes
- ♿ **Accessible** - WCAG 2.1 AA compliance with keyboard navigation
- 🎨 **Modern UI** - Clean design with TailwindCSS

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Vue 3](https://vuejs.org/) - Composition API with `<script setup>`
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Strict mode, 100% type coverage
- **Build Tool**: [Vite 8](https://vitejs.dev/) - Lightning-fast HMR and builds
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/) - Utility-first CSS with custom theming
- **State**: [Pinia](https://pinia.vuejs.org/) - Official Vue store library
- **Routing**: [Vue Router 5](https://router.vuejs.org/) - Client-side routing with guards

### Backend
- **Platform**: [Supabase](https://supabase.com/)
  - **Database**: PostgreSQL with PostGIS (geospatial queries)
  - **Auth**: Email/password, OAuth (Google, Apple), Phone OTP
  - **Storage**: Image uploads with CDN
  - **Realtime**: WebSocket subscriptions for live updates
  - **Security**: Row Level Security (RLS) policies

### Libraries & APIs
- **Maps**: [Leaflet](https://leafletjs.com/) + [MarkerCluster](https://github.com/Leaflet/Leaflet.markercluster)
- **Images**: [browser-image-compression](https://www.npmjs.com/package/browser-image-compression) + [exifr](https://www.npmjs.com/package/exifr)
- **Color Extraction**: [color-thief-browser](https://lokeshdhakar.com/projects/color-thief/) — client-side dominant palette, no external API
- **PWA**: Service Worker + IndexedDB + Background Sync API
- **Web APIs**: Geolocation, Share API, Clipboard, Intersection Observer

---

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Supabase** account ([sign up free](https://supabase.com))
- **Git** for version control

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/mural_map.git
cd mural_map
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set up Supabase

#### Create Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key to `.env`

#### Run Database Migrations
1. Go to **SQL Editor** in Supabase dashboard
2. Run the migration file: `supabase/migrations/schema.sql`
3. Run the v2 migration: `supabase/migrations/location_timeline.sql`

#### Enable Authentication
1. Navigate to **Authentication → Providers**
2. Enable **Email** provider
3. (Optional) Configure **Google** and **Apple** OAuth
4. (Optional) Configure **Phone** provider for OTP

#### Create Storage Bucket
1. Go to **Storage** in Supabase dashboard
2. Create a new bucket named `images`
3. Set it to **Public**
4. Configure RLS policies (see `supabase/migrations/storage_policies.sql`)

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Build & Deploy

### Build for production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview production build

```bash
npm run preview
```

### Type checking

```bash
npm run type-check
```

### Deploy

Deploy the `dist/` folder to any static hosting platform:

- **Vercel**: Connect your repo for auto-deploys
- **Netlify**: Drag and drop `dist/` or use CLI
- **Cloudflare Pages**: Git integration
- **GitHub Pages**: Use GitHub Actions workflow

**Important**: Set environment variables on your hosting platform!

---

## 🗂️ Project Structure

```
mural_map/
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js              # Service worker
│   └── offline.html       # Offline fallback page
├── src/
│   ├── assets/            # Styles, images
│   │   └── main.css       # Global CSS + Tailwind
│   ├── components/        # Vue components
│   │   ├── auth/          # Auth-related components
│   │   ├── collections/   # Collection components
│   │   ├── comments/      # Comment system
│   │   ├── feed/          # Feed/timeline
│   │   ├── layout/        # TopNav, BottomNav
│   │   ├── map/           # Map components
│   │   ├── search/        # Search UI
│   │   ├── ui/            # Base components (Button, Input)
│   │   └── upload/        # Upload flow
│   ├── composables/       # Reusable logic
│   │   ├── useMap.ts
│   │   ├── useColorExtraction.ts   # Client-side palette extraction
│   │   └── useOfflineDrafts.ts
│   ├── lib/
│   │   └── supabase.ts    # Supabase client
│   ├── router/
│   │   └── index.ts       # Route definitions + guards
│   ├── stores/            # Pinia stores
│   │   ├── auth.ts        # Authentication
│   │   ├── posts.ts       # Posts CRUD
│   │   ├── locations.ts   # Location/wall history (v2)
│   │   ├── notifications.ts # Notifications + realtime
│   │   ├── activity.ts    # Friend activity
│   │   ├── collections.ts # Collections
│   │   ├── comments.ts    # Comments
│   │   ├── friends.ts     # Friends system
│   │   ├── search.ts      # Search
│   │   ├── users.ts       # User profiles
│   │   └── app.ts         # Global state (theme, toasts)
│   ├── types/             # TypeScript definitions
│   │   ├── database.ts    # Database entities
│   │   ├── supabase.ts    # Supabase types
│   │   └── index.ts       # App types
│   ├── utils/             # Utilities
│   │   ├── imageProcessing.ts
│   │   ├── colorExtraction.ts      # Dominant color → color family mapping
│   │   └── validation.ts
│   ├── views/             # Page components
│   │   ├── auth/          # Auth pages
│   │   ├── HomePage.vue
│   │   ├── DiscoverPage.vue
│   │   ├── MapPage.vue
│   │   ├── SearchPage.vue
│   │   ├── TrendingPage.vue
│   │   ├── UploadPage.vue
│   │   ├── PostDetailPage.vue
│   │   ├── LocationPage.vue        # Wall timeline view (v2)
│   │   ├── ProfilePage.vue
│   │   ├── CollectionsPage.vue
│   │   ├── NotificationsPage.vue
│   │   ├── ActivityPage.vue
│   │   ├── SettingsPage.vue
│   │   └── DraftsPage.vue
│   ├── App.vue            # Root component
│   └── main.ts            # Entry point
├── docs/                  # Documentation
│   ├── skills/            # Technology guides
│   ├── PROJECT_OVERVIEW.md
│   ├── IMPLEMENTATION_REVIEW.md
│   └── ENHANCEMENT_FEATURES_COMPLETE.md
├── supabase/
│   └── migrations/        # SQL migrations
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── postcss.config.cjs
└── package.json
```

---

## 🗄️ Data Model Overview

MuralMap v2 separates **locations** (physical walls) from **posts** (mural versions). This enables full timeline history per wall.

```
Location (physical wall/site)
  └── Post/Mural (one version painted at that site)
        ├── photos[]
        ├── status: active | painted_over | damaged | removed | unknown
        ├── active_from: date
        ├── active_until: date | null
        ├── art_style: string
        ├── themes: string[]
        └── dominant_colors: string[]
```

### v2 Schema Additions

```sql
-- Locations table (physical wall sites)
CREATE TABLE locations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  point      GEOGRAPHY(POINT, 4326) NOT NULL,
  address    TEXT,
  neighborhood TEXT,
  city       TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Additions to posts table
ALTER TABLE posts ADD COLUMN location_id    UUID REFERENCES locations(id);
ALTER TABLE posts ADD COLUMN status         TEXT DEFAULT 'active'
  CHECK (status IN ('active','painted_over','damaged','removed','unknown'));
ALTER TABLE posts ADD COLUMN active_from    DATE;
ALTER TABLE posts ADD COLUMN active_until   DATE;
ALTER TABLE posts ADD COLUMN art_style      TEXT;
ALTER TABLE posts ADD COLUMN themes         TEXT[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN dominant_colors TEXT[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN ai_suggested   BOOLEAN DEFAULT false;
```

---

## 📚 Documentation

### Core Documentation
- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Complete PRD with features, tech stack, and roadmap
- **[README.md](./README.md)** - This file - Getting started and project overview

### Implementation & Status
- **[IMPLEMENTATION_REVIEW.md](./docs/IMPLEMENTATION_REVIEW.md)** - Comprehensive code review and analysis
- **[IMPLEMENTATION_STATUS.md](./docs/IMPLEMENTATION_STATUS.md)** - Current implementation status
- **[TESTING_STRATEGY.md](./docs/TESTING_STRATEGY.md)** - Testing approach and guidelines

### Setup Guides
- **[CLERK_SETUP_GUIDE.md](./docs/setup/CLERK_SETUP_GUIDE.md)** - Complete Clerk authentication setup
- **[CLERK_MIGRATION_COMPLETE.md](./docs/setup/CLERK_MIGRATION_COMPLETE.md)** - Clerk migration completion status
- **[SUPABASE_SETUP_GUIDE.md](./docs/setup/SUPABASE_SETUP_GUIDE.md)** - Supabase database setup
- **[ENABLE_GOOGLE_OAUTH.md](./docs/setup/ENABLE_GOOGLE_OAUTH.md)** - Google OAuth configuration
- **[SETUP_COMPLETE.md](./docs/setup/SETUP_COMPLETE.md)** - Initial setup completion

### Milestone Completions
- **[M1_COMPLETE.md](./docs/milestones/M1_COMPLETE.md)** - Authentication & Users milestone
- **[AUTH_COMPLETE.md](./docs/milestones/AUTH_COMPLETE.md)** - Authentication implementation
- **[UPLOAD_COMPLETE.md](./docs/milestones/UPLOAD_COMPLETE.md)** - Upload functionality
- **[M3_SOCIAL_COMPLETE.md](./docs/milestones/M3_SOCIAL_COMPLETE.md)** - Social features milestone
- **[M5_COMPLETE.md](./docs/milestones/M5_COMPLETE.md)** - Polish & PWA milestone
- **[ENHANCEMENT_FEATURES_COMPLETE.md](./docs/milestones/ENHANCEMENT_FEATURES_COMPLETE.md)** - Enhancement features

### Skills Documentation
Technology guides and implementation examples:
- **[Skills Index](./docs/skills/SKILLS_INDEX.md)** - Complete skills overview
- [Vue 3 Composition API](./docs/skills/vue3-composition-api.md) - Reactive state, composables, lifecycle
- [TypeScript](./docs/skills/typescript.md) - Type system, interfaces, generics
- [Pinia State Management](./docs/skills/pinia.md) - Stores, actions, getters
- [Supabase Integration](./docs/skills/supabase.md) - Database, auth, realtime, storage
- [TailwindCSS](./docs/skills/tailwindcss.md) - Utility classes, custom themes
- [Progressive Web Apps](./docs/skills/pwa.md) - Service workers, offline, installable
- [Leaflet Maps](./docs/skills/leaflet-maps.md) - Interactive maps, markers, clustering

---

## 🗺️ Development Milestones

### ✅ M0 — Foundation (Complete)
- [x] Vue 3 + TypeScript + Vite setup
- [x] TailwindCSS configuration
- [x] Supabase client integration
- [x] Database schema design
- [x] Vue Router with auth guards
- [x] Pinia stores setup

### ✅ M1 — Authentication & Users (Complete)
- [x] Email/password authentication
- [x] OAuth (Google, Apple)
- [x] Phone OTP authentication
- [x] User profiles
- [x] Password reset flow
- [x] Profile onboarding

### ✅ M2 — Posts & Upload (Complete)
- [x] Photo upload with compression
- [x] EXIF GPS extraction
- [x] Image optimization
- [x] Mural details form
- [x] Post CRUD operations
- [x] Visibility controls (public/friends/private)

### ✅ M3 — Discovery (Complete)
- [x] Feed with infinite scroll
- [x] Search (murals, artists, tags)
- [x] Interactive map with Leaflet
- [x] Marker clustering
- [x] Trending algorithm

### ✅ M4 — Social Features (Complete)
- [x] Friends system
- [x] Comments & mentions
- [x] Favorites/likes
- [x] Collections
- [x] User profiles

### ✅ M5 — Polish & PWA (Complete)
- [x] Notifications (realtime)
- [x] Dark mode
- [x] Offline drafts (IndexedDB)
- [x] Service worker caching
- [x] PWA manifest
- [x] Background sync
- [x] Accessibility improvements

### ✅ Enhancements (Complete)
- [x] Trending page with smart algorithm
- [x] Activity feed for friends
- [x] Settings page (account, privacy, theme)
- [x] Web Share API integration

### 🚧 v2 — Archive & Discovery (In Progress)

#### Archive / Timeline
- [ ] `locations` table (PostGIS) separate from posts
- [ ] Mural status field (`active | painted_over | damaged | removed | unknown`)
- [ ] `active_from` / `active_until` date fields on posts
- [ ] "Report as painted over" flow on PostDetailPage
- [ ] LocationPage — full wall timeline, oldest → newest
- [ ] Status badges on feed cards and map markers
- [ ] Archived mural toggle on MapPage (default off)
- [ ] Successor linking — connect painted-over mural to its replacement
- [ ] GPS proximity merge prompt on upload ("Is this the same wall?")

#### Color, Style & Theme
- [ ] Client-side dominant color extraction on upload (`color-thief-browser`)
- [ ] Color family mapping (hex → red / orange / yellow / green / blue / purple / black / white / multicolor)
- [ ] Color swatch filter row on DiscoverPage and SearchPage
- [ ] Color-coded map marker layer (optional toggle)
- [ ] Art style taxonomy (single-select on upload): `graffiti | stencil | wheatpaste | mosaic | photorealistic | abstract | geometric | lettering | character | mixed-media`
- [ ] Theme taxonomy (multi-select on upload): `portrait | nature | political | cultural | geometric | fantasy | community | humor | memorial`
- [ ] Style + theme filter panel on SearchPage (collapsible on mobile)
- [ ] Style + theme display on PostDetailPage

### 🔭 v3 — AI-Assisted Classification (Stretch Goals)
- [ ] Supabase Edge Function: send uploaded image to vision model API
- [ ] Suggested `art_style`, `themes[]`, and `dominant_colors[]` returned as JSON
- [ ] Upload flow surfaces suggestions with one-tap confirm/edit
- [ ] `ai_suggested` flag stored per post for data quality tracking
- [ ] Artist signature OCR — attempt text extraction, fuzzy-match against known artists, surface as suggestion only (never auto-applied)

---

## 📊 Project Metrics

- **Lines of Code**: ~11,792
- **Components**: 50+
- **Pinia Stores**: 10 (11 with `locations` store)
- **Views/Pages**: 18 (19 with `LocationPage`)
- **Routes**: 20+
- **Type Definitions**: 30+
- **Completion**: ~90%

---

## 🎯 Key Technical Achievements

- ✅ **100% TypeScript Coverage** - Strict mode, no type errors
- ✅ **Full PWA Implementation** - Offline, installable, background sync
- ✅ **Real-time Features** - Supabase subscriptions for live updates
- ✅ **Advanced State Management** - 10 Pinia stores with proper architecture
- ✅ **Geospatial Features** - PostGIS queries for location-based search
- ✅ **Image Processing** - Client-side compression and EXIF extraction
- ✅ **Performance Optimized** - Lazy loading, code splitting, caching
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Security** - Row Level Security (RLS) policies

---

## 🧪 Testing

**Status**: ✅ Testing infrastructure implemented

MuralMap uses a comprehensive testing strategy with unit, component, and E2E tests.

### Testing Stack
- **Unit & Component Tests**: [Vitest](https://vitest.dev/) + [@vue/test-utils](https://test-utils.vuejs.org/)
- **E2E Tests**: [Playwright](https://playwright.dev/)
- **Coverage**: c8 (v8 provider)
- **Test Environment**: happy-dom

### Running Tests

#### Unit & Component Tests
```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

#### E2E Tests
```bash
# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug
```

#### Run All Tests
```bash
npm run test:all
```

### Test Coverage

Current test files:
- ✅ **Unit Tests**
  - `tests/unit/utils/validation.spec.ts` - Input validation utilities
  - `tests/unit/utils/colorExtraction.spec.ts` - Color family mapping logic
  - `tests/unit/stores/auth.spec.ts` - Authentication store (15+ tests)
  - `tests/unit/stores/posts.spec.ts` - Posts store with trending algorithm (20+ tests)
  - `tests/unit/stores/locations.spec.ts` - Location/timeline store
  - `tests/unit/components/BaseButton.spec.ts` - Base button component (30+ tests)

- ✅ **E2E Tests**
  - `tests/e2e/auth.spec.ts` - Authentication flow (sign up, sign in, OAuth, password reset)
  - `tests/e2e/posts.spec.ts` - Post creation, feed, map view, interactions
  - `tests/e2e/location-timeline.spec.ts` - Wall history, painted-over reporting

### Test Configuration

Tests are configured with:
- **Global setup**: `tests/setup.ts` - Mocks for Web APIs (geolocation, clipboard, etc.)
- **Supabase mock**: `tests/mocks/supabase.ts` - Complete Supabase client mock
- **Router mock**: `tests/mocks/router.ts` - Vue Router mock for component tests
- **Coverage thresholds**: 60% (lines, functions, branches, statements)

### Writing Tests

Example unit test:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should sign in user', async () => {
    const authStore = useAuthStore()
    const result = await authStore.signIn('test@example.com', 'password')
    expect(result.error).toBeNull()
  })
})
```

Example component test:
```typescript
import { mount } from '@vue/test-utils'
import BaseButton from '@/components/ui/BaseButton.vue'

it('should emit click event', async () => {
  const wrapper = mount(BaseButton)
  await wrapper.trigger('click')
  expect(wrapper.emitted('click')).toBeTruthy()
})
```

Example E2E test:
```typescript
import { test, expect } from '@playwright/test'

test('should display home page', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
})
```

### CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: |
    npm run test:run
    npm run test:e2e
```

For more testing details, see [TESTING_STRATEGY.md](./docs/TESTING_STRATEGY.md)

---

## 🚧 Future Enhancements

- [ ] Push notifications (browser notifications API)
- [ ] Email digest for weekly activity
- [ ] Multi-language support (i18n)
- [ ] Advanced search filters
- [ ] Export data (JSON, CSV)
- [ ] Admin dashboard
- [ ] Content moderation
- [ ] Analytics dashboard
- [ ] AI-assisted mural classification (v3 — see roadmap above)
- [ ] Artist OCR identification (v3 stretch goal)

---

## 🤝 Contributing

This is primarily a portfolio/learning project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

**ISC License**

Copyright (c) 2026 Nerajno (Nerando Johnson)

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

---

## 👨‍💻 Author

**Nerajno (Nerando Johnson)**

- Portfolio: [Your Portfolio URL]
- GitHub: [@nerajno](https://github.com/nerajno)
- LinkedIn: [Your LinkedIn]

---

## 🙏 Acknowledgments

- **Street Art Community** - For inspiring this project
- **Vue.js Team** - For the amazing framework
- **Supabase** - For the incredible backend platform
- **Leaflet** - For the open-source map library
- **TailwindCSS** - For the utility-first CSS framework
- **color-thief-browser** - For client-side color palette extraction

---

## 📸 Screenshots

*Coming soon - Add screenshots of your app in action*

---

## 🌟 Show Your Support

If you found this project helpful or interesting, please give it a ⭐️!

---

**Built with ❤️ for street art enthusiasts worldwide**

*Last Updated: May 2026*
