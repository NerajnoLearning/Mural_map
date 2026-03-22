import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuth } from '@clerk/vue'
import { watch } from 'vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomePage.vue'),
    meta: { title: 'Home - MuralMap' }
  },
  {
    path: '/discover',
    name: 'discover',
    component: () => import('@/views/DiscoverPage.vue'),
    meta: { title: 'Discover - MuralMap' }
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('@/views/MapPage.vue'),
    meta: { title: 'Map - MuralMap' }
  },
  {
    path: '/upload',
    name: 'upload',
    component: () => import('@/views/UploadPage.vue'),
    meta: { requiresAuth: true, title: 'Upload Mural - MuralMap' }
  },
  {
    path: '/collections',
    name: 'collections',
    component: () => import('@/views/CollectionsPage.vue'),
    meta: { requiresAuth: true, title: 'My Collections - MuralMap' }
  },
  {
    path: '/collections/:id',
    name: 'collection-detail',
    component: () => import('@/views/CollectionDetailPage.vue'),
    props: true,
    meta: { title: 'Collection - MuralMap' }
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/views/FavoritesPage.vue'),
    meta: { requiresAuth: true, title: 'My Favorites - MuralMap' }
  },
  {
    path: '/friends',
    name: 'friends',
    component: () => import('@/views/FriendsPage.vue'),
    meta: { requiresAuth: true, title: 'Friends - MuralMap' }
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import('@/views/NotificationsPage.vue'),
    meta: { requiresAuth: true, title: 'Notifications - MuralMap' }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/SearchPage.vue'),
    meta: { title: 'Search - MuralMap' }
  },
  {
    path: '/trending',
    name: 'trending',
    component: () => import('@/views/TrendingPage.vue'),
    meta: { title: 'Trending - MuralMap' }
  },
  {
    path: '/activity',
    name: 'activity',
    component: () => import('@/views/ActivityPage.vue'),
    meta: { requiresAuth: true, title: 'Activity - MuralMap' }
  },
  {
    path: '/profile/:username',
    name: 'profile',
    component: () => import('@/views/ProfilePage.vue'),
    props: true,
    meta: { title: 'Profile - MuralMap' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsPage.vue'),
    meta: { requiresAuth: true, title: 'Settings - MuralMap' }
  },
  {
    path: '/drafts',
    name: 'drafts',
    component: () => import('@/views/DraftsPage.vue'),
    meta: { requiresAuth: true, title: 'Drafts - MuralMap' }
  },
  {
    path: '/post/:id',
    name: 'post-detail',
    component: () => import('@/views/PostDetailPage.vue'),
    props: true,
    meta: { title: 'Mural - MuralMap' }
  },
  // Clerk auth routes
  {
    path: '/sign-in',
    name: 'signin',
    component: () => import('@/views/auth/ClerkSignInPage.vue'),
    meta: { guestOnly: true, title: 'Sign In - MuralMap' }
  },
  {
    path: '/sign-up',
    name: 'signup',
    component: () => import('@/views/auth/ClerkSignUpPage.vue'),
    meta: { guestOnly: true, title: 'Sign Up - MuralMap' }
  },
  {
    path: '/user-profile',
    name: 'user-profile',
    component: () => import('@/views/auth/UserProfilePage.vue'),
    meta: { requiresAuth: true, title: 'Profile - MuralMap' }
  },
  // Legacy auth routes (keep for backward compatibility, redirect to Clerk)
  {
    path: '/auth/signin',
    redirect: '/sign-in'
  },
  {
    path: '/auth/signup',
    redirect: '/sign-up'
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('@/views/OnboardingPage.vue'),
    meta: { requiresAuth: true, title: 'Complete Your Profile - MuralMap' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundPage.vue'),
    meta: { title: '404 - MuralMap' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      return { top: 0 }
    }
  }
})

// Lazy initialization of Clerk auth
let clerkAuth: ReturnType<typeof useAuth> | null = null

function getClerkAuth() {
  if (!clerkAuth) {
    clerkAuth = useAuth()
  }
  return clerkAuth
}

// Waits for Clerk to finish loading before proceeding
const waitForClerk = (): Promise<void> =>
  new Promise(resolve => {
    const auth = getClerkAuth()
    if (auth.isLoaded.value) return resolve()
    const stop = watch(auth.isLoaded, (val) => {
      if (val) { stop(); resolve() }
    })
  })

// Navigation guards
router.beforeEach(async (to) => {
  // Set page title
  document.title = (to.meta.title as string) || 'MuralMap'

  const requiresAuth = to.meta.requiresAuth
  const guestOnly = to.meta.guestOnly

  try {
    await waitForClerk()
    const auth = getClerkAuth()

    if (requiresAuth && !auth.isSignedIn.value) {
      return {
        name: 'signin',
        query: { redirect: to.fullPath }
      }
    }

    if (guestOnly && auth.isSignedIn.value) {
      return { name: 'home' }
    }

    return true
  } catch (error) {
    const { logger } = await import('@/utils/logger')
    logger.error('Clerk not available:', error)
    if (requiresAuth) {
      return { name: 'signin' }
    }
    return true
  }
})

export default router
