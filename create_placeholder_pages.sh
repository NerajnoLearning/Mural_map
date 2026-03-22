#!/bin/bash

# Create placeholder pages for MuralMap

cat > src/views/MapPage.vue << 'EOF'
<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen bg-surface p-24">
    <h1 class="text-2xl font-bold">Map</h1>
    <p class="text-text-muted mt-8">Interactive mural map - Coming soon</p>
  </div>
</template>
EOF

cat > src/views/UploadPage.vue << 'EOF'
<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen bg-surface p-24">
    <h1 class="text-2xl font-bold">Upload Mural</h1>
    <p class="text-text-muted mt-8">Upload and log murals - Coming soon</p>
  </div>
</template>
EOF

cat > src/views/CollectionsPage.vue << 'EOF'
<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen bg-surface p-24">
    <h1 class="text-2xl font-bold">My Collections</h1>
    <p class="text-text-muted mt-8">Organize murals into collections - Coming soon</p>
  </div>
</template>
EOF

cat > src/views/CollectionDetailPage.vue << 'EOF'
<script setup lang="ts">
const props = defineProps<{ id: string }>()
</script>
<template>
  <div class="min-h-screen bg-surface p-24">
    <h1 class="text-2xl font-bold">Collection: {{ id }}</h1>
    <p class="text-text-muted mt-8">Collection details - Coming soon</p>
  </div>
</template>
EOF

cat > src/views/FavoritesPage.vue << 'EOF'
<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen bg-surface p-24">
    <h1 class="text-2xl font-bold">Favorites</h1>
    <p class="text-text-muted mt-8">Your favorited murals - Coming soon</p>
  </div>
</template>
EOF

cat > src/views/FriendsPage.vue << 'EOF'
<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen bg-surface p-24">
    <h1 class="text-2xl font-bold">Friends</h1>
    <p class="text-text-muted mt-8">Connect with friends - Coming soon</p>
  </div>
</template>
EOF

cat > src/views/NotificationsPage.vue << 'EOF'
<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen bg-surface p-24">
    <h1 class="text-2xl font-bold">Notifications</h1>
    <p class="text-text-muted mt-8">Your activity notifications - Coming soon</p>
  </div>
</template>
EOF

cat > src/views/ProfilePage.vue << 'EOF'
<script setup lang="ts">
const props = defineProps<{ username: string }>()
</script>
<template>
  <div class="min-h-screen bg-surface p-24">
    <h1 class="text-2xl font-bold">Profile: @{{ username }}</h1>
    <p class="text-text-muted mt-8">User profile - Coming soon</p>
  </div>
</template>
EOF

cat > src/views/SettingsPage.vue << 'EOF'
<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen bg-surface p-24">
    <h1 class="text-2xl font-bold">Settings</h1>
    <p class="text-text-muted mt-8">Account settings - Coming soon</p>
  </div>
</template>
EOF

cat > src/views/DraftsPage.vue << 'EOF'
<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen bg-surface p-24">
    <h1 class="text-2xl font-bold">Drafts</h1>
    <p class="text-text-muted mt-8">Your saved drafts - Coming soon</p>
  </div>
</template>
EOF

cat > src/views/PostDetailPage.vue << 'EOF'
<script setup lang="ts">
const props = defineProps<{ id: string }>()
</script>
<template>
  <div class="min-h-screen bg-surface p-24">
    <h1 class="text-2xl font-bold">Mural: {{ id }}</h1>
    <p class="text-text-muted mt-8">Mural detail page - Coming soon</p>
  </div>
</template>
EOF

cat > src/views/NotFoundPage.vue << 'EOF'
<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-24">
    <div class="text-center">
      <h1 class="text-3xl font-bold mb-16">404</h1>
      <p class="text-text-muted mb-24">Page not found</p>
      <router-link to="/" class="px-24 py-12 bg-primary text-white rounded-lg">
        Go Home
      </router-link>
    </div>
  </div>
</template>
EOF

cat > src/views/OnboardingPage.vue << 'EOF'
<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen bg-surface p-24">
    <h1 class="text-2xl font-bold">Complete Your Profile</h1>
    <p class="text-text-muted mt-8">Profile onboarding - Coming soon</p>
  </div>
</template>
EOF

# Auth pages
cat > src/views/auth/SignInPage.vue << 'EOF'
<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-24">
    <div class="w-full max-w-md">
      <h1 class="text-2xl font-bold mb-24 text-center">Sign In</h1>
      <p class="text-text-muted text-center">Authentication UI - Coming soon</p>
      <div class="mt-24 text-center">
        <router-link to="/auth/signup" class="text-primary">
          Need an account? Sign up
        </router-link>
      </div>
    </div>
  </div>
</template>
EOF

cat > src/views/auth/SignUpPage.vue << 'EOF'
<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-24">
    <div class="w-full max-w-md">
      <h1 class="text-2xl font-bold mb-24 text-center">Sign Up</h1>
      <p class="text-text-muted text-center">Registration UI - Coming soon</p>
      <div class="mt-24 text-center">
        <router-link to="/auth/signin" class="text-primary">
          Already have an account? Sign in
        </router-link>
      </div>
    </div>
  </div>
</template>
EOF

cat > src/views/auth/ForgotPasswordPage.vue << 'EOF'
<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-24">
    <div class="w-full max-w-md">
      <h1 class="text-2xl font-bold mb-24 text-center">Forgot Password</h1>
      <p class="text-text-muted text-center">Password reset - Coming soon</p>
      <div class="mt-24 text-center">
        <router-link to="/auth/signin" class="text-primary">
          Back to sign in
        </router-link>
      </div>
    </div>
  </div>
</template>
EOF

echo "All placeholder pages created successfully!"
