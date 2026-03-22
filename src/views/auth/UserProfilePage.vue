<script setup lang="ts">
import { UserProfile } from '@clerk/vue'
</script>

<template>
  <div class="min-h-screen bg-surface p-16">
    <div class="max-w-4xl mx-auto">
      <UserProfile
        path="/user-profile"
        routing="path"
      />
    </div>
  </div>
</template>

<style scoped>
/* Clerk components will use their default styling */
</style>
