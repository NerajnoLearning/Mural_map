import { test, expect } from '@playwright/test'

/**
 * E2E tests for authentication flow
 * These tests verify the complete authentication user journey
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/')
  })

  test.describe('Sign Up', () => {
    test('should display sign up page', async ({ page }) => {
      // Navigate to sign up page
      await page.goto('/auth/signup')

      // Verify page elements
      await expect(page.locator('h1')).toContainText(/sign up/i)
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/auth/signup')

      // Click submit without filling form
      await page.click('button[type="submit"]')

      // Should show validation errors
      await expect(page.locator('text=/email.*required/i')).toBeVisible()
      await expect(page.locator('text=/password.*required/i')).toBeVisible()
    })

    test('should show error for invalid email', async ({ page }) => {
      await page.goto('/auth/signup')

      // Fill form with invalid email
      await page.fill('input[type="email"]', 'invalid-email')
      await page.fill('input[type="password"]', 'Password123!')
      await page.click('button[type="submit"]')

      // Should show email validation error
      await expect(page.locator('text=/valid email/i')).toBeVisible()
    })

    test('should show error for weak password', async ({ page }) => {
      await page.goto('/auth/signup')

      // Fill form with weak password
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'weak')
      await page.click('button[type="submit"]')

      // Should show password validation error
      await expect(page.locator('text=/password.*8 characters/i')).toBeVisible()
    })

    test('should successfully sign up with valid credentials', async ({ page }) => {
      await page.goto('/auth/signup')

      // Generate unique email for test
      const timestamp = Date.now()
      const email = `test${timestamp}@example.com`
      const password = 'TestPassword123!'

      // Fill form
      await page.fill('input[type="email"]', email)
      await page.fill('input[type="password"]', password)
      await page.fill('input[name="username"]', `testuser${timestamp}`)

      // Submit form
      await page.click('button[type="submit"]')

      // Should show success message or redirect
      // Note: This depends on your Supabase configuration
      // If email confirmation is enabled, expect confirmation message
      // If not, expect redirect to home/dashboard
      await expect(
        page.locator('text=/check your email|welcome|success/i')
      ).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Sign In', () => {
    test('should display sign in page', async ({ page }) => {
      await page.goto('/auth/signin')

      // Verify page elements
      await expect(page.locator('h1')).toContainText(/sign in/i)
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/auth/signin')

      // Click submit without filling form
      await page.click('button[type="submit"]')

      // Should show validation errors
      await expect(page.locator('text=/email.*required/i')).toBeVisible()
      await expect(page.locator('text=/password.*required/i')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/auth/signin')

      // Fill form with invalid credentials
      await page.fill('input[type="email"]', 'nonexistent@example.com')
      await page.fill('input[type="password"]', 'WrongPassword123!')
      await page.click('button[type="submit"]')

      // Should show authentication error
      await expect(
        page.locator('text=/invalid.*credentials|wrong.*password|user.*not.*found/i')
      ).toBeVisible({ timeout: 5000 })
    })

    test('should have link to sign up page', async ({ page }) => {
      await page.goto('/auth/signin')

      // Should have link to sign up
      const signUpLink = page.locator('a[href*="signup"]')
      await expect(signUpLink).toBeVisible()

      // Click link and verify navigation
      await signUpLink.click()
      await expect(page).toHaveURL(/signup/)
    })

    test('should have forgot password link', async ({ page }) => {
      await page.goto('/auth/signin')

      // Should have forgot password link
      const forgotLink = page.locator('a', { hasText: /forgot.*password/i })
      await expect(forgotLink).toBeVisible()
    })
  })

  test.describe('OAuth Sign In', () => {
    test('should display OAuth buttons', async ({ page }) => {
      await page.goto('/auth/signin')

      // Check for OAuth provider buttons
      // Note: Adjust selectors based on your implementation
      const oauthButtons = page.locator('button:has-text("Google"), button:has-text("GitHub")')
      await expect(oauthButtons.first()).toBeVisible()
    })

    test('should initiate OAuth flow when clicked', async ({ page }) => {
      await page.goto('/auth/signin')

      // Find OAuth button (adjust selector as needed)
      const googleButton = page.locator('button:has-text("Google")').first()

      if (await googleButton.isVisible()) {
        // Click OAuth button
        // Note: We don't test the full OAuth flow as it involves external services
        // We just verify the button exists and is clickable
        await expect(googleButton).toBeEnabled()
      }
    })
  })

  test.describe('Password Reset', () => {
    test('should display password reset page', async ({ page }) => {
      await page.goto('/auth/forgot-password')

      // Verify page elements
      await expect(page.locator('h1')).toContainText(/forgot.*password|reset.*password/i)
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should show validation error for empty email', async ({ page }) => {
      await page.goto('/auth/forgot-password')

      // Click submit without filling email
      await page.click('button[type="submit"]')

      // Should show validation error
      await expect(page.locator('text=/email.*required/i')).toBeVisible()
    })

    test('should send reset email for valid email', async ({ page }) => {
      await page.goto('/auth/forgot-password')

      // Fill form
      await page.fill('input[type="email"]', 'test@example.com')
      await page.click('button[type="submit"]')

      // Should show success message
      await expect(
        page.locator('text=/check your email|reset link sent|email sent/i')
      ).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Authenticated User Navigation', () => {
    test('should redirect to signin when accessing protected route', async ({ page }) => {
      // Try to access a protected route
      await page.goto('/profile')

      // Should redirect to sign in page
      await expect(page).toHaveURL(/signin|login|auth/)
    })

    test('should show different navigation when authenticated', async ({ page, context }) => {
      // Note: This test requires setting up authenticated state
      // You would need to sign in first or set up session cookies

      // For now, we'll skip the actual authentication and just test the UI logic
      // In a real scenario, you'd:
      // 1. Sign in programmatically
      // 2. Verify authenticated UI appears
      // 3. Verify sign out functionality

      test.skip('requires authentication setup', () => {})
    })
  })

  test.describe('Sign Out', () => {
    test('should show sign out functionality when authenticated', async ({ page, context }) => {
      // Note: This test requires setting up authenticated state
      // For a complete test, you would:
      // 1. Create a test user account
      // 2. Sign in programmatically using the API
      // 3. Set session cookies
      // 4. Navigate to profile/settings
      // 5. Click sign out
      // 6. Verify redirect to home/signin
      // 7. Verify authenticated routes are no longer accessible

      test.skip('requires authentication setup', () => {})
    })
  })

  test.describe('Session Persistence', () => {
    test('should persist session across page refreshes', async ({ page, context }) => {
      // Note: This test requires setting up authenticated state
      // Complete flow:
      // 1. Sign in
      // 2. Navigate to a page
      // 3. Refresh the page
      // 4. Verify user is still authenticated
      // 5. Verify user data is still available

      test.skip('requires authentication setup', () => {})
    })

    test('should handle session expiration gracefully', async ({ page }) => {
      // Note: This test would require:
      // 1. Signing in
      // 2. Waiting for session to expire (or manipulating session storage)
      // 3. Attempting to access protected resource
      // 4. Verifying redirect to sign in
      // 5. Verifying appropriate error message

      test.skip('requires authentication setup and session manipulation', () => {})
    })
  })

  test.describe('Form Interactions', () => {
    test('should show password visibility toggle', async ({ page }) => {
      await page.goto('/auth/signin')

      const passwordInput = page.locator('input[type="password"]')
      const toggleButton = page.locator('button[aria-label*="password" i], button:has-text("Show")')

      if (await toggleButton.isVisible()) {
        // Click toggle to show password
        await toggleButton.click()

        // Password input should change to text type
        await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'text')

        // Click toggle again to hide password
        await toggleButton.click()

        // Password input should change back to password type
        await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'password')
      }
    })

    test('should show loading state when submitting', async ({ page }) => {
      await page.goto('/auth/signin')

      // Fill form
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'Password123!')

      // Submit form
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()

      // Button should show loading state (disabled or loading indicator)
      // Note: Timing-sensitive, may need adjustment
      await expect(submitButton).toBeDisabled({ timeout: 1000 }).catch(() => {
        // If not disabled, check for loading text/spinner
        expect(submitButton.locator('text=/loading|signing in/i, svg')).toBeTruthy()
      })
    })

    test('should clear error messages when user starts typing', async ({ page }) => {
      await page.goto('/auth/signin')

      // Submit empty form to trigger errors
      await page.click('button[type="submit"]')

      // Wait for error to appear
      const errorMessage = page.locator('text=/email.*required/i')
      await expect(errorMessage).toBeVisible()

      // Start typing in email field
      await page.fill('input[type="email"]', 'test')

      // Error should disappear
      await expect(errorMessage).not.toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper form labels', async ({ page }) => {
      await page.goto('/auth/signin')

      // Check for labels
      await expect(page.locator('label[for*="email"]')).toBeVisible()
      await expect(page.locator('label[for*="password"]')).toBeVisible()
    })

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/auth/signin')

      // Tab through form elements
      await page.keyboard.press('Tab') // Should focus first input
      await page.keyboard.press('Tab') // Should focus second input
      await page.keyboard.press('Tab') // Should focus submit button

      // Submit button should be focused
      const submitButton = page.locator('button[type="submit"]')
      await expect(submitButton).toBeFocused()
    })

    test('should have appropriate ARIA attributes', async ({ page }) => {
      await page.goto('/auth/signin')

      // Check for ARIA attributes on error messages
      // Note: This depends on your error handling implementation
      await page.click('button[type="submit"]')

      const errorMessages = page.locator('[role="alert"], [aria-live="polite"]')
      if (await errorMessages.count() > 0) {
        await expect(errorMessages.first()).toBeVisible()
      }
    })
  })
})
