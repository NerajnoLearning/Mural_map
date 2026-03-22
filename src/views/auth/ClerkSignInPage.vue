<script setup lang="ts">
import { SignIn } from '@clerk/vue'
</script>

<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-16">
    <div class="w-full max-w-md">
      <div class="text-center mb-32">
        <router-link to="/" class="inline-block">
          <h1 class="text-3xl font-bold text-primary">MuralMap</h1>
        </router-link>
      </div>
      <SignIn
        path="/sign-in"
        routing="path"
        sign-up-url="/sign-up"
        after-sign-in-url="/"
      />
    </div>
  </div>
</template>

<style scoped>
/* Clerk components will use their default styling */
</style>
