export const useAuth = () => {
  const router = useRouter()
  const error = ref<string | null>(null)
  const loading = ref(false)

  const login = async (username: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: { username, password },
      })
      await router.push('/chat')
    } catch (err: unknown) {
      error.value = extractMessage(err) || 'Login failed'
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    await router.push('/login')
  }

  return { login, logout, error, loading }
}

function extractMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    return e.data?.statusMessage || e.message || ''
  }
  return ''
}
