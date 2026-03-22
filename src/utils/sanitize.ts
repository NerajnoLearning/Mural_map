// Input sanitization utilities using DOMPurify
import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows basic formatting tags like bold, italic, links
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false
  })
}

/**
 * Sanitize text by removing all HTML tags
 * Use this for plain text fields
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
}

/**
 * Sanitize user input for safe display
 * More permissive than sanitizeText, allows basic formatting
 */
export function sanitizeUserInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br'],
    ALLOWED_ATTR: []
  })
}

/**
 * Sanitize URLs to prevent javascript: and data: URIs
 */
export function sanitizeURL(url: string): string {
  const cleaned = DOMPurify.sanitize(url, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })

  // Additional check for javascript: and data: protocols
  if (cleaned.toLowerCase().startsWith('javascript:') ||
      cleaned.toLowerCase().startsWith('data:')) {
    return ''
  }

  return cleaned
}

/**
 * Sanitize a collection of strings
 */
export function sanitizeArray(items: string[]): string[] {
  return items.map(item => sanitizeText(item))
}

/**
 * Strip all scripts and event handlers from HTML
 * Most aggressive sanitization
 */
export function sanitizeStrict(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  })
}

/**
 * Configure DOMPurify with custom hooks
 * Call this once during app initialization
 */
export function configureSanitizer(): void {
  // Add a hook to enforce HTTPS on links
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      const href = node.getAttribute('href')
      if (href && !href.startsWith('https://') && !href.startsWith('/')) {
        node.setAttribute('href', '#')
      }
      // Always open external links in new tab
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })
}
