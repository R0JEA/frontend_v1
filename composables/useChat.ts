import type { ChatMessage, OutputFormat } from '~/types'

export const useChat = () => {
  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const generate = async (code: string, format: OutputFormat, model: string, filename?: string, testMode = false) => {
    loading.value = true
    error.value = null

    messages.value.push({
      id: `user-${Date.now()}`,
      role: 'user',
      content: code,
      format,
      timestamp: new Date(),
      filename,
    })

    try {
      const response = await $fetch<{ tests: string }>('/api/generate', {
        method: 'POST',
        body: { code, format, model, testMode },
      })

      messages.value.push({
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.tests,
        format,
        timestamp: new Date(),
      })
    } catch (err: unknown) {
      error.value = extractMessage(err)
    } finally {
      loading.value = false
    }
  }

  const clearHistory = () => {
    messages.value = []
    error.value = null
  }

  return { messages, loading, error, generate, clearHistory }
}

function extractMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    return e.data?.statusMessage || e.message || 'An unexpected error occurred'
  }
  return 'An unexpected error occurred'
}
