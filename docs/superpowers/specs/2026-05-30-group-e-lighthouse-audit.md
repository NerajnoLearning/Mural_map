# Group E — Lighthouse Audit Findings

**Date:** 2026-05-30
**Method:** Static code + build analysis (CLI blocked by arm64/x64 Node conflict on this machine; run `npx lighthouse` from an arm64 Node environment or via Chrome DevTools → Lighthouse tab)

---

## Build Summary

| Chunk | Raw | Gzip |
|-------|-----|------|
| MapPage | 189 KB | 56 KB |
| supabase | 163 KB | 44 KB |
| UploadPage | 146 KB | 53 KB |
| index (main) | 101 KB | 37 KB |
| runtime-core | 58 KB | 23 KB |

All route chunks are code-split ✅. Initial load = index + runtime-core ≈ 159 KB raw / 60 KB gzip. Good.

---

## PWA ✅ / ⚠️

| Check | Status | Notes |
|-------|--------|-------|
| manifest.json | ✅ | name, short_name, start_url, display, theme_color, icons all present |
| Icons 192 + 512 | ✅ | Both present in /public/icons/ |
| maskable icon | ✅ | All icons marked `"purpose": "any maskable"` |
| Service worker | ✅ | /public/sw.js registered in index.html |
| Offline page | ✅ | /public/offline.html exists |
| SW caching strategy | ✅ | Cache-first for images, network-first for API |
| Screenshots in manifest | ⚠️ | manifest.json references /screenshots/*.png but /public/screenshots/ does not exist — Chrome will warn, won't fail install |
| favicon | ⚠️ | index.html uses /vite.svg (default Vite icon) — should use /icons/icon-192x192.png |

---

## Performance

| Check | Status | Notes |
|-------|--------|-------|
| Route-level code splitting | ✅ | All views are lazy-loaded chunks |
| Image compression | ✅ | browser-image-compression used on upload |
| Leaflet lazy-loaded | ✅ | MapPage is its own chunk |
| supabase bundle | ⚠️ | 163 KB raw — consider tree-shaking; only `createClient` needed |
| UploadPage bundle | ⚠️ | 146 KB raw — includes exifr + sharp-related code |
| Font preload | — | No custom fonts, system stack used |

---

## Accessibility

| Check | Status | Notes |
|-------|--------|-------|
| `<html lang="en">` | ✅ | Present in index.html |
| Viewport meta | ✅ | Present with `viewport-fit=cover` |
| `<img>` without alt | ⚠️ | 26 images missing alt attributes across: useMap.ts, CommentItem.vue, TopNav.vue, UserSearch.vue, BottomNav.vue |
| Role=switch on toggles | ✅ | SettingsPage push/email toggles have `role="switch"` + `aria-checked` |
| Focus rings | ✅ | BaseButton includes `focus:ring-2 focus:ring-offset-2` |
| EmptyState focus ring | ✅ | Fixed in Group A (RouterLink CTA has focus ring) |

---

## Best Practices

| Check | Status | Notes |
|-------|--------|-------|
| HTTPS | ✅ (prod) | Netlify serves HTTPS |
| console.log in SW | ⚠️ | sw.js has `console.log('[SW] ...')` calls — remove for prod |
| ESLint | ✅ | 0 errors (configured in P0) |
| TypeScript | ✅ | vue-tsc passes |

---

## SEO

| Check | Status | Notes |
|-------|--------|-------|
| `<meta name="description">` | ✅ | Present in index.html |
| `<title>` | ✅ | Present |
| Canonical / OG tags | ⚠️ | No Open Graph or Twitter Card meta tags — add for social sharing |
| robots.txt | — | Not present, Netlify default allows all |

---

## Actionable Fixes (Priority Order)

### P1 — Fix before launch
1. **Missing screenshots** — Create `/public/screenshots/` or remove `screenshots` from manifest.json to avoid Chrome install warning
2. **favicon** — Change `<link rel="icon">` in index.html from `/vite.svg` to `/icons/icon-192x192.png`
3. **Missing img alt attributes** — 26 instances across 5 files; add descriptive alt or `alt=""` for decorative

### P2 — Nice to have
4. **Remove sw.js console.log calls** — 3 instances; harmless but noisy in prod
5. **Open Graph meta tags** — Add `og:title`, `og:description`, `og:image` to index.html for social sharing
6. **supabase tree-shaking** — Audit supabase imports; 163 KB is large if only createClient is used

---

## To Run Actual Lighthouse

Requires arm64 Node. Options:
1. `nvm install --lts` on an arm64 terminal, then `npx lighthouse http://localhost:4173 --view`
2. Chrome DevTools → Lighthouse tab (no Node required)
3. `npx @lhci/cli autorun` in CI (GitHub Actions uses Linux x64, compatible)
