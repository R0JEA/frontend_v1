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
  <div
    class="min-h-screen flex items-center justify-center p-6"
    style="background: linear-gradient(135deg, #fce4ec 0%, #f3e5f5 30%, #e8eaf6 60%, #e3f2fd 80%, #e0f7fa 100%)"
  >
    <div class="w-full max-w-sm">

      <!-- Branding -->
      <div class="text-center mb-8">
        <div class="text-6xl mb-4">🐍</div>
        <h1 class="text-3xl font-bold text-tum-blue-dark tracking-tight">TU PyTest</h1>
        <p class="text-sm text-tum-blue-mid mt-2">AI-powered unit test generation</p>
      </div>

      <!-- Glass card -->
      <div
        class="rounded-3xl p-8 shadow-xl"
        style="background: rgba(255,255,255,0.65); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1.5px solid rgba(255,255,255,0.9);"
      >
        <h2 class="text-base font-semibold text-tum-blue-dark mb-6">Admin Sign In</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">

          <div>
            <label class="block text-xs font-semibold text-tum-blue uppercase tracking-widest mb-2">Username</label>
            <input
              v-model="username"
              type="text"
              autocomplete="username"
              required
              :disabled="loading"
              placeholder="Enter username"
              class="w-full rounded-2xl px-4 py-3 text-sm text-tum-blue-dark outline-none placeholder:text-tum-blue-light disabled:opacity-50 transition-shadow"
              style="background: rgba(255,255,255,0.8); border: 1.5px solid rgba(0,101,189,0.25);"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-tum-blue uppercase tracking-widest mb-2">Password</label>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              :disabled="loading"
              placeholder="Enter password"
              class="w-full rounded-2xl px-4 py-3 text-sm text-tum-blue-dark outline-none placeholder:text-tum-blue-light disabled:opacity-50 transition-shadow"
              style="background: rgba(255,255,255,0.8); border: 1.5px solid rgba(0,101,189,0.25);"
            />
          </div>

          <div
            v-if="error"
            class="rounded-2xl px-4 py-3 text-sm text-red-500"
            style="background: rgba(254,202,202,0.45); border: 1px solid rgba(252,165,165,0.5);"
          >
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading || !username.trim() || !password"
            class="w-full mt-2 rounded-full py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style="background: #0065BD; border: 1px solid rgba(255,255,255,0.35); box-shadow: 0 4px 18px rgba(0,101,189,0.35), inset 0 1px 0 rgba(255,255,255,0.3);"
          >
            {{ loading ? 'Signing in…' : 'Sign in →' }}
          </button>

        </form>
      </div>

    </div>
  </div>
</template>
