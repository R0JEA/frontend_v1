import type { AuthCheckResponse } from '~/types'

// Global route guard — runs on every navigation.
// /login is the only public route; everything else requires a valid session cookie.
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') return

  try {
    const data = await $fetch<AuthCheckResponse>('/api/auth/me')
    if (!data.authenticated) return navigateTo('/login')
  } catch {
    return navigateTo('/login')
  }
})
