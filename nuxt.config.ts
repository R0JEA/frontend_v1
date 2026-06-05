import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: process.env.NODE_ENV === 'development' },

  modules: [
    '@pinia/nuxt',
  ],

  // Tailwind v4 is loaded as a Vite plugin (not a Nuxt module)
  vite: {
    plugins: [tailwindcss()],
  },

  // Global CSS entry — Tailwind v4 uses @import "tailwindcss" instead of directives
  css: ['~/assets/css/main.css'],

  // All keys here are server-side only (private).
  // They map to NUXT_<UPPER_SNAKE_CASE> env vars automatically.
  // e.g. authUsername → NUXT_AUTH_USERNAME
  runtimeConfig: {
    // Private — server-side only
    authUsername: '',
    authPassword: '',
    jwtSecret: '',
    backendUrl: '',
    // Public — exposed to the client (browser can read these)
    // Set NUXT_PUBLIC_TEST_MODE_AVAILABLE=false to hide the toggle and block it server-side
    public: {
      testModeAvailable: true,
    },
  },

  app: {
    head: {
      title: 'Python Unit Test Generator',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AI-powered Python unit test generator' },
      ],
    },
  },

  typescript: {
    strict: true,
  },

  compatibilityDate: '2024-08-20',
})
