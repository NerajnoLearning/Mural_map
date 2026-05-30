# MuralMap P0 Tasks — Design Spec

**Date:** 2026-05-29  
**Status:** Approved  
**Milestone:** M6 — Security & Testing (partial completion)

---

## Scope

Three blocking P0 tasks required before v1.0 launch:

1. PWA icon assets generation
2. ESLint setup
3. CI/CD pipeline

---

## 1. PWA Icon Generation

### Problem
`public/icons/` directory is missing. `manifest.json` references 8 icon sizes and 3 shortcut icons — all 404.

### Solution
Node script (`scripts/generate-icons.mjs`) generates all required PNG assets programmatically using `sharp`.

### Icon Design
- **Base icon:** Font Awesome 5 Free `map-marker-alt` SVG path
- **Background:** `#FF6B35` (MuralMap primary color, matches `theme_color` in manifest)
- **Foreground:** `#FFFFFF` white icon
- **Shape:** Rounded square (PWA maskable-safe)

### Output Files

| File | Size | Purpose |
|------|------|---------|
| `icon-72x72.png` | 72×72 | Android legacy |
| `icon-96x96.png` | 96×96 | Android |
| `icon-128x128.png` | 128×128 | Chrome Web Store |
| `icon-144x144.png` | 144×144 | Windows tile |
| `icon-152x152.png` | 152×152 | iOS |
| `icon-192x192.png` | 192×192 | Android home screen |
| `icon-384x384.png` | 384×384 | Android splash |
| `icon-512x512.png` | 512×512 | PWA install / splash |
| `icon-upload-96x96.png` | 96×96 | Upload shortcut (blue accent) |
| `icon-map-96x96.png` | 96×96 | Map shortcut (green accent) |
| `icon-discover-96x96.png` | 96×96 | Discover shortcut (orange accent) |

### npm Script
```json
"generate:icons": "node scripts/generate-icons.mjs"
```

### Dependencies Added
- `sharp` (devDependency) — SVG→PNG, resize, compositing

### Execution
Run once, commit generated PNGs to repo. Not part of build pipeline (static assets).

---

## 2. ESLint Setup

### Problem
`npm run lint` currently runs `echo "Linting not yet configured"` — no actual linting.

### Solution
ESLint 9 flat config with Vue 3 + TypeScript recommended rules.

### Dependencies Added
```
eslint
@eslint/js
eslint-plugin-vue
typescript-eslint
```

### Config File: `eslint.config.js`
- Extends `@eslint/js` recommended
- Extends `typescript-eslint` recommended
- Extends `eslint-plugin-vue` vue3-recommended
- Parser: `vue-eslint-parser` with TypeScript parser for `<script>` blocks
- Ignores: `dist/`, `node_modules/`, `public/`, `scripts/`

### Rule Overrides
- `vue/multi-word-component-names`: off (single-word component names exist in project)
- `@typescript-eslint/no-explicit-any`: warn (not error, to avoid blocking CI on existing code)

### Updated npm Script
```json
"lint": "eslint . --ext .ts,.vue"
"lint:fix": "eslint . --ext .ts,.vue --fix"
```

---

## 3. CI/CD Pipeline

### Problem
`.github/workflows/` is empty — no automated checks on PRs or pushes.

### Solution
Single GitHub Actions workflow: `ci.yml`

### Triggers
- `push` to `main`
- `pull_request` targeting `main`

### Job: `quality`

| Step | Command | Purpose |
|------|---------|---------|
| Checkout | `actions/checkout@v4` | Get code |
| Node setup | `actions/setup-node@v4` (LTS) + npm cache | Fast installs |
| Install | `npm ci` | Clean install from lockfile |
| Type check | `npm run type-check` | `vue-tsc --noEmit` |
| Lint | `npm run lint` | ESLint |
| Unit tests | `npm run test:run` | Vitest (no watch) |
| Build | `npm run build` | Vite production build |

### Behavior
- Fail-fast enabled — stops at first failure
- No E2E in CI (requires running server + browser; deferred to M6 completion)
- No deploy step (Netlify auto-deploys from main separately)

---

## 4. Documentation Update

Update `PROJECT_OVERVIEW.md` M6 milestone row:

**Before:**
```
| **M6 — Security & Testing** | Week 15–17 | 🔄 In Progress | XSS fixes, dependency patching, unit/component/E2E tests, CI/CD integration |
```

**After:**
```
| **M6 — Security & Testing** | Week 15–17 | 🔄 In Progress | ✅ XSS fixes, ✅ dependency patching, ✅ ESLint configured, ✅ CI/CD pipeline, unit/component/E2E tests remaining |
```

---

## Implementation Order

1. Install ESLint deps + write `eslint.config.js` + update lint script
2. Install `sharp` + write `scripts/generate-icons.mjs` + run it
3. Write `.github/workflows/ci.yml`
4. Update `PROJECT_OVERVIEW.md`
5. Commit all changes

---

## Out of Scope

- E2E tests in CI (M6 remaining work)
- Netlify deploy preview workflow (post-launch)
- Icon animation or adaptive icon variants
- Custom illustrated logo (can replace placeholder icons later)
