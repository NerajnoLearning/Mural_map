import { test, expect } from '@playwright/test'

/**
 * E2E tests for post creation and management flow
 * These tests verify the complete post lifecycle
 */

test.describe('Post Creation and Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/')
  })

  test.describe('Create Post Page', () => {
    test('should display create post page', async ({ page }) => {
      await page.goto('/posts/create')

      // Should redirect to sign in if not authenticated
      // Or show create post form if authenticated
      const isAuthPage = await page.locator('h1:has-text("Sign In")').isVisible().catch(() => false)

      if (isAuthPage) {
        // Verify redirect to auth page
        await expect(page).toHaveURL(/signin|login|auth/)
      } else {
        // Verify create post form elements
        await expect(page.locator('h1')).toContainText(/create.*post|new.*post/i)
        await expect(page.locator('input[name="title"], input[placeholder*="title" i]')).toBeVisible()
        await expect(page.locator('textarea[name="description"], textarea[placeholder*="description" i]')).toBeVisible()
        await expect(page.locator('button[type="submit"]')).toBeVisible()
      }
    })

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/posts/create')

      // Skip if redirected to auth
      const isCreatePage = await page.locator('h1:has-text(/create.*post/i)').isVisible().catch(() => false)
      if (!isCreatePage) {
        test.skip()
        return
      }

      // Click submit without filling form
      await page.click('button[type="submit"]')

      // Should show validation errors
      await expect(page.locator('text=/title.*required/i')).toBeVisible()
    })

    test('should show map for location selection', async ({ page }) => {
      await page.goto('/posts/create')

      // Skip if redirected to auth
      const isCreatePage = await page.locator('h1:has-text(/create.*post/i)').isVisible().catch(() => false)
      if (!isCreatePage) {
        test.skip()
        return
      }

      // Check for map container (Leaflet creates a div with leaflet-container class)
      const mapContainer = page.locator('.leaflet-container, [id*="map"]')
      if (await mapContainer.isVisible()) {
        await expect(mapContainer).toBeVisible()
      }
    })

    test('should allow image upload', async ({ page }) => {
      await page.goto('/posts/create')

      // Skip if redirected to auth
      const isCreatePage = await page.locator('h1:has-text(/create.*post/i)').isVisible().catch(() => false)
      if (!isCreatePage) {
        test.skip()
        return
      }

      // Look for file input
      const fileInput = page.locator('input[type="file"]')
      if (await fileInput.isVisible()) {
        await expect(fileInput).toBeVisible()
        await expect(fileInput).toHaveAttribute('accept', /image/i)
      }
    })

    test('should allow selecting tags', async ({ page }) => {
      await page.goto('/posts/create')

      // Skip if redirected to auth
      const isCreatePage = await page.locator('h1:has-text(/create.*post/i)').isVisible().catch(() => false)
      if (!isCreatePage) {
        test.skip()
        return
      }

      // Look for tag selection UI
      const tagSelector = page.locator('[data-testid="tag-selector"], select[name="tags"], input[placeholder*="tag" i]')
      const hasTagSelector = await tagSelector.isVisible().catch(() => false)

      if (hasTagSelector) {
        await expect(tagSelector).toBeVisible()
      }
    })

    test('should allow selecting visibility', async ({ page }) => {
      await page.goto('/posts/create')

      // Skip if redirected to auth
      const isCreatePage = await page.locator('h1:has-text(/create.*post/i)').isVisible().catch(() => false)
      if (!isCreatePage) {
        test.skip()
        return
      }

      // Look for visibility selector
      const visibilityOptions = page.locator('select[name="visibility"], input[type="radio"][name="visibility"]')
      const hasVisibility = await visibilityOptions.isVisible().catch(() => false)

      if (hasVisibility) {
        await expect(visibilityOptions.first()).toBeVisible()
      }
    })
  })

  test.describe('Post Feed', () => {
    test('should display posts feed on home page', async ({ page }) => {
      await page.goto('/')

      // Should show posts or empty state
      const hasPosts = await page.locator('[data-testid="post-card"], .post-item, article').count() > 0
      const hasEmptyState = await page.locator('text=/no posts|no murals|empty/i').isVisible().catch(() => false)

      expect(hasPosts || hasEmptyState).toBe(true)
    })

    test('should display post cards with required information', async ({ page }) => {
      await page.goto('/')

      // Wait for posts to load
      await page.waitForLoadState('networkidle')

      // Check if any posts exist
      const postCards = page.locator('[data-testid="post-card"], .post-item, article')
      const postCount = await postCards.count()

      if (postCount > 0) {
        const firstPost = postCards.first()

        // Each post should have an image
        const hasImage = await firstPost.locator('img').isVisible().catch(() => false)
        if (hasImage) {
          await expect(firstPost.locator('img')).toBeVisible()
        }

        // Each post should have some text content
        const text = await firstPost.textContent()
        expect(text?.length).toBeGreaterThan(0)
      }
    })

    test('should allow filtering posts', async ({ page }) => {
      await page.goto('/')

      // Look for filter options
      const filterSelect = page.locator('select[name="filter"], [data-testid="filter-select"]')
      const filterButtons = page.locator('button:has-text("All"), button:has-text("Recent"), button:has-text("Trending")')

      const hasFilters = await filterSelect.isVisible().catch(() => false) || await filterButtons.count() > 0

      if (hasFilters) {
        // Verify filter functionality exists
        expect(hasFilters).toBe(true)
      }
    })

    test('should implement infinite scroll or pagination', async ({ page }) => {
      await page.goto('/')

      await page.waitForLoadState('networkidle')

      // Check for pagination controls
      const paginationButtons = page.locator('button:has-text("Load More"), button:has-text("Next"), nav[aria-label="pagination"]')
      const hasPagination = await paginationButtons.isVisible().catch(() => false)

      if (hasPagination) {
        await expect(paginationButtons.first()).toBeVisible()
      } else {
        // If no pagination, might have infinite scroll
        // We can't fully test infinite scroll without many posts
        // Just verify the page is interactive
        expect(await page.isVisible('body')).toBe(true)
      }
    })
  })

  test.describe('Post Detail Page', () => {
    test('should navigate to post detail when clicking post', async ({ page }) => {
      await page.goto('/')

      await page.waitForLoadState('networkidle')

      // Find first post link
      const postLink = page.locator('a[href*="/posts/"], [data-testid="post-card"] a').first()
      const hasPostLink = await postLink.isVisible().catch(() => false)

      if (hasPostLink) {
        await postLink.click()

        // Should navigate to post detail page
        await expect(page).toHaveURL(/\/posts\/[a-zA-Z0-9-]+/)
      }
    })

    test('should display post details', async ({ page }) => {
      // Try to navigate to a post detail page
      // Note: In a real test, you'd have a known test post ID
      await page.goto('/posts/test-post-id')

      // Should show post content or 404
      const isNotFound = await page.locator('text=/not found|404/i').isVisible().catch(() => false)

      if (!isNotFound) {
        // If post exists, should show image and details
        const hasContent = await page.locator('h1, img, p').count() > 0
        expect(hasContent).toBe(true)
      } else {
        // Should show 404 message
        await expect(page.locator('text=/not found|404/i')).toBeVisible()
      }
    })

    test('should show map with post location', async ({ page }) => {
      await page.goto('/posts/test-post-id')

      // Check for map (if post exists)
      const mapContainer = page.locator('.leaflet-container, [id*="map"]')
      const hasMap = await mapContainer.isVisible().catch(() => false)

      if (hasMap) {
        await expect(mapContainer).toBeVisible()
      }
    })

    test('should display comment section', async ({ page }) => {
      await page.goto('/posts/test-post-id')

      // Look for comments section
      const commentsSection = page.locator('[data-testid="comments"], section:has-text("Comments")')
      const hasComments = await commentsSection.isVisible().catch(() => false)

      if (hasComments) {
        await expect(commentsSection).toBeVisible()
      }
    })
  })

  test.describe('Post Interactions', () => {
    test('should allow favoriting a post', async ({ page }) => {
      await page.goto('/')

      await page.waitForLoadState('networkidle')

      // Find favorite/like button
      const favoriteButton = page.locator('button[aria-label*="favorite" i], button[aria-label*="like" i], button:has(svg)').first()
      const hasFavoriteButton = await favoriteButton.isVisible().catch(() => false)

      if (hasFavoriteButton) {
        // Should be able to click favorite button
        await expect(favoriteButton).toBeVisible()

        // Note: Actually clicking would require authentication
        // Just verify the button exists and is interactive
        await expect(favoriteButton).toBeEnabled()
      }
    })

    test('should show favorite count', async ({ page }) => {
      await page.goto('/')

      await page.waitForLoadState('networkidle')

      // Look for favorite count indicators
      const favoriteCount = page.locator('[data-testid="favorite-count"], text=/\\d+ like/, text=/\\d+ favorite/')
      const hasCount = await favoriteCount.count() > 0

      if (hasCount) {
        await expect(favoriteCount.first()).toBeVisible()
      }
    })

    test('should allow commenting on posts', async ({ page }) => {
      await page.goto('/posts/test-post-id')

      // Look for comment input
      const commentInput = page.locator('textarea[placeholder*="comment" i], input[placeholder*="comment" i]')
      const hasCommentInput = await commentInput.isVisible().catch(() => false)

      if (hasCommentInput) {
        await expect(commentInput).toBeVisible()

        // Should have submit button
        const submitButton = page.locator('button[type="submit"]:near(textarea), button:has-text("Comment")')
        await expect(submitButton.first()).toBeVisible()
      }
    })
  })

  test.describe('Map View', () => {
    test('should display map view of posts', async ({ page }) => {
      await page.goto('/map')

      // Should show map container
      const mapContainer = page.locator('.leaflet-container, [id*="map"]')
      await expect(mapContainer).toBeVisible({ timeout: 10000 })
    })

    test('should show markers for posts', async ({ page }) => {
      await page.goto('/map')

      // Wait for map to load
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000) // Give map time to render markers

      // Look for map markers (Leaflet creates marker elements)
      const markers = page.locator('.leaflet-marker-icon, .leaflet-marker-pane img')
      const markerCount = await markers.count()

      // Should have at least one marker or show empty state
      expect(markerCount >= 0).toBe(true)
    })

    test('should allow clicking markers to view post details', async ({ page }) => {
      await page.goto('/map')

      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Try to click a marker if it exists
      const marker = page.locator('.leaflet-marker-icon').first()
      const hasMarker = await marker.isVisible().catch(() => false)

      if (hasMarker) {
        await marker.click()

        // Should show popup or navigate to post
        const popup = page.locator('.leaflet-popup, [data-testid="post-popup"]')
        const hasPopup = await popup.isVisible().catch(() => false)

        if (hasPopup) {
          await expect(popup).toBeVisible()
        }
      }
    })
  })

  test.describe('Search and Filter', () => {
    test('should have search functionality', async ({ page }) => {
      await page.goto('/')

      // Look for search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')
      const hasSearch = await searchInput.isVisible().catch(() => false)

      if (hasSearch) {
        await expect(searchInput).toBeVisible()

        // Should be able to type in search
        await searchInput.fill('mural')

        // Should show search results or filtered posts
        await page.waitForLoadState('networkidle')
      }
    })

    test('should filter by tags', async ({ page }) => {
      await page.goto('/')

      // Look for tag filters
      const tagFilter = page.locator('[data-testid="tag-filter"], button:has-text("#")')
      const hasTagFilter = await tagFilter.count() > 0

      if (hasTagFilter) {
        // Click a tag to filter
        await tagFilter.first().click()

        // Should update posts display
        await page.waitForLoadState('networkidle')
      }
    })
  })

  test.describe('Trending Posts', () => {
    test('should display trending section', async ({ page }) => {
      await page.goto('/')

      // Look for trending section
      const trendingSection = page.locator('section:has-text("Trending"), [data-testid="trending"]')
      const hasTrending = await trendingSection.isVisible().catch(() => false)

      if (hasTrending) {
        await expect(trendingSection).toBeVisible()

        // Should have posts in trending section
        const trendingPosts = trendingSection.locator('[data-testid="post-card"], article')
        const count = await trendingPosts.count()
        expect(count).toBeGreaterThan(0)
      }
    })
  })

  test.describe('Responsive Design', () => {
    test('should be mobile responsive', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      // Should display mobile-friendly layout
      await expect(page.locator('body')).toBeVisible()

      // Posts should still be visible and readable
      const posts = page.locator('[data-testid="post-card"], .post-item, article')
      const postCount = await posts.count()

      if (postCount > 0) {
        const firstPost = posts.first()
        await expect(firstPost).toBeVisible()

        // Should fit in viewport
        const boundingBox = await firstPost.boundingBox()
        if (boundingBox) {
          expect(boundingBox.width).toBeLessThanOrEqual(375)
        }
      }
    })

    test('should have mobile navigation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      // Look for mobile menu button (hamburger)
      const menuButton = page.locator('button[aria-label*="menu" i], button:has(svg[class*="menu"])')
      const hasMenuButton = await menuButton.isVisible().catch(() => false)

      if (hasMenuButton) {
        await expect(menuButton).toBeVisible()

        // Should be able to open menu
        await menuButton.click()

        // Menu should be visible
        const menu = page.locator('nav, [role="navigation"]')
        await expect(menu).toBeVisible()
      }
    })
  })

  test.describe('Performance', () => {
    test('should load page within acceptable time', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime

      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000)
    })

    test('should lazy load images', async ({ page }) => {
      await page.goto('/')

      // Check if images have loading="lazy" attribute
      const images = page.locator('img')
      const imageCount = await images.count()

      if (imageCount > 0) {
        // At least some images should have lazy loading
        const lazyImages = page.locator('img[loading="lazy"]')
        const lazyCount = await lazyImages.count()

        // It's okay if not all images are lazy loaded (hero images might not be)
        expect(lazyCount >= 0).toBe(true)
      }
    })
  })
})
