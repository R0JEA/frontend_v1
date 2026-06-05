<script setup lang="ts">
const { login, error, loading } = useAuth()

const username = ref('')
const password = ref('')

async function handleSubmit() {
  if (!username.value.trim() || !password.value) return
  await login(username.value.trim(), password.value)
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">

      <!-- Branding -->
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">🐍</div>
        <h1 class="text-2xl font-bold text-white tracking-tight">PyTest Generator</h1>
        <p class="text-slate-400 text-sm mt-1">AI-powered Python unit test generation</p>
      </div>

      <!-- Card -->
      <div class="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
        <h2 class="text-base font-semibold text-white mb-6">Admin Sign In</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">
              Username
            </label>
            <input
              v-model="username"
              type="text"
              autocomplete="username"
              required
              :disabled="loading"
              class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm
                     placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:opacity-50 transition-colors"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              :disabled="loading"
              class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm
                     placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:opacity-50 transition-colors"
              placeholder="Enter password"
            />
          </div>

          <!-- Error message -->
          <div
            v-if="error"
            class="bg-red-950/60 border border-red-700/60 rounded-lg px-3 py-2.5 text-red-300 text-sm"
          >
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading || !username.trim() || !password"
            class="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500
                   disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg
                   transition-colors duration-150 text-sm mt-2"
          >
            <span v-if="loading">Signing in…</span>
            <span v-else>Sign in</span>
          </button>
        </form>
      </div>

    </div>
  </div>
</template>
