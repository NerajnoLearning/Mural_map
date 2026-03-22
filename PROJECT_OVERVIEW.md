# MuralMap — Product Requirements Document

| Field | Value |
|---|---|
| **Product** | MuralMap |
| **Version** | 1.1 |
| **Status** | Draft |
| **Last Updated** | 2026-03-22 |
| **Author** | Nerajno (Nerando Johnson) |
| **Reviewers** | TBD |

> **v1.1 Changelog:** Added User Journey Maps (§4.1), Critical User Flows (§4.2), expanded Design System with concrete tokens and component states (§11), UX Microcopy Guidelines (§11.1), Information Architecture (§11.2), Usability Testing Plan (§14.1). Fixed TOC to include Testing Strategy. Strengthened select acceptance criteria and added UX design notes per epic.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
   - [4.1 User Journey Maps](#41-user-journey-maps)
   - [4.2 Critical User Flows](#42-critical-user-flows)
5. [Assumptions & Constraints](#5-assumptions--constraints)
6. [Tech Stack](#6-tech-stack)
7. [App Architecture & Routes](#7-app-architecture--routes)
8. [User Stories & Acceptance Criteria](#8-user-stories--acceptance-criteria)
   - [Epic 1 — Authentication & Identity](#epic-1--authentication--identity)
   - [Epic 2 — Mural Photo Upload & Management](#epic-2--mural-photo-upload--management)
   - [Epic 3 — Collections](#epic-3--collections)
   - [Epic 4 — Favorites](#epic-4--favorites)
   - [Epic 5 — Geolocation & Map](#epic-5--geolocation--map)
   - [Epic 6 — Comments](#epic-6--comments)
   - [Epic 7 — Friends & Social](#epic-7--friends--social)
   - [Epic 8 — Discovery & Search](#epic-8--discovery--search)
   - [Epic 9 — Recommended Features](#epic-9--recommended-features)
9. [Data Models](#9-data-models)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Design System & UI Standards](#11-design-system--ui-standards)
    - [11.1 UX Microcopy & Writing Guidelines](#111-ux-microcopy--writing-guidelines)
    - [11.2 Information Architecture](#112-information-architecture)
12. [Risks & Dependencies](#12-risks--dependencies)
13. [Out of Scope (v1.0)](#13-out-of-scope-v10)
14. [Testing Strategy](#14-testing-strategy)
    - [14.1 Usability Testing Plan](#141-usability-testing-plan)
15. [Roadmap & Milestones](#15-roadmap--milestones)

---

## 1. Executive Summary

MuralMap is a mobile-first, social photo-logging web application that allows users to discover,
photograph, and share street murals. Users can log mural locations via GPS or manual pin
placement, organize finds into collections, connect with friends, and explore a map of logged
murals in their city and beyond.

MuralMap sits at the intersection of street art culture, community social networking, and
urban exploration — filling a gap that generic photo apps and maps do not address: a
purpose-built, art-focused discovery layer on top of the real world.

---

## 2. Problem Statement

Street art is ephemeral. Murals get painted over, buildings come down, and communities lose
cultural landmarks with no record. Existing tools — Google Maps, Instagram, general photo apps
— are not built for the systematic discovery, documentation, and community sharing of street
art. There is no dedicated place for mural enthusiasts to:

- Log where a mural is before it disappears
- Credit the artist behind the work
- Organize personal collections by neighborhood, artist, or style
- Discover murals nearby through a community-powered map
- Follow friends who share their passion for urban art

MuralMap solves this by providing a structured, community-driven platform where every mural
can be photographed, geotagged, tagged, credited, and remembered.

---

## 3. Goals & Success Metrics

### Product Goals

| # | Goal | Description |
|---|---|---|
| G1 | Document street art | Make it easy to log a mural in under 2 minutes |
| G2 | Enable discovery | Surface murals through map, feed, and search |
| G3 | Build community | Connect users through friends, comments, and shared collections |
| G4 | Preserve history | Create a permanent, searchable record of murals by location |

### Key Performance Indicators (KPIs)

| Metric | Target (3 months post-launch) |
|---|---|
| Registered users | 1,000 |
| Murals logged | 5,000 |
| DAU / MAU ratio | ≥ 25% |
| Avg. session length | ≥ 4 minutes |
| Photos with GPS data | ≥ 70% |
| Collections created | ≥ 2 per active user |
| P95 upload time | ≤ 4 seconds |
| Lighthouse score | ≥ 90 (Performance, Accessibility) |
| Onboarding completion rate | ≥ 70% (sign-up → first mural post) |
| Upload task completion rate | ≥ 85% (started → submitted) |

---

## 4. User Personas

> Personas are grounded in the behaviors of street art communities, urban explorer forums,
> and casual social media users. Validate with 5–8 user interviews before M1.

---

### Persona A — "The Archivist" (Primary)

**Name:** Maya Chen, 28 | **Occupation:** Graphic Designer | **Location:** Atlanta, GA

#### Goals
- Build a searchable personal archive of every mural she's photographed
- Credit artists by name so their work is properly documented
- Discover murals in new cities before and during travel

#### Pain Points
- Instagram mixes mural content with everything else — no way to filter or organize by style
- Google Maps pins have no art context, no tags, no social layer
- When a mural disappears, the Instagram post is often all that's left — no location data

#### Behaviors
- Takes mural photos with GPS enabled on her phone's camera app
- Saves locations in a personal Notes app before switching to Instagram
- Shares mural spots with 2–3 close friends who share the interest

#### Technology Comfort
- High; daily smartphone user, comfortable with apps and social platforms
- Frustrated by apps that require many steps for simple actions

> *"I've photographed over 300 murals but I couldn't tell you where most of them are anymore.
> I need a place that's as serious about this as I am."*

---

### Persona B — "The Urban Documenter" (Secondary)

**Name:** DeShawn Richards, 34 | **Occupation:** Urban Planner | **Location:** Chicago, IL

#### Goals
- Map mural density by neighborhood to understand public art's role in community identity
- Export or share collections as a reference for city planning presentations
- Track murals over time — noting when they're painted over or restored

#### Pain Points
- No tool connects high-quality photography with precise geolocation and community-level context
- Needs data (location, dates, artist, style) that social apps don't capture
- Wants to share collections with colleagues who aren't on social media

#### Behaviors
- Uses a DSLR but exports to phone for upload; sometimes photos lack GPS EXIF data
- Documents neighborhoods systematically — starts with one block, works outward
- Prefers map-first discovery over feed-first discovery

#### Technology Comfort
- Moderate-high; uses GIS tools for work, comfortable with web apps, expects precision
- Will abandon flows that are ambiguous or lose his data

> *"I can tell you which neighborhoods have the most murals. I just can't prove it yet
> because none of the data lives anywhere useful."*

---

### Persona C — "The Casual Discoverer" (Tertiary)

**Name:** Priya Nair, 22 | **Occupation:** College Student | **Location:** Austin, TX

#### Goals
- Quick upload when she spots something interesting while walking to class
- See what friends have found nearby this week
- Learn the story behind murals she passes every day

#### Pain Points
- Complex apps kill the spontaneous moment — she won't stop to figure out a multi-step flow
- Wants discovery, not documentation; she's not building an archive
- Feels like a spectator on big social platforms, not a contributor

#### Behaviors
- Discovers murals passively while commuting or running errands
- Shares on Instagram Stories but loses the location context immediately
- Checks apps primarily during short breaks (commute, waiting in line)

#### Technology Comfort
- High; digital native, but low patience for friction
- Expects instant feedback and will abandon a flow if it feels slow

> *"It's right there on the wall and I just want to tap, snap, and move on.
> Tell me who made it. That's it."*

---

### 4.1 User Journey Maps

#### Maya's Journey — "Log a mural before it disappears"

```
STAGE        DOING                    THINKING                  FEELING
─────────────────────────────────────────────────────────────────────────
Trigger      Spots a new mural        "This might be gone       Excited, urgent
             while driving            next week"

Capture      Pulls over, takes        "Hope my GPS is on"       Hopeful, slightly
             photo on phone                                      anxious

Open App     Opens MuralMap,          "Please don't make        Purposeful
             taps Upload              me sign in again"

Upload        EXIF GPS found,          "Oh it already knows      Delighted
              pin appears on map       where this is!"

Add Details  Adds artist name,         "I'll add more later"     Satisfied, efficient
             taps a few tags

Submit       Post is live on map      "Now it's real"           Accomplished

─────────────────────────────────────────────────────────────────────────
PAIN POINTS: Slow upload on LTE | Manual location when GPS is missing
OPPORTUNITIES: Auto-suggest tags from image | Artist autocomplete from community data
```

---

#### DeShawn's Journey — "Build a neighborhood mural map"

```
STAGE        DOING                    THINKING                  FEELING
─────────────────────────────────────────────────────────────────────────
Planning     Opens map view of        "Which blocks haven't      Analytical,
             a neighborhood           I covered yet?"            methodical

Discovery    Browses existing pins,   "Someone already got       Relieved (saves
             finds 4 murals logged    that block"                work), curious

Upload       Uploads 8 photos from    "These don't have GPS,     Concerned,
             his DSLR export          I need to pin manually"    mildly frustrated

Manual Pin   Searches address,        "Good enough, but I        Resigned, wants
             drags pin to exact wall  need sub-meter precision"  more precision

Collection   Creates "Pilsen 2026"    "If only I could share     Satisfied with
             collection               this as a dataset"         workaround

─────────────────────────────────────────────────────────────────────────
PAIN POINTS: Bulk upload not available | Manual location flow is slow for 8+ posts
OPPORTUNITIES: Batch upload (v1.1) | CSV/GeoJSON export (v1.1) | Neighborhood tags
```

---

#### Priya's Journey — "Share something cool with friends"

```
STAGE        DOING                    THINKING                  FEELING
─────────────────────────────────────────────────────────────────────────
Trigger      Passes mural walking     "My roommate would         Amused, briefly
             to class                 love this"                 attentive

Hesitation   Pulls up MuralMap        "Is this going to take     Impatient, low
                                      forever?"                  commitment

Upload       3 taps: snap, confirm,   "Ok that was actually      Pleasantly
             done — no required       pretty fast"               surprised
             fields

Friends      Post shows in            "She already liked it!"    Socially validated,
Feed         friends' feed                                        happy

Return       Opens app 3 days later   "I wonder what's near      Casually engaged
             to browse map            me right now"

─────────────────────────────────────────────────────────────────────────
PAIN POINTS: Any required field creates abandonment risk | Slow first load = lost user
OPPORTUNITIES: One-tap upload with optional details later | "Near Me" as first CTA
```

---

### 4.2 Critical User Flows

#### Flow 1 — First Mural Upload (New User, Mobile)

```
Entry: User taps "Upload" from nav bar
Goal: Mural post is live on map and feed
Success: Post visible on /map with correct pin

[Tap Upload]
     │
     ├─ Not authenticated → [Sign In/Sign Up] → return to upload
     │
     └─ Authenticated
          │
          ▼
     [Photo Picker]
     │ Camera  │ Library  │ Drag/Drop (desktop)
          │
          ▼
     [EXIF Parse] (async, non-blocking)
     │ GPS found → show pin on map preview
     │ No GPS   → show "Add location?" banner
          │
          ▼
     [Crop / Adjust] (optional — "Skip" available)
          │
          ▼
     [Details Form]
     │ Title (optional) │ Artist (optional) │ Tags │ Visibility
     │ Location preview with edit option
          │
          ▼
     [Submit]
     │ Success → post detail page → "Share" prompt
     │ Failure (offline) → "Save draft?" prompt
```

**UX Notes:**
- The only required input is the photo. All other fields are optional and labeled as such.
- Progress is communicated with a step indicator: Photo → Details → Done (3 steps max).
- Upload progress ring is the primary feedback mechanism during network transfer.

---

#### Flow 2 — Map Discovery → Post View → Favorite

```
Entry: User opens /map
Goal: User favorites a mural they discovered on the map
Success: Mural appears in /favorites

[Map Loads]
     │
     ├─ Clusters visible → tap cluster → zoom in or spider-out
     │
     └─ Individual pin → tap pin → preview card appears
          │ Thumbnail | Title | Uploader | Location | "View Post" link
          │
          ▼
     [Post Detail /post/:id]
     │ Full image | Metadata | Map embed | Comments
          │
          ├─ Tap ♥ → Authenticated: optimistic toggle → sync to server
          │            Not authenticated: redirect to sign-in with return URL
          │
          └─ Tap "Get Directions" → opens native maps app
```

---

#### Flow 3 — Onboarding (First-time User)

```
[Sign Up / OAuth]
     │
     ▼
[Email Confirmation] (email/password only)
     │ Confirmed → continue
     │ Unconfirmed → "Check inbox" screen with Resend option
     │
     ▼
[Profile Creation] (one-time, skippable)
     │ Display name (required if not skipping)
     │ Username with real-time availability check
     │ Avatar (optional)
     │ Bio (optional, 160 chars)
     │ [Skip for now] → sensible defaults applied
     │
     ▼
[Welcome / Feature Primer] (one screen, dismissible)
     │ "Tap the map to explore" | "Upload your first mural" | "Find friends"
     │
     ▼
[Home Feed]
     │ New user empty state: "Be the first to log a mural near you" + Upload CTA

Decision Points:
  - Skipping profile creation: apply defaults, allow editing in Settings later
  - OAuth users: skip email confirmation, go directly to profile creation
```

**UX Notes:**
- Do not prompt for push notification permission during onboarding. Defer to after first mural post (see US-46).
- The "Skip for now" path must never dead-end. Defaults must be applied silently and immediately.
- Welcome primer is a single swipeable card, not a multi-step tour.

---

## 5. Assumptions & Constraints

### Assumptions
- Users have smartphones with cameras capable of capturing GPS metadata
- The majority of users will access MuralMap via mobile browser or installable PWA
- Clerk free tier (10k MAU) and Supabase free tier are sufficient for v1.0 auth and storage needs
- Mapbox or Leaflet geocoding APIs are accessible without significant cost at early scale

### Constraints
- v1.0 is a web app (PWA); native iOS/Android apps are out of scope
- No direct messaging (DM) feature in v1.0
- Moderation is manual in v1.0 (no automated content review)
- Offline functionality is limited to draft saving; map tiles require connectivity

### UX Implications of Constraints
| Constraint | UX Impact | Mitigation |
|---|---|---|
| Web-only (no native app) | Camera access and haptics limited on iOS Safari | Use `input[capture]` for camera; document iOS limitations in onboarding |
| No DMs | Users will try to use comments for private comms | Surface "DMs coming soon" tooltip on any message-like affordance |
| Manual moderation only | Reported content stays visible until reviewed | Show "Report submitted" toast; do not promise immediate action |
| Limited offline | Drafts only; map requires connectivity | Show clear offline banner; disable map with explanation, not silent failure |

---

## 6. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vue 3 + TypeScript |
| **Styling** | TailwindCSS |
| **State Management** | Pinia |
| **Routing** | Vue Router v4 |
| **Authentication** | Clerk (OAuth, email, phone, MFA) |
| **Backend / Database** | Supabase (PostgreSQL, storage, realtime) |
| **Maps** | Leaflet + Leaflet MarkerCluster |
| **Geocoding** | Nominatim (OpenStreetMap) |
| **EXIF Parsing** | exifr (npm) |
| **Image Compression** | browser-image-compression (npm) |
| **Offline Storage** | IndexedDB (via idb or Dexie) |
| **Deployment** | Netlify or Vercel |
| **PWA** | Service Workers + Web App Manifest |
| **HEIC Support** | heic2any (npm) — client-side HEIC → JPEG conversion |
| **Drag & Drop Ordering** | @vueuse/core useDraggable or Vue Draggable Plus |

### Technology Rationale

**Authentication - Clerk:**
- Pre-built, accessible UI components for sign-in/sign-up
- Multiple OAuth providers (Google, GitHub, Apple, Discord, etc.)
- Built-in multi-factor authentication (MFA)
- Email verification and phone OTP out-of-the-box
- Comprehensive user management dashboard
- Webhook support for syncing with Supabase
- Free tier: 10,000 monthly active users

**Database - Supabase:**
- PostgreSQL with PostGIS for geospatial queries
- Row Level Security (RLS) for data access control
- Storage for mural images with CDN
- Realtime subscriptions for notifications
- Free tier: 500MB database, 1GB file storage

---

## 6.1. Clerk + Supabase Integration Architecture

### Authentication Flow

```
┌─────────────┐
│   Browser   │
│  (Vue App)  │
└──────┬──────┘
       │ 1. User signs in
       ▼
┌─────────────┐
│    Clerk    │  ← Handles all authentication
│   (Auth)    │  ← Returns JWT with user_id
└──────┬──────┘
       │ 2. Webhook triggers
       ▼
┌─────────────┐
│   Webhook   │  ← user.created, user.updated
│  Endpoint   │  ← Syncs to Supabase
└──────┬──────┘
       │ 3. Creates/updates user
       ▼
┌─────────────┐
│  Supabase   │  ← Stores user data
│  (Database) │  ← RLS validates Clerk JWT
└─────────────┘
```

### How It Works

1. **User Authentication** (Clerk)
   - User signs in via Clerk (email, OAuth, phone, etc.)
   - Clerk returns JWT with `user_id` (Clerk user ID)
   - Frontend stores session via Clerk's SDK

2. **User Sync** (Webhook)
   - Clerk triggers `user.created` or `user.updated` webhook
   - Webhook endpoint receives Clerk user data
   - Creates/updates record in Supabase `users` table
   - Stores: `clerk_id`, `email`, `username`, `avatar_url`, etc.

3. **Data Access** (Supabase RLS)
   - Frontend includes Clerk JWT in requests to Supabase
   - Supabase RLS policies extract `clerk_id` from JWT claims
   - Policies validate user owns the resource

### Database Schema Changes

The `users` table uses `clerk_id` instead of `auth.users(id)`:

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,  -- Clerk user ID
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT CHECK (char_length(bio) <= 160),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_users_clerk_id ON public.users(clerk_id);
```

### RLS Policy Example

```sql
-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (
  clerk_id = auth.jwt()->>'sub'  -- Clerk user ID from JWT
);
```

### Webhook Security

- Webhooks secured with Clerk's signing secret
- Validates `svix-signature` header
- Prevents unauthorized user creation

---

## 7. App Architecture & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Home / Activity Feed | No (limited) |
| `/discover` | Search & Explore | No |
| `/map` | Full Map Discovery | No |
| `/upload` | Upload a Mural | Yes |
| `/collections` | My Collections | Yes |
| `/collections/:id` | Collection Detail | No (if public) |
| `/favorites` | My Favorites | Yes |
| `/friends` | Friends List & Requests | Yes |
| `/notifications` | Notifications | Yes |
| `/profile/:username` | Public Profile | No |
| `/settings` | Account Settings | Yes |
| `/draft` | Saved Offline Drafts | Yes |
| `/post/:id` | Mural Detail Page | No (if public) |
| `/onboarding` | Profile Creation (first visit) | Yes |

---

## 8. User Stories & Acceptance Criteria

> **Format:** Each story includes a user narrative, acceptance criteria (AC), and edge cases
> where applicable. AC items are written as verifiable, testable conditions.

---

### Epic 1 — Authentication & Identity

> **UX Design Note:** Authentication is a trust-building moment. Clerk handles the heavy
> lifting, but the surrounding experience — error messages, transitions between steps, and
> the onboarding flow that follows — must feel like MuralMap, not a generic auth template.
> Customize Clerk's appearance tokens to match the design system defined in §11.

---

#### US-01 — Email Sign Up

> As a new user, I want to create an account with my email and password so that I can access
> the app and save my mural discoveries.

**Acceptance Criteria:**
- [ ] AC-01: The sign-up form includes fields for email, password, and password confirmation
- [ ] AC-02: Email is validated for proper format before submission; an inline error appears on blur
- [ ] AC-03: Password must be at least 8 characters, contain one uppercase letter, one number,
      and one special character; these rules are shown in a visible checklist below the field
- [ ] AC-04: A password strength meter (Weak / Fair / Strong / Very Strong) updates in real time
      as the user types
- [ ] AC-05: Submitting with a duplicate email shows the error: "An account with this email
      already exists. Try signing in."
- [ ] AC-06: On successful submission, a confirmation email is sent and the user sees a
      "Check your inbox" screen before accessing the app
- [ ] AC-07: Unconfirmed users who attempt to log in are shown a re-send confirmation link
- [ ] AC-08: The form is keyboard-navigable and screen-reader accessible (all inputs have visible
      labels, not just placeholders; error messages linked via `aria-describedby`)
- [ ] AC-09: The "Check your inbox" screen shows the email address submitted and a countdown
      before the "Resend" link becomes active (60 seconds)

**Edge Cases:**
- Disposable email addresses are accepted in v1.0 but flagged for future review
- If the confirmation email is not received within 5 minutes, a "Resend" option is shown

---

#### US-02 — Social Sign In (Google, Apple, GitHub, Discord)

> As a user, I want to sign in with my social accounts so that I don't have to manage
> a separate password.

**Acceptance Criteria:**
- [ ] AC-01: OAuth buttons for Google, Apple, GitHub, and Discord are visible on both the
      sign-in and sign-up screens using Clerk's pre-built components
- [ ] AC-02: Clicking any OAuth button initiates the authentication flow via Clerk
- [ ] AC-03: On first login via OAuth, a new user account is created in Clerk with the display name and
      avatar pulled from the OAuth provider
- [ ] AC-04: Clerk webhook creates corresponding user record in Supabase `users` table
- [ ] AC-05: On subsequent logins, the user is authenticated and returned to the page they were
      on when they initiated sign-in (or the home feed if no referrer)
- [ ] AC-06: If an email address from OAuth already exists as an email/password account, Clerk
      links the accounts automatically (no duplicate accounts)
- [ ] AC-07: OAuth errors (e.g., user cancelled) surface a friendly message via Clerk's error handling
- [ ] AC-08: User's Clerk ID is stored in Supabase for data association

---

#### US-03 — Phone Number Sign In (OTP)

> As a user, I want to sign in with my phone number via OTP so that I have a passwordless
> login option.

**Acceptance Criteria:**
- [ ] AC-01: A "Sign in with Phone" option is available on the sign-in screen
- [ ] AC-02: User enters a phone number with country code selector; number is validated on blur
- [ ] AC-03: On submit, an SMS OTP is sent and the user is shown a 6-digit input screen
- [ ] AC-04: Each digit field auto-advances focus to the next field on input
- [ ] AC-05: Pasting a 6-digit code auto-fills all fields
- [ ] AC-06: A 60-second countdown timer is shown; "Resend code" is disabled until the timer
      reaches zero
- [ ] AC-07: OTP expires after 10 minutes; an expired-code error prompts the user to request
      a new one
- [ ] AC-08: Three consecutive failed OTP attempts lock the form for 5 minutes with a visible
      countdown

---

#### US-04 — Password Reset

> As a user, I want to reset my password via email so that I can regain access if I forget it.

**Acceptance Criteria:**
- [ ] AC-01: A "Forgot password?" link on the sign-in screen leads to a password reset form
- [ ] AC-02: User enters their registered email; submitting shows a confirmation message
      regardless of whether the email exists (to prevent enumeration)
- [ ] AC-03: A password reset email is sent within 30 seconds if the email is registered
- [ ] AC-04: The reset link expires after 1 hour; expired links show a clear message with an
      option to request a new link
- [ ] AC-05: After a successful reset, the user is redirected to the sign-in page with a
      success toast

---

#### US-05 — Profile Creation (Onboarding)

> As a new user, I want to set up my profile with a display name, avatar, and bio so that
> others can identify me.

**Acceptance Criteria:**
- [ ] AC-01: After email confirmation or first OAuth login, users are routed to `/onboarding`
      before reaching the main feed; this route is protected from direct access by returning
      users
- [ ] AC-02: The screen includes fields for: display name (required), username (required),
      avatar (optional), and bio (optional)
- [ ] AC-03: Username field performs a real-time availability check with a 400ms debounce;
      a green check or red X is shown next to the field
- [ ] AC-04: Username allows only letters, numbers, underscores, and hyphens (3–30 characters);
      inline validation error text reads: "3–30 characters; letters, numbers, _ and - only"
- [ ] AC-05: Bio is limited to 160 characters with a live character counter below the field
- [ ] AC-06: Avatar upload opens a crop/resize tool; the cropped result is previewed before saving
- [ ] AC-07: A "Skip for now" option applies sensible defaults: auto-generated avatar (based
      on initials), username derived from email prefix with a random suffix to ensure uniqueness
- [ ] AC-08: Submitting the form with a taken username shows an inline error and does not proceed
- [ ] AC-09: A single-screen welcome primer follows profile creation — swipeable cards for
      "Explore the map," "Upload a mural," and "Find friends" — dismissed by tapping "Get Started"
- [ ] AC-10: Push notification permission is NOT requested during onboarding

---

#### US-06 — Profile Update

> As a logged-in user, I want to edit my profile information so that I can keep my details
> current.

**Acceptance Criteria:**
- [ ] AC-01: The Settings page includes a profile edit form pre-filled with existing values
- [ ] AC-02: All fields (display name, username, bio, avatar) are editable
- [ ] AC-03: Username availability check runs again on change; taken usernames show an error
- [ ] AC-04: Avatar change shows an instant preview before the user clicks Save
- [ ] AC-05: On save, a success toast appears within 1 second
- [ ] AC-06: The profile header in the app reflects changes immediately (optimistic update)
- [ ] AC-07: If the save fails, the form reverts to its previous values and shows an error toast

---

#### US-07 — Account Deletion

> As a user, I want to permanently delete my account so that my data is removed from the
> platform.

**Acceptance Criteria:**
- [ ] AC-01: Account deletion is accessible only from the Settings page, under a "Danger Zone"
      section visually separated from other settings with a border and a destructive color label
- [ ] AC-02: Clicking "Delete Account" opens a confirmation modal explaining what will be deleted
      (posts, comments, collections, favorites, friend connections)
- [ ] AC-03: The modal requires the user to type "delete my account" exactly before the confirm
      button becomes active
- [ ] AC-04: On confirm, all of the user's data is scheduled for cascade deletion
- [ ] AC-05: A 30-day grace period is applied; during this period the account is deactivated,
      not deleted, and a cancellation link is emailed to the user
- [ ] AC-06: The user is immediately signed out and redirected to the home/landing page
- [ ] AC-07: During the grace period, attempting to sign in shows a "Your account is scheduled
      for deletion" message with a reactivation option

---

### Epic 2 — Mural Photo Upload & Management

> **UX Design Note:** Upload is MuralMap's core action — the "write" side of the loop.
> The upload flow must feel fast, forgiving, and low-commitment. No required fields other
> than the photo itself. Every friction point (location missing, no title) should be handled
> gracefully with a sensible default, not a blocking error. Target: a user can go from tapping
> "Upload" to having a post live on the map in under 90 seconds on a 4G connection.

---

#### US-08 — Upload a Mural Photo

> As a user, I want to upload a photo of a mural I photographed so that I can log and share
> my discovery.

**Acceptance Criteria:**
- [ ] AC-01: Upload accepts JPG, PNG, HEIC, and WebP formats; HEIC is converted to JPEG
      client-side via `heic2any`; other formats show a clear error with the accepted list
- [ ] AC-02: Maximum file size is 20MB; files exceeding this show an error before upload begins
- [ ] AC-03: Files are compressed client-side using browser-image-compression before upload,
      targeting ≤ 2MB while preserving EXIF data
- [ ] AC-04: A circular progress indicator shows upload completion percentage
- [ ] AC-05: Drag-and-drop is supported on desktop (with a visible, animated drop zone on hover)
- [ ] AC-06: Tapping the upload area on mobile opens the native camera or photo library picker
      via `<input type="file" accept="image/*" capture="environment">`
- [ ] AC-07: If upload fails due to connectivity, the user is offered the option to save as draft
- [ ] AC-08: Only authenticated users can access the upload route; unauthenticated users are
      redirected to sign-in with a return URL parameter

---

#### US-09 — Crop and Adjust Photo Before Upload

> As a user, I want to crop and adjust my photo before submitting so that I can present the
> mural at its best.

**Acceptance Criteria:**
- [ ] AC-01: After photo selection, a crop/adjust screen is shown before the details form
- [ ] AC-02: Crop tool offers aspect ratio presets: 1:1, 4:3, 16:9, and Free
- [ ] AC-03: Brightness and contrast sliders each have a range of -50 to +50 with a default
      of 0; changes apply in real time to the preview
- [ ] AC-04: A "Reset" button returns all adjustments to their defaults
- [ ] AC-05: All adjustments are applied client-side before upload; the modified image (not
      the original) is sent to storage
- [ ] AC-06: "Skip" bypasses crop/adjust and proceeds directly to the details form

---

#### US-10 — Add Mural Details

> As a user, I want to add a title, artist name, and description to my mural photo so that
> others have context.

**Acceptance Criteria:**
- [ ] AC-01: The details form includes: title (optional, max 80 chars), artist name (optional,
      max 100 chars), description (optional, max 500 chars), tags, and visibility
- [ ] AC-02: Character limits are enforced with a live counter below each field; the counter
      turns accent-red at 90% of the limit
- [ ] AC-03: Tags field displays suggested chips (e.g., "abstract", "portrait", "typography",
      "large-scale", "black-and-white") that can be tapped to add without typing
- [ ] AC-04: Custom tags can be typed and added with Enter or comma; duplicates are silently
      ignored; max 10 tags per post
- [ ] AC-05: Visibility toggle defaults to "Public"; "Friends Only" sets the `visibility`
      field to `friends`; toggle state is communicated with both color and icon (globe / lock)
- [ ] AC-06: The only required field to submit is the photo; all detail fields are optional;
      this is communicated by labeling optional fields explicitly: "(optional)"
- [ ] AC-07: Submitting without a title auto-generates a placeholder: "Untitled Mural —
      [City, Date]" using the location and upload date; if no location, uses upload date only

---

#### US-11 — Edit a Mural Post

> As a user, I want to edit the details of a mural I've posted so that I can correct mistakes
> or add new info.

**Acceptance Criteria:**
- [ ] AC-01: An "Edit" option appears in the kebab menu on the user's own posts only
- [ ] AC-02: The edit form is pre-filled with all existing values (title, artist, description,
      tags, visibility)
- [ ] AC-03: The original photo cannot be changed via the edit form; a label reads:
      "To change the photo, create a new post" with no affordance to change the image inline
- [ ] AC-04: Saving changes updates the post immediately (optimistic update)
- [ ] AC-05: An "Edited" label with the `edited_at` timestamp appears below the post after
      any edit is saved (muted color, small type size)
- [ ] AC-06: Cancelling the edit form with unsaved changes shows a "Discard changes?" prompt
      with "Keep editing" and "Discard" options

---

#### US-12 — Delete a Mural Post

> As a user, I want to delete a mural post so that I can remove content I no longer want
> shared.

**Acceptance Criteria:**
- [ ] AC-01: A "Delete" option appears in the kebab menu on the user's own posts only
- [ ] AC-02: Clicking Delete opens a confirmation dialog: "Delete this mural? This cannot be
      undone."
- [ ] AC-03: On confirm, the post is immediately removed from the feed, the user's profile,
      all collections it belonged to, and all favorites
- [ ] AC-04: The post's image is deleted from Supabase Storage as part of the delete operation
- [ ] AC-05: Navigating directly to the post's URL after deletion returns a 404-style "Mural
      not found" page with a link back to the feed
- [ ] AC-06: Deletion is permanent and irreversible; no grace period

---

### Epic 3 — Collections

> **UX Design Note:** Collections are MuralMap's curation layer. They should feel like
> personal galleries, not folder systems. The collection cover photo is critical — it's
> the visual identity of the collection in feeds and profile views. Prioritize making cover
> selection easy and visually rewarding.

---

#### US-13 — Create a Collection

> As a user, I want to create named collections so that I can organize my mural photos
> thematically.

**Acceptance Criteria:**
- [ ] AC-01: An authenticated user can create a collection from the `/collections` page via
      a "New Collection" button
- [ ] AC-02: The creation form requires a name (max 80 chars) and accepts an optional
      description (max 300 chars)
- [ ] AC-03: A URL-safe slug is auto-generated from the name; the user can customize it;
      slug validation runs on blur with a 400ms debounce
- [ ] AC-04: On creation, the new collection appears at the top of the collections list
- [ ] AC-05: The cover photo is automatically assigned when the first mural is added; it
      can be manually changed afterward
- [ ] AC-06: An empty collection shows an illustrated empty state with a "Add your first
      mural" CTA that links to the upload flow

---

#### US-14 — Add a Photo to a Collection

> As a user, I want to add any mural photo to one or more collections so that I can keep
> my discoveries organized.

**Acceptance Criteria:**
- [ ] AC-01: An "Add to Collection" option is available in the kebab menu of any mural post
      the logged-in user can see
- [ ] AC-02: A bottom sheet (mobile) or modal (desktop) appears with a list of the user's
      existing collections, each with a checkbox and thumbnail
- [ ] AC-03: Previously added collections are pre-checked; unchecking removes the mural from
      that collection
- [ ] AC-04: A "New Collection" inline option at the bottom of the list allows creation
      without leaving the picker
- [ ] AC-05: A mural can belong to multiple collections simultaneously
- [ ] AC-06: The collection's cover photo is set to this mural if it is the first item added
- [ ] AC-07: Changes are saved on "Done"; a success toast confirms the update

---

#### US-15 — View a Collection

> As a user, I want to browse a collection in a grid or list view so that I can see all
> photos in that group.

**Acceptance Criteria:**
- [ ] AC-01: The collection detail page at `/collections/:id` shows the name, description,
      photo count, and cover image in a full-width hero
- [ ] AC-02: Photos are displayed in a masonry grid by default
- [ ] AC-03: A view toggle switches between grid and list view; preference is persisted in
      localStorage
- [ ] AC-04: Sort options available: Date Added (default), Title (A–Z), Most Favorited
- [ ] AC-05: Public collections are accessible without authentication; friend-only posts
      within a collection are hidden for non-friends and replaced with a blurred placeholder

---

#### US-16 — Reorder Photos in a Collection

> As a user, I want to drag-and-drop photos to reorder them within a collection so that I
> can curate the experience.

**Acceptance Criteria:**
- [ ] AC-01: An "Edit Order" mode is toggled from the collection detail page's action menu
- [ ] AC-02: In edit mode, each photo card shows a visible drag handle icon in the top-left
      corner
- [ ] AC-03: Dragging and dropping a card updates its position within the grid in real time
- [ ] AC-04: On mobile, long-press (300ms hold) activates drag mode for a card; a subtle
      haptic pulse fires on activation (via `navigator.vibrate(50)`, feature-detected)
- [ ] AC-05: The new order is persisted to the database on a "Save Order" button press; a
      loading state is shown during save
- [ ] AC-06: "Cancel" exits edit mode and reverts to the last saved order without a confirm
      prompt (reorder state is transient until saved)

---

#### US-17 — Edit or Delete a Collection

> As a user, I want to rename or delete a collection so that I can manage my organization
> structure.

**Acceptance Criteria:**
- [ ] AC-01: An "Edit Collection" option in the collection action menu opens a form with the
      existing name, slug, and description pre-filled
- [ ] AC-02: Saving a name change updates the collection header immediately and regenerates
      the slug (with a warning if it was custom: "This will change your collection's URL")
- [ ] AC-03: A "Delete Collection" option is in the same menu, visually separated with a
      divider and styled in the destructive color (`--color-danger`)
- [ ] AC-04: Deleting a collection shows a confirmation: "Delete '[Name]'? Photos inside will
      not be deleted."
- [ ] AC-05: On confirm, the collection is removed and the user is redirected to `/collections`
- [ ] AC-06: Murals previously in the deleted collection remain on the user's profile and in
      any other collections they were added to

---

### Epic 4 — Favorites

> **UX Design Note:** The heart/favorite interaction is MuralMap's most frequent micro-interaction.
> It must feel satisfying — the pulse animation and color fill are non-negotiable. Avoid
> spinners or loading states; optimistic updates only. The visual weight of the heart icon
> should be prominent enough to be tapped accurately on mobile (minimum 44×44px touch target).

---

#### US-18 — Favorite a Mural

> As a user, I want to favorite any mural photo so that I can quickly find ones I love.

**Acceptance Criteria:**
- [ ] AC-01: A heart icon is visible on every mural card and on the mural detail page
- [ ] AC-02: Tapping the heart icon toggles the favorite state immediately (optimistic update)
      — no loading spinner is shown
- [ ] AC-03: The heart icon fills in (solid, `--color-accent-red`) when favorited and is
      outlined (`--color-text-muted`) when not
- [ ] AC-04: A pulse + scale animation plays on the heart icon on toggle: scale from 1 → 1.3 →
      1 over 300ms with cubic-bezier easing; color fills simultaneously
- [ ] AC-05: The favorite count displayed on the card updates to reflect the new total
- [ ] AC-06: If the user is not authenticated, tapping the heart redirects to sign-in with
      a return URL
- [ ] AC-07: The server syncs the favorite state in the background; if the sync fails, the
      optimistic update is rolled back and an error toast is shown at the bottom center

---

#### US-19 — View Favorites Page

> As a user, I want a dedicated Favorites page so that I can see all my saved murals in one
> place.

**Acceptance Criteria:**
- [ ] AC-01: `/favorites` is accessible only to authenticated users
- [ ] AC-02: All favorited murals are displayed in a masonry grid matching the main feed style
- [ ] AC-03: Each card includes the heart icon in its active (filled) state; tapping it
      un-favorites the mural and removes it from the page with a smooth collapse animation
- [ ] AC-04: Sort options: Date Favorited (default), City/Location (A–Z), Artist (A–Z)
- [ ] AC-05: An illustrated empty state is shown when no favorites exist, with a CTA linking
      to `/discover`; copy reads: "Nothing saved yet. Find a mural worth keeping."
- [ ] AC-06: Skeleton cards are shown during data loading, not a spinner

---

### Epic 5 — Geolocation & Map

> **UX Design Note:** Location is MuralMap's differentiator. The map view is what makes
> MuralMap more than Instagram. Leaflet with MarkerCluster is the implementation — but the
> experience goal is "treasure map," not "corporate dashboard." Map pins styled as photo
> thumbnails (not teardrops), smooth clustering, and a fast "Near Me" CTA are the three
> elements that make this feel intentional. The map must load within 2 seconds; skeleton the
> UI before tiles arrive rather than showing a blank gray rectangle.

---

#### US-20 — Auto-Extract Location from Photo

> As a user, I want the app to read the GPS metadata from my photo so that the mural location
> is captured automatically.

**Acceptance Criteria:**
- [ ] AC-01: On file selection, EXIF data is parsed client-side using `exifr` before upload
      begins
- [ ] AC-02: If GPS coordinates are found, they are displayed on a small embedded map preview
      in the upload form with a pin at the detected location
- [ ] AC-03: The user can adjust the auto-detected pin if needed by tapping "Change Location"
- [ ] AC-04: If no GPS data is found, a dismissible warning banner appears: "No location found
      in this photo. Add one manually?" with an "Add Location" action button
- [ ] AC-05: Coordinates (lat, lng) are stored with the post on submission
- [ ] AC-06: EXIF parsing does not block the upload UI; it runs asynchronously and the UI is
      available immediately after file selection

---

#### US-21 — Manually Enter Location

> As a user, I want to search for and pin a location on a map if my photo has no GPS data so
> that I can still log where the mural is.

**Acceptance Criteria:**
- [ ] AC-01: A location search input with address autocomplete is shown when GPS data is
      absent or when the user taps "Change Location"
- [ ] AC-02: Autocomplete results appear within 500ms of the user stopping typing (debounced
      at 400ms)
- [ ] AC-03: Selecting a result drops a pin on the embedded map at that location with a
      spring animation
- [ ] AC-04: The pin is draggable for precise placement; the coordinates displayed below the
      map update in real time as the pin is moved
- [ ] AC-05: Coordinates are finalized when the user taps "Use this location"
- [ ] AC-06: Leaving the location blank is allowed; a "No location" state is stored and the
      post will not appear on the map; the upload form communicates this: "This mural won't
      appear on the map without a location"

---

#### US-22 — View Mural on Map (Detail Page)

> As a user, I want to see where a specific mural was taken on an embedded map so that I can
> find it in person.

**Acceptance Criteria:**
- [ ] AC-01: The mural detail page at `/post/:id` includes an embedded map showing a single
      pin at the mural's coordinates (if location data exists)
- [ ] AC-02: The map is non-interactive (static) by default to preserve page performance;
      a "Tap to interact" overlay with lock icon activates full interactivity on tap
- [ ] AC-03: Tapping "Get Directions" opens Google Maps (Android/web) or Apple Maps (iOS)
      with the mural's coordinates as the destination, detected via user agent
- [ ] AC-04: If no location data exists, the map section is hidden and replaced with a "No
      location recorded" message with a map-outline illustration
- [ ] AC-05: The map tile loads lazily (via IntersectionObserver) to avoid blocking page render

---

#### US-23 — Map Discovery View

> As a user, I want a full map view showing all logged murals as pins so that I can explore
> by location.

**Acceptance Criteria:**
- [ ] AC-01: The `/map` route renders a full-viewport map with pins for all public murals
      that have location data
- [ ] AC-02: Pins cluster automatically when more than 3 pins are within a defined radius;
      clusters show a count badge styled with the app's accent color
- [ ] AC-03: Tapping a cluster zooms in or expands to show individual pins (spider-out pattern
      for very dense areas via Leaflet.markercluster)
- [ ] AC-04: Tapping a single pin opens a preview card showing the mural photo thumbnail,
      title, uploader avatar, and a "View Post" link
- [ ] AC-05: Tag and collection filter chips are available in a scrollable strip above the map;
      applying a filter updates the visible pins in real time
- [ ] AC-06: A "Near Me" button centers the map on the user's current geolocation (prompts
      for browser permission if not granted; shows a primer explaining why before the browser
      prompt fires)
- [ ] AC-07: The map renders a loading skeleton (gray tile grid) during initialization; tiles
      fill in progressively as they load
- [ ] AC-08: A bottom sheet on mobile and a left panel on desktop show a list of visible
      murals on the current map viewport, updated on pan/zoom

---

#### US-24 — Radius Search

> As a user, I want to search for murals within a certain distance from a location so that
> I can plan a mural walk.

**Acceptance Criteria:**
- [ ] AC-01: A "Radius Search" panel is accessible from the map view via a filter icon
- [ ] AC-02: The user can set a center point by searching an address or using their current
      location
- [ ] AC-03: A radius slider ranges from 0.25 mi to 10 mi in 0.25 mi increments
- [ ] AC-04: A visual radius circle is drawn on the map; pins outside the radius are dimmed
      at 30% opacity
- [ ] AC-05: A side list panel (desktop) or bottom sheet (mobile) shows all murals within
      the radius, sorted by distance (closest first), with walking distance estimates
- [ ] AC-06: A "Share this walk" button generates a shareable URL encoding the center point
      and radius as query parameters

---

### Epic 6 — Comments

> **UX Design Note:** Comments should feel like a conversation around a piece of art — not
> a social media firehose. Limit default visible comments to 5 with a "Load more" option.
> Friend comments are visually distinguished. @mentions drive re-engagement. Keep the comment
> input always accessible at the bottom of the detail page, above the keyboard on mobile.

---

#### US-25 — Comment on a Mural

> As a user, I want to leave a comment on any mural photo so that I can share reactions or
> information.

**Acceptance Criteria:**
- [ ] AC-01: A comment input is fixed at the bottom of the mural detail page for authenticated
      users; non-authenticated users see a "Sign in to comment" prompt styled as a secondary button
- [ ] AC-02: Comments are limited to 500 characters with a live counter
- [ ] AC-03: Submitting a comment adds it to the thread immediately (optimistic update) with
      the user's avatar and display name
- [ ] AC-04: Timestamps are shown in relative format ("2 hours ago"); long-pressing or hovering
      shows the full date/time in a tooltip
- [ ] AC-05: If comment submission fails, the optimistic update is rolled back and an inline
      error appears below the failed comment with a "Retry" link
- [ ] AC-06: The first 5 comments are visible by default; a "See all X comments" link
      fetches the full thread; subsequent pages load 20 at a time

---

#### US-26 — @Mention a User in a Comment

> As a user, I want to @mention another user in a comment so that they are notified.

**Acceptance Criteria:**
- [ ] AC-01: Typing "@" in the comment input triggers a dropdown autocomplete of friends and
      recent commenters on the post
- [ ] AC-02: Autocomplete results appear within 300ms; results can be navigated with arrow
      keys and selected with Enter or Tab
- [ ] AC-03: The selected mention is inserted into the comment text as "@username" and rendered
      as a styled, tappable chip after submission (accent color, slightly bold)
- [ ] AC-04: Tapping a mention chip navigates to that user's profile
- [ ] AC-05: The mentioned user receives a notification of type `mention`
- [ ] AC-06: Mentioning a user who has blocked the commenter is silently ignored (no notification
      sent, no visual difference in the mention chip)

---

#### US-27 — React to a Comment

> As a user, I want to react to a comment with an emoji so that I can respond without writing
> a reply.

**Acceptance Criteria:**
- [ ] AC-01: A reaction button (smiley face icon) appears on hover (desktop) or long-press
      (mobile, 300ms) of any comment
- [ ] AC-02: A picker shows 6 preset reactions (👍 ❤️ 😂 😮 😢 🔥) plus an option to open
      a full emoji picker
- [ ] AC-03: Tapping a reaction adds it to the comment; tapping the same reaction again removes
      it (toggle)
- [ ] AC-04: Reaction counts are displayed below the comment, grouped by emoji in horizontal
      pills
- [ ] AC-05: The user's active reaction pill has a filled background (accent color at 20%
      opacity with a colored border)
- [ ] AC-06: Each user can have one reaction per emoji per comment; switching reactions replaces
      the previous one

---

#### US-28 — Edit My Comment

> As a user, I want to edit a comment I've made so that I can fix errors or update my thoughts.

**Acceptance Criteria:**
- [ ] AC-01: An "Edit" option appears in the kebab menu on comments authored by the logged-in
      user
- [ ] AC-02: Selecting Edit replaces the comment text with an inline editable input pre-filled
      with the original comment; the input receives focus immediately
- [ ] AC-03: Saving the edit updates the comment text immediately and shows an "Edited" label
      in a muted color beside the timestamp
- [ ] AC-04: Pressing Escape or tapping "Cancel" restores the original comment with no changes

---

#### US-29 — Delete My Comment

> As a user, I want to delete one of my comments so that I can remove something I no longer
> want posted.

**Acceptance Criteria:**
- [ ] AC-01: A "Delete" option appears in the kebab menu on comments authored by the logged-in
      user
- [ ] AC-02: A confirmation prompt appears: "Delete this comment? This cannot be undone."
- [ ] AC-03: On confirm, the comment is removed from the thread immediately with a collapse
      animation
- [ ] AC-04: Reactions attached to the deleted comment are also deleted

---

#### US-30 — View Friend Comments Filter

> As a user, I want to filter comments to show only those from my friends so that I can follow
> conversations within my network.

**Acceptance Criteria:**
- [ ] AC-01: A "Friends Only" toggle appears above the comment thread
- [ ] AC-02: When toggled on, only comments by users in the logged-in user's friends list are
      shown
- [ ] AC-03: Friend avatars are visually distinguished by a 2px ring in `--color-accent` color
- [ ] AC-04: The filter state is not persisted between page views (resets to off on navigation)
- [ ] AC-05: If no friend comments exist, an empty state reads: "None of your friends have
      commented yet." with an option to toggle back to all comments

---

### Epic 7 — Friends & Social

> **UX Design Note:** The social layer should feel like a tight-knit community, not a
> follower-count game. Mutual friend count surfaces shared context and warms cold connections.
> The "Message" button exists in v1.0 but is visibly disabled with a "coming soon" tooltip —
> this sets an expectation without creating dead ends.

---

#### US-31 — Search for Users

> As a user, I want to search for other users by name or username so that I can find people
> I know.

**Acceptance Criteria:**
- [ ] AC-01: A user search input is available on the `/discover` and `/friends` pages
- [ ] AC-02: Search is debounced at 300ms; results appear below the input as a list
- [ ] AC-03: Each result shows the user's avatar, display name, username, and mutual friend
      count (if any)
- [ ] AC-04: Tapping a result navigates to that user's public profile at `/profile/:username`
- [ ] AC-05: An illustrated "No results" state appears when the query matches no users;
      copy reads: "No one found. Check the spelling or try a username."
- [ ] AC-06: The user's own account is never returned in search results

---

#### US-32 — Send a Friend Request

> As a user, I want to send a friend request to another user so that we can connect.

**Acceptance Criteria:**
- [ ] AC-01: An "Add Friend" button is displayed on user profiles where no friendship exists
- [ ] AC-02: Clicking "Add Friend" immediately changes the button to "Request Sent" (optimistic
      update); the button is disabled to prevent duplicate requests
- [ ] AC-03: The recipient receives a notification of type `friend_request`
- [ ] AC-04: A "Cancel Request" option replaces "Request Sent" and, when clicked, revokes the
      pending request after a confirmation prompt
- [ ] AC-05: Once accepted, the button state changes to "Friends ✓" with an unfriend option
      in a kebab menu
- [ ] AC-06: A user cannot send a friend request to themselves (the "Add Friend" button is
      replaced with "This is you" on the user's own profile)

---

#### US-33 — Accept or Decline a Friend Request

> As a user, I want to accept or decline incoming friend requests so that I control who is in
> my network.

**Acceptance Criteria:**
- [ ] AC-01: Incoming friend requests appear on the `/friends` page under an "Incoming Requests"
      section at the top
- [ ] AC-02: A notification badge on the nav Friends icon shows the count of pending requests
- [ ] AC-03: Each request shows the requester's avatar, name, and mutual friend count
- [ ] AC-04: "Accept" (primary) and "Decline" (secondary/text) buttons are shown per request
- [ ] AC-05: Accepting a request creates a bidirectional friendship; the requester receives a
      `friend_accepted` notification; the accepted card slides out with a smooth transition
- [ ] AC-06: Declining removes the request silently; the declined user is not notified; the
      card is removed from the list

---

#### US-34 — Remove a Friend

> As a user, I want to remove someone from my friends list so that I can manage my connections.

**Acceptance Criteria:**
- [ ] AC-01: An "Unfriend" option appears in the kebab menu on a friend's profile page and
      in the Friends list
- [ ] AC-02: A confirmation prompt appears before removal: "Remove [Name] from friends?"
- [ ] AC-03: On confirm, the friendship is removed from both users' friends lists immediately
- [ ] AC-04: The removed user's profile reverts to showing an "Add Friend" button for the
      initiating user
- [ ] AC-05: The removed user is not sent any notification

---

#### US-35 — View a Friend's Profile

> As a user, I want to view a friend's profile and their public mural posts so that I can
> follow their discoveries.

**Acceptance Criteria:**
- [ ] AC-01: Navigating to `/profile/:username` shows the user's avatar, display name,
      username, bio, post count, and friend count
- [ ] AC-02: For authenticated friends, friend-only posts are visible; for non-friends or
      unauthenticated visitors, only public posts are shown
- [ ] AC-03: Public collections are listed in a section below the post grid
- [ ] AC-04: A mutual friend count ("3 mutual friends") is shown for users who share
      mutual connections, with a tap-to-view list
- [ ] AC-05: A "Message" button is present but disabled in v1.0 with a tooltip:
      "Direct messaging coming soon" on hover/long-press

---

#### US-36 — Friends-Only Post Visibility

> As a user, I want to set a mural post to "friends only" visibility so that strangers cannot
> view it.

**Acceptance Criteria:**
- [ ] AC-01: The upload form and edit form include a visibility toggle: "Public" (globe icon) /
      "Friends Only" (lock icon)
- [ ] AC-02: Default visibility is "Public"
- [ ] AC-03: Friend-only posts are excluded from the public home feed, map pins (for
      non-friends), and search results for non-friends
- [ ] AC-04: A lock icon is displayed on friend-only post thumbnails in the user's own profile
      view and in friend feeds
- [ ] AC-05: Direct navigation to a friend-only post URL by a non-friend returns a
      "You don't have access to this post" message with a prompt to sign in (if unauthenticated)
      or context that the post is friends-only (if authenticated but not a friend)

---

### Epic 8 — Discovery & Search

> **UX Design Note:** Discovery is the "read" side of MuralMap's loop. The Discover page
> competes with the map for users who want to explore without moving. Prioritize visual
> scanning — large thumbnails, meaningful tag chips, and trending content that proves the
> community is active. Search results should be organized by type (Murals / Artists / Tags /
> Users) with a unified entry point.

---

#### US-37 — Global Search

> As a user, I want to search for murals, artists, tags, or users from a single search bar
> so that I can find anything quickly.

**Acceptance Criteria:**
- [ ] AC-01: A search bar is prominently placed on the `/discover` page with placeholder text:
      "Search murals, artists, tags, or people…"
- [ ] AC-02: Results are organized into tabs: Murals, Artists, Tags, Users
- [ ] AC-03: Typing triggers results after 300ms debounce; each tab shows up to 5 preview
      results with a "See all" link
- [ ] AC-04: Recent searches (up to 10) are saved in localStorage and shown below the input
      on focus before the user types; each item can be individually dismissed
- [ ] AC-05: A "Clear recent searches" option removes all local history
- [ ] AC-06: Search results respect post visibility (friend-only posts excluded for non-friends)

---

#### US-38 — Filter Feed by Tag

> As a user, I want to filter the home feed and map by mural tags so that I can browse a
> specific aesthetic.

**Acceptance Criteria:**
- [ ] AC-01: A horizontally scrollable row of tag chips appears above the feed and map;
      the row has no visible scrollbar but is swipeable
- [ ] AC-02: Tapping a chip filters the feed/map to show only posts with that tag
- [ ] AC-03: Multiple tags can be active simultaneously; results show posts matching any
      selected tag (OR logic)
- [ ] AC-04: Active tag chips are visually highlighted (filled `--color-accent` background,
      white text vs outlined with muted text)
- [ ] AC-05: Tapping an active chip deselects it; if no chips are active, all posts are shown
- [ ] AC-06: Active filters persist through the current session but reset on page refresh;
      an active filter count badge ("2 filters") appears on the filter icon when filters are on

---

#### US-39 — Trending Murals

> As a user, I want to see which murals are trending this week so that I can discover popular
> finds.

**Acceptance Criteria:**
- [ ] AC-01: A "Trending This Week" section is displayed on the `/discover` page with a
      section heading and a "🔥" icon
- [ ] AC-02: Trending is calculated by the sum of favorites and comments received in the past
      7 days
- [ ] AC-03: The top 12 murals by trending score are shown in a horizontally scrollable card
      rail (not a grid, to differentiate visually from the standard feed)
- [ ] AC-04: The trending list is recalculated once daily (via a Supabase scheduled function
      or edge function)
- [ ] AC-05: Each trending card shows the mural photo, title, location, and trending metric
      (e.g., "42 favorites this week")

---

### Epic 9 — Recommended Features

---

#### US-40 — In-App Notifications

> As a user, I want in-app notifications so that I stay informed of activity on my posts.

**Acceptance Criteria:**
- [ ] AC-01: A bell icon in the primary navigation shows a badge with unread notification count
      (max display: 99+)
- [ ] AC-02: The `/notifications` page lists all notifications in reverse-chronological order
- [ ] AC-03: Notification types supported: `like`, `comment`, `mention`, `friend_request`,
      `friend_accepted`
- [ ] AC-04: Unread notifications have a subtle background tint (`--color-surface-elevated`);
      read notifications have a plain background
- [ ] AC-05: Tapping a notification marks it as read and navigates to the relevant post,
      comment, or profile
- [ ] AC-06: A "Mark all as read" action is available at the top of the page; it clears all
      unread badges immediately
- [ ] AC-07: Multiple notifications of the same type within 1 hour are grouped: "Maya and
      3 others liked your mural" — individual notifications are expandable
- [ ] AC-08: Realtime updates via Supabase Realtime; the badge count updates without a page
      refresh

---

#### US-41 — Activity Feed (Friends)

> As a user, I want a feed of what my friends have recently posted or favorited so that I can
> discover murals through my network.

**Acceptance Criteria:**
- [ ] AC-01: The home page (`/`) shows a reverse-chronological activity feed
- [ ] AC-02: Feed items include: friend's avatar, display name, action verb ("posted",
      "favorited"), mural thumbnail, location, and time
- [ ] AC-03: A toggle switches between "Friends" feed and "Global" (all public murals) feed;
      the toggle is a segmented control with "Friends" and "Explore" labels
- [ ] AC-04: The global ("Explore") feed is shown as default for unauthenticated users;
      authenticated users default to the Friends feed if they have friends, otherwise Explore
- [ ] AC-05: Infinite scroll loads more items as the user scrolls; a loading skeleton appears
      at the bottom (3 skeleton cards)
- [ ] AC-06: A "New posts available" banner appears at the top when new items are added while
      the user is viewing the feed (via Realtime); tapping it scrolls to the top and loads new
      items

---

#### US-42 — Share a Mural

> As a user, I want to share a mural post via a public link so that I can show non-users what
> I found.

**Acceptance Criteria:**
- [ ] AC-01: A "Share" button (share icon) is available on every public mural post
- [ ] AC-02: On desktop, clicking "Share" copies the post URL to the clipboard and shows a
      "Link copied!" toast (bottom-center, 4 seconds)
- [ ] AC-03: On mobile, clicking "Share" triggers the native Web Share API sheet if supported;
      falls back to clipboard copy with toast if not
- [ ] AC-04: The shared URL renders Open Graph metadata (og:title, og:image, og:description)
      for rich link previews in messaging apps and social media; og:image uses the mural photo
- [ ] AC-05: Friend-only posts do not show the Share button; the share icon is hidden entirely
      (not disabled/grayed)

---

#### US-43 — Dark Mode

> As a user, I want a dark mode option so that I can browse comfortably at night.

**Acceptance Criteria:**
- [ ] AC-01: The app respects the user's system color scheme preference (`prefers-color-scheme`)
      by default on first load
- [ ] AC-02: A manual toggle in Settings overrides the system preference; options are
      "Light," "Dark," and "System"
- [ ] AC-03: The preference is saved to the user's Supabase profile and synced across devices
      when authenticated; anonymous users use localStorage
- [ ] AC-04: Color contrast meets WCAG 2.1 AA standards in both light and dark modes (minimum
      4.5:1 for body text, 3:1 for large text and UI components)
- [ ] AC-05: Toggling the mode does not cause a flash of incorrect theme (FOIT prevented with
      a `<script>` in `<head>` that applies the `data-theme` attribute before paint)

---

#### US-44 — Offline Draft

> As a user, I want to save a mural upload as a draft when I'm offline so that I can submit
> it when I'm back online.

**Acceptance Criteria:**
- [ ] AC-01: If an upload fails due to a network error, the user is prompted: "No connection.
      Save as draft?"
- [ ] AC-02: Confirming saves all form data (photo blob, title, description, tags, location,
      visibility) to IndexedDB
- [ ] AC-03: Saved drafts are listed on the `/draft` page with a thumbnail, date saved, and
      "Submit Now" button; a count badge on the upload nav icon shows pending drafts
- [ ] AC-04: The app detects when connectivity is restored (via the `online` event) and
      displays a persistent banner: "You're back online. Ready to submit your draft?"
- [ ] AC-05: Submitting a draft from the draft page follows the same upload flow as a new
      post; on success, the draft is removed from IndexedDB
- [ ] AC-06: Drafts are stored locally only and are not synced to the server; a note in the
      Drafts UI reads: "Drafts are saved on this device only"

---

#### US-45 — Report Content

> As a user, I want to report a photo or comment that violates community guidelines so that
> the platform stays safe.

**Acceptance Criteria:**
- [ ] AC-01: A "Report" option is available in the kebab menu of all posts and comments the
      user did not author
- [ ] AC-02: Tapping "Report" opens a bottom sheet (mobile) or modal (desktop) with a required
      reason selector: Spam, Inappropriate Content, Offensive, Copyright Violation, Other
- [ ] AC-03: An optional text field allows additional detail (max 300 chars)
- [ ] AC-04: Submitting stores a `Report` record in the database linked to the reporter and
      the reported content
- [ ] AC-05: A confirmation message appears: "Thanks for letting us know. We'll review your
      report." (Do not promise a specific timeline)
- [ ] AC-06: The reported content is not hidden or altered for any user until moderated by
      an admin
- [ ] AC-07: A user cannot report the same piece of content more than once; the "Report"
      option is replaced with "Reported" (grayed, non-interactive) after submission

---

#### US-46 — Push Notifications (PWA)

> As a user on a supported device, I want push notifications so that I stay informed even
> when the app is closed.

**Acceptance Criteria:**
- [ ] AC-01: Push notification permission is requested after a meaningful engagement event
      (after posting the first mural OR after receiving the first in-app notification),
      never on first page load
- [ ] AC-02: The permission prompt is preceded by an in-app primer card explaining the value:
      "Get notified when friends comment on your murals" with "Allow notifications" and
      "Not now" options; "Not now" dismisses permanently (stored in localStorage)
- [ ] AC-03: Supported notification types: new comments on own posts, @mentions, friend
      requests, friend accepted
- [ ] AC-04: Each notification type can be individually toggled on/off in Settings >
      Notifications
- [ ] AC-05: Notification preferences are saved to the user's Supabase profile and respected
      server-side
- [ ] AC-06: The app's `manifest.json` is fully configured: `name`, `short_name`, `icons`
      (192px + 512px), `start_url`, `display: standalone`, `theme_color`, `background_color`

---

## 9. Data Models

```sql
-- Users (uses Clerk ID for auth association)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id      TEXT UNIQUE NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  bio           TEXT CHECK (char_length(bio) <= 160),
  theme_pref    TEXT DEFAULT 'system' CHECK (theme_pref IN ('light','dark','system')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_username ON users(username);

-- Posts
CREATE TABLE posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  title         TEXT CHECK (char_length(title) <= 80),
  description   TEXT CHECK (char_length(description) <= 500),
  artist        TEXT CHECK (char_length(artist) <= 100),
  lat           FLOAT8,
  lng           FLOAT8,
  city          TEXT,
  visibility    TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'friends')),
  edited_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_location ON posts USING GIST (ST_Point(lng, lat))
  WHERE lat IS NOT NULL AND lng IS NOT NULL;  -- PostGIS spatial index

-- Collections
CREATE TABLE collections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL CHECK (char_length(name) <= 80),
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT CHECK (char_length(description) <= 300),
  cover_image_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Collection → Post join (with manual ordering)
CREATE TABLE collection_posts (
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  post_id       UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  position      INT NOT NULL DEFAULT 0,
  added_at      TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (collection_id, post_id)
);

-- Favorites
CREATE TABLE favorites (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- Comments
CREATE TABLE comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       TEXT NOT NULL CHECK (char_length(body) <= 500),
  edited     BOOLEAN NOT NULL DEFAULT false,
  edited_at  TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_comments_post_id ON comments(post_id);

-- Comment Reactions
CREATE TABLE comment_reactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (comment_id, user_id, emoji)
);

-- Friends
CREATE TABLE friends (
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

-- Tags
CREATE TABLE tags (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT UNIQUE NOT NULL
);

-- Post → Tag join
CREATE TABLE post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Notifications
CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  type         TEXT NOT NULL
                 CHECK (type IN ('like','comment','mention',
                                 'friend_request','friend_accepted')),
  reference_id UUID,
  read         BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Reports
CREATE TABLE reports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reference_id   UUID NOT NULL,
  reference_type TEXT NOT NULL CHECK (reference_type IN ('post', 'comment')),
  reason         TEXT NOT NULL
                   CHECK (reason IN ('spam','inappropriate','offensive',
                                     'copyright','other')),
  detail         TEXT CHECK (char_length(detail) <= 300),
  resolved       BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (reporter_id, reference_id)
);

-- Trending cache (populated by scheduled function, queried for /discover)
CREATE TABLE trending_posts (
  post_id     UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  score       INT NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- Drafts (client-side only — IndexedDB schema for reference)
-- {
--   id:          string (uuid, local)
--   user_id:     string
--   image_blob:  Blob
--   title:       string | null
--   description: string | null
--   artist:      string | null
--   tags:        string[]
--   lat:         number | null
--   lng:         number | null
--   visibility:  'public' | 'friends'
--   created_at:  string (ISO)
-- }
```

### Row-Level Security (Supabase RLS) Summary

| Table | Read Policy | Write Policy |
|---|---|---|
| `posts` | Public posts: all. Friend posts: authenticated friends | Owner only |
| `collections` | Public: all | Owner only |
| `comments` | Follows parent post visibility | Authenticated users |
| `favorites` | Owner only | Authenticated users |
| `notifications` | Owner only | System / triggers |
| `friends` | Both parties | Requester (insert); addressee (update status) |
| `reports` | Admin only | Authenticated users |
| `trending_posts` | All (read-only) | System / scheduled function |

---

## 10. Non-Functional Requirements

### Performance
- Time to Interactive (TTI): ≤ 3 seconds on 4G
- Upload to feed appearance: ≤ 5 seconds on 4G
- Map initialization: ≤ 2 seconds on 4G
- All routes use code-splitting (Vue Router dynamic imports)
- Images lazy-loaded via IntersectionObserver with LQIP (low-quality image placeholder)
- Client-side image compression targets ≤ 2MB before upload
- Skeleton screens on all async data routes — no full-page spinners

### Reliability & Availability
- Supabase SLA (Pro tier): 99.9% uptime
- Graceful degradation: map view shows a message with an offline illustration if tiles fail
- All API calls have a 10-second timeout with user-visible error handling
- Offline draft functionality via IndexedDB for upload failures

### Security
- Authentication via Clerk (JWTs, session tokens, automatic token refresh)
- Clerk provides built-in brute force protection and session hijacking prevention
- All database access governed by Row-Level Security (RLS) policies in Supabase
- RLS policies validate Clerk user ID from JWT claims
- File uploads restricted by MIME type and size server-side (not just client-side)
- No sensitive user data stored in localStorage
- HTTPS enforced; Content Security Policy headers configured at deployment
- Clerk webhooks secured with webhook signing secrets

### Accessibility
- WCAG 2.1 AA compliance across all pages and themes
- All interactive elements have minimum 44×44px touch targets
- Focus trap in modals, bottom sheets, and dialogs; focus returns to trigger element on close
- Keyboard-navigable map with arrow key pan and +/- zoom
- ARIA live regions for optimistic UI updates (favorites count, comment additions)
- All user-uploaded images prompt for alt text on the upload form (optional, with default)
- Screen reader testing on VoiceOver (iOS Safari) and TalkBack (Android Chrome)
- All form inputs use visible `<label>` elements, not placeholder-as-label
- Error messages are descriptive and linked to their input via `aria-describedby`

### Browser & Device Support
- Modern evergreen browsers: Chrome, Firefox, Safari, Edge (last 2 versions)
- iOS Safari 15+, Android Chrome 100+
- Minimum viewport: 375px wide

### Internationalization (i18n)
- v1.0 ships in English only
- All strings externalized into a locale file (`src/locales/en.json`) from day one to support future i18n without a refactor
- Dates formatted using `Intl.DateTimeFormat` for locale-awareness from the start

---

## 11. Design System & UI Standards

> The MuralMap design language takes inspiration from the world it documents: raw urban
> walls, bold spray-painted letterforms, the contrast between concrete and color. The aesthetic
> is editorial and high-contrast — not corporate, not pastel, not generic. Every component
> decision should ask: "Does this feel like it belongs on the wall?"

---

### Color System

All colors defined as CSS custom properties on `:root`. Dark mode overrides applied via
`[data-theme="dark"]` on `<html>`, set before first paint.

#### Design Tokens — Color

| Token | Light Value | Dark Value | Usage |
|---|---|---|---|
| `--color-bg` | `#F4F0E6` | `#0C0C0C` | Page background |
| `--color-surface` | `#FFFFFF` | `#1A1A1A` | Cards, sheets, modals |
| `--color-surface-elevated` | `#F0EBE0` | `#242424` | Hover states, unread notifs |
| `--color-border` | `#E0D9CC` | `#2E2E2E` | Dividers, input borders |
| `--color-text-primary` | `#0C0C0C` | `#F4F0E6` | Body text, headings |
| `--color-text-secondary` | `#5C5549` | `#9C9489` | Captions, timestamps, labels |
| `--color-text-muted` | `#9C9489` | `#5C5549` | Placeholder, disabled |
| `--color-accent` | `#FF3800` | `#FF5722` | Primary CTAs, active states |
| `--color-accent-hover` | `#CC2D00` | `#E64A19` | Hover/pressed CTA |
| `--color-accent-secondary` | `#B4FF00` | `#AAEE00` | Tags, badges, highlights |
| `--color-heart` | `#FF3B30` | `#FF453A` | Favorite/heart icon filled |
| `--color-danger` | `#D00020` | `#FF3B30` | Destructive actions |
| `--color-success` | `#00875A` | `#00C77A` | Success toasts, confirmation |
| `--color-friend-ring` | `--color-accent-secondary` | same | Friend avatar ring |
| `--color-map-pin-bg` | `#FFFFFF` | `#1A1A1A` | Map pin thumbnail ring |

**Rationale:** The off-white background (`#F4F0E6`) references aged concrete and paper —
warmer than pure white, less harsh. The `--color-accent` orange-red (`#FF3800`) has the energy
of spray paint. `--color-accent-secondary` acid green appears selectively — tags, "New" badges,
active states — for maximum pop without saturation fatigue.

---

### Typography

| Role | Font | Weight(s) | Usage |
|---|---|---|---|
| **Display** | Syne | 700, 800 | Page headings, hero text, section titles |
| **UI** | Instrument Sans | 400, 500, 600 | Body copy, labels, buttons, inputs |
| **Monospace** | JetBrains Mono | 400 | Coordinates, usernames in code contexts, slugs |

**Load strategy:** Subset both fonts to Latin + Latin Extended via Google Fonts with
`display=swap`. Self-host if bundle size is a concern.

**Do not use:** Inter, Roboto, system-ui, -apple-system for display roles. These are
acceptable for body text only if Instrument Sans fails to load.

#### Type Scale

| Name | Size | Line Height | Usage |
|---|---|---|---|
| `--text-xs` | 11px | 1.4 | Fine print, timestamps in lists |
| `--text-sm` | 13px | 1.5 | Captions, metadata, helper text |
| `--text-base` | 15px | 1.6 | Body copy |
| `--text-md` | 17px | 1.5 | Card titles, form labels |
| `--text-lg` | 20px | 1.4 | Section headings |
| `--text-xl` | 28px | 1.2 | Page headings (Syne) |
| `--text-2xl` | 38px | 1.1 | Hero / display text (Syne) |
| `--text-3xl` | 52px | 1.0 | Landing page hero only |

---

### Spacing & Layout

- Base unit: 8px. Spacing scale: 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px
- Content max-width: 1280px; centered with 16px horizontal padding on mobile, 32px on ≥ 768px
- Mobile-first breakpoints: `sm` 480px | `md` 768px | `lg` 1024px | `xl` 1280px

#### Navigation

| Viewport | Pattern |
|---|---|
| Mobile (< 1024px) | Fixed bottom tab bar, 5 tabs: Home, Map, Upload (+), Friends, Profile |
| Desktop (≥ 1024px) | Fixed left sidebar (240px) with text labels; content in remaining space |

The Upload tab (`+`) uses the accent color as its background to maximize tap priority.

---

### Component Design Standards

#### Photo Cards (Feed / Grid)

- Full-bleed image with a `linear-gradient(to top, rgba(12,12,12,0.72) 0%, transparent 50%)`
  overlay for overlaid metadata legibility
- Metadata block at bottom: avatar (24px) + display name + location + favorite count
- Heart icon: 24px, 44×44px touch target (padding), outlined by default, filled on favorite
- Image aspect ratio: 4:5 on mobile (portrait-biased), free masonry on desktop

#### Map Pins

- Circular thumbnail (40px diameter), white 2px ring, 4px drop shadow
- Cluster badge: filled `--color-accent` background, white count text (Instrument Sans 600)
- Active/selected pin: 48px with `--color-accent-secondary` ring

#### Bottom Sheets

- Slide up from bottom with spring easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` over 280ms
- Handle bar: 4×32px, `--color-border`, centered at top, 8px top padding
- Max height: 90vh; min height: fit-content with padding
- Backdrop: `rgba(0,0,0,0.48)` with 200ms fade
- Close: swipe down past 40% of sheet height, or tap backdrop

#### Toasts

| Property | Value |
|---|---|
| Position | Bottom-center (mobile), bottom-right (desktop) |
| Auto-dismiss | 4 seconds |
| Manual close | X button always present |
| Max width | 320px |
| Entry animation | Slide up 12px + fade in, 200ms ease-out |
| Exit animation | Slide down 8px + fade out, 150ms ease-in |

Toast variants: `success` (green left border), `error` (red left border), `info` (neutral).

#### Skeleton Screens

- Match the exact layout of the loaded content (same dimensions, same grid)
- Shimmer animation: a `linear-gradient` that sweeps from left to right over 1.5s, looping
- Never use a spinner for data that has a known content shape

#### Empty States

Every zero-state must have:
1. An illustrated icon or SVG illustration (not a generic "no results" icon)
2. A clear heading (what's missing)
3. A 1–2 sentence explanation of why it's empty
4. A CTA (primary action to fill the void)

Examples:
- **Favorites (empty):** "Nothing saved yet" → "Find a mural worth keeping." → [Explore]
- **Collections (empty):** "No collections yet" → "Organize your finds into collections." → [New Collection]
- **Friends feed (empty):** "Your friends haven't posted yet" → "Be the first, or find more friends." → [Discover Murals] [Find Friends]
- **Map (no results in filter):** "No murals with that tag nearby" → "Try a different tag or zoom out." → [Clear Filters]

---

### Motion & Interaction Specs

| Interaction | Animation | Duration | Easing |
|---|---|---|---|
| Heart/favorite toggle | Scale 1 → 1.3 → 1 + color fill | 300ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Bottom sheet open | Slide up + fade backdrop | 280ms | Spring (0.34, 1.56, 0.64, 1) |
| Bottom sheet close | Slide down + fade backdrop | 180ms | `ease-in` |
| Toast enter | Slide up 12px + fade in | 200ms | `ease-out` |
| Toast exit | Slide down 8px + fade out | 150ms | `ease-in` |
| Map pin drop | Scale 0 → 1.2 → 1 | 320ms | Spring |
| Page transition | Fade + 8px up slide | 150ms | `ease-out` |
| Tag chip select | Background fill + border radius morph | 200ms | `ease-out` |
| Skeleton shimmer | Gradient sweep left → right | 1500ms | `linear`, looping |
| Upload progress ring | SVG stroke-dashoffset | Live | CSS transition |

**Haptic feedback:** `navigator.vibrate(50)` on: collection reorder activation (long-press),
favorite toggle, draft save. Always feature-detected. Never on navigation.

---

### PWA Configuration

```json
{
  "name": "MuralMap",
  "short_name": "MuralMap",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#FF3800",
  "background_color": "#0C0C0C",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

---

### 11.1 UX Microcopy & Writing Guidelines

MuralMap's voice is: **direct, human, art-curious.** We document culture — we don't gatekeep
it. Copy should feel like a knowledgeable friend, not a corporate app.

#### Principles

| Principle | Do | Don't |
|---|---|---|
| **Direct** | "Delete this mural?" | "Are you sure you want to permanently delete this item?" |
| **Human** | "Nothing saved yet." | "No favorited items found." |
| **Encouraging** | "Be the first to log a mural near you." | "No murals in your area." |
| **Honest** | "We'll review your report." | "We'll take immediate action." |
| **Concise** | "Edited" (timestamp in tooltip) | "This post was last edited on…" |

#### Key Copy Standards

**Error messages** must always tell the user:
1. What went wrong (in plain language)
2. What to do next

Examples:
- ✅ "Upload failed. Check your connection and try again."
- ❌ "Error 503"
- ✅ "That username is taken. Try adding numbers or underscores."
- ❌ "Username is not available."

**Confirmation dialogs** follow the pattern: `[Action] [Object]?` + consequence.
- "Delete this mural? This cannot be undone."
- "Remove Maya from friends?"

**Empty states** use positive framing — what the user *can* do, not what's missing.
- ✅ "Find a mural worth keeping." (Favorites empty)
- ❌ "You have no favorites."

**Button labels** are action verbs, not nouns:
- ✅ "Upload mural" / "Add to collection" / "Find friends"
- ❌ "Upload" / "Collection" / "Friends"

**Placeholders** are examples, not labels:
- Input label: "Artist name"
- Placeholder: "e.g., Shepard Fairey"

**Toasts** are brief — max 6 words:
- "Mural saved to collection"
- "Link copied!"
- "Draft saved"
- "Upload failed — draft saved"

---

### 11.2 Information Architecture

```
MuralMap
├── / (Home Feed)
│   ├── Friends feed (authenticated default if friends exist)
│   └── Explore feed (global, default for guests)
│
├── /discover (Search & Explore)
│   ├── Global search bar (Murals / Artists / Tags / Users)
│   ├── Tag chip filter row
│   └── Trending This Week section
│
├── /map (Map Discovery)
│   ├── Full-viewport Leaflet map
│   ├── Tag / collection filter chips
│   ├── Near Me button
│   └── Radius Search panel
│
├── /upload (Upload a Mural) [auth required]
│   ├── Photo picker / camera
│   ├── Crop & adjust
│   ├── Details form (title, artist, description, tags, location, visibility)
│   └── Draft fallback
│
├── /collections [auth required]
│   ├── Collection list (user's own)
│   └── /collections/:id (Collection Detail)
│       ├── Masonry grid / list view
│       ├── Sort options
│       └── Edit Order mode
│
├── /favorites [auth required]
│
├── /friends [auth required]
│   ├── Incoming requests
│   ├── Friend list
│   └── User search
│
├── /notifications [auth required]
│
├── /draft [auth required]
│
├── /profile/:username (Public Profile)
│   ├── Post grid
│   └── Public collections
│
├── /post/:id (Mural Detail)
│   ├── Full photo
│   ├── Metadata (title, artist, tags, location)
│   ├── Map embed
│   ├── Favorite + Share
│   └── Comments thread
│
├── /settings [auth required]
│   ├── Profile edit
│   ├── Account (theme, notifications)
│   └── Danger Zone (delete account)
│
└── /onboarding [auth required, first visit only]
    ├── Profile creation
    └── Welcome primer
```

#### Navigation Priority (Mobile Tab Bar)

| Position | Tab | Icon | Badge |
|---|---|---|---|
| 1 | Home | home-outline | — |
| 2 | Map | map-outline | — |
| 3 | Upload | plus-circle (accent BG) | Draft count |
| 4 | Friends | users-outline | Pending request count |
| 5 | Profile | person-outline (current user avatar) | — |

Notifications are accessible via bell icon in the top app bar (visible on all main routes),
not as a primary tab, to keep the tab bar focused on core creation/discovery actions.

---

## 12. Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Mapbox API costs exceed budget at scale | Medium | High | Using Leaflet + Nominatim (free); set usage alerts on Nominatim rate limits |
| HEIC upload support varies by browser | High | Medium | `heic2any` client-side conversion; test on iOS Safari 15, 16, 17 |
| EXIF GPS data missing from most photos | High | Medium | Make manual location entry frictionless; "No location" is a first-class state, not an error |
| Supabase Storage limits hit early | Low | High | Enforce client-side compression; monitor bucket usage; upgrade tier proactively |
| Content moderation at scale | High | High | v1.0 relies on user reports only; plan a moderation dashboard for v1.1 |
| PWA push notification opt-in rates are low | High | Low | Use primer screen before permission request; defer until post first-upload engagement |
| Onboarding drop-off before first upload | Medium | High | Make Skip always available; reduce required fields to zero; track funnel in analytics |
| Map performance with 5,000+ pins | Medium | Medium | MarkerCluster handles this well; virtual rendering for side list; paginate initial load |

---

## 13. Out of Scope (v1.0)

- Native iOS and Android apps
- Direct messaging / DM inbox between users
- Artist-claimed profiles or verification badges
- Monetization / paid tiers
- Automated content moderation (AI image classification)
- Export / download of collections as PDF, image gallery, or GeoJSON
- Batch upload (multiple photos in one session)
- Third-party embeds (embedding a mural card on external websites)
- Multi-language / i18n (strings externalized but not translated)
- Admin / moderation dashboard (reports stored but not surfaced in a UI)
- Sub-meter GPS precision (EXIF gives city-block accuracy; good enough for v1.0)

---

## 14. Testing Strategy

### Overview
Testing is **recommended and encouraged** for v1.0. Even a basic suite demonstrates professional
practices, prevents regressions during the rapid build phase, and makes the codebase
significantly more maintainable. The testing strategy below is tiered: start with unit tests for
core logic, add E2E tests for the critical upload and auth flows, and expand coverage post-launch.

### Testing Pyramid

```
        /\
       /  \
      / E2E \           5-10 tests (Critical user flows)
     /------\
    /        \
   / Component \      20-30 tests (UI components + integration)
  /--------------\
 /                \
/   Unit Tests     \    50-100 tests (Stores, utils, composables)
--------------------
```

### Priority Testing Areas

#### ✅ High Priority (Strongly Recommended)

**1. Authentication Store (`stores/auth.ts`)**
- Sign in/sign up flows
- Session persistence
- OAuth integration
- Password reset

**2. Posts Store (`stores/posts.ts`)**
- CRUD operations
- Trending algorithm
- Search functionality
- Visibility filtering

**3. Utility Functions**
- Email validation
- Image compression pipeline
- EXIF GPS extraction
- Form validation (username regex, character limits)
- HEIC detection and conversion trigger

**4. Critical E2E Flows**
- User registration → profile creation → first upload
- Search → view post → favorite
- Upload mural → add to collection
- Sign in → view map → filter results

#### 🟡 Medium Priority (Nice to Have)

**5. UI Components**
- BaseButton, BaseInput, TagsInput
- Upload form validation states
- Comment form (submit, optimistic update, rollback)
- Collection picker modal

**6. Composables**
- `useOfflineDrafts` (IndexedDB read/write/delete)
- `useMap` (Leaflet init, pin placement, clustering)
- `useExif` (GPS extraction from File)

**7. Integration Tests**
- Component + Store interactions
- Optimistic update + rollback patterns

#### ⚪ Low Priority (Optional for v1.0)

- Edge case scenarios
- Performance benchmarks
- Accessibility automated tests (run `axe-core` in E2E)
- Visual regression tests

### Recommended Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| **Vitest** | Unit & component testing | `npm i -D vitest @vue/test-utils happy-dom` |
| **Playwright** | E2E testing | `npm i -D @playwright/test` |
| **axe-core** | Accessibility assertions in E2E | `npm i -D @axe-core/playwright` |
| **Coverage** | Code coverage reports | Built into Vitest (`vitest --coverage`) |

### Configuration Examples

**Vitest Config (`vitest.config.ts`):**
```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '**/*.spec.ts']
    }
  }
})
```

**Playwright Config (`playwright.config.ts`):**
```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173'
  }
})
```

### Testing Acceptance Criteria (Minimum for v1.0)

- [ ] Authentication flows tested (sign in, sign up, sign out)
- [ ] Post creation tested end-to-end
- [ ] Core stores (auth, posts, favorites) have basic unit tests
- [ ] Validation utilities tested (username, email, char limits)
- [ ] EXIF GPS extraction tested with fixture files
- [ ] At least 5 critical E2E tests passing
- [ ] No breaking changes to existing tests in CI

### 14.1 Usability Testing Plan

> Even one round of usability testing before launch will surface issues no PRD or code review
> can catch. Target 5 participants — 3 from Persona A, 1 from Persona B, 1 from Persona C.

#### Test Goals

| Goal | What to Measure |
|---|---|
| Upload flow efficiency | Time from "tap Upload" to post live; drop-off points |
| Location handling | % who successfully set location when EXIF is missing |
| Onboarding completion | % who reach home feed after sign-up |
| Discovery (map) | Can users find a mural near a given address? |
| Collections | Can users create a collection and add a mural without instructions? |

#### Test Script (Moderated, Remote)

1. **Task 1 — Upload:** "You just photographed a mural. Log it on MuralMap." (Timer: 3 min max)
2. **Task 2 — Discover:** "Find any mural in [city] using the map." (Timer: 2 min max)
3. **Task 3 — Organize:** "Create a collection called 'Atlanta 2026' and add the mural you just uploaded." (Timer: 2 min max)
4. **Task 4 — Social:** "Find your test friend and send them a friend request." (Timer: 2 min max)
5. **Post-task questions:**
   - "What was confusing or unclear?"
   - "What did you expect to happen that didn't?"
   - "Would you use this? For what?"

#### Success Thresholds

| Task | Target Completion | Max Acceptable Time |
|---|---|---|
| Upload (with GPS) | 90% | 90 seconds |
| Upload (no GPS) | 75% | 3 minutes |
| Map discovery | 80% | 2 minutes |
| Create collection + add mural | 70% | 3 minutes |

#### When to Test

- **Before M1:** Test the upload flow and onboarding with a prototype (Figma or early build)
- **Before v1.0 launch:** Full test with a staging build including all epics

---

## 15. Roadmap & Milestones

| Milestone | Target | Key Deliverables |
|---|---|---|
| **M0 — Foundation** | Week 1–2 | Clerk auth + Supabase schema + webhooks + routing + design tokens + Syne/Instrument Sans fonts |
| **M1 — Core Loop** | Week 3–5 | Upload flow, EXIF parsing, HEIC conversion, post detail, basic feed, favorites |
| **M1.5 — Usability Test** | End of Week 5 | Test upload + onboarding with 5 participants; iterate before map work |
| **M2 — Map** | Week 6–7 | Map view, pin clustering, radius search, manual pin, "Near Me" |
| **M3 — Social** | Week 8–10 | Friends, comments, @mentions, reactions, in-app notifications |
| **M4 — Discovery** | Week 11–12 | Collections, search, tags, trending, filter feed |
| **M5 — Polish & PWA** | Week 13–14 | Dark mode, offline draft, push notifications, Lighthouse audit, empty states audit |
| **M5.5 — Usability Test** | End of Week 14 | Full flow test with staging build; fix P0 issues before launch |
| **M6 — Testing** (Optional) | Week 15–17 | Unit tests, component tests, E2E tests, CI/CD integration |
| **v1.0 Launch** | Week 15–18 | Public launch; moderation workflow documented; analytics instrumented |
| **v1.1 — Backlog** | Post-launch | Moderation dashboard, batch upload, GeoJSON export, DMs (prototype), artist profiles |
