import { verifyToken } from '~/server/utils/jwt'
import { getRandomMockTests, simulateLatency } from '~/server/utils/mockData'
import type { GenerateRequest, GenerateResponse } from '~/types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const token = getCookie(event, 'auth_token')
  if (!token || !verifyToken(token, config.jwtSecret)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<GenerateRequest>(event)

  if (!body?.code?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Python code is required' })
  }

  const format = body.format === 'unittest' ? 'unittest' : 'pytest'
  const model = body.model?.trim() || 'model1'

  // ── Test mode ────────────────────────────────────────────────────────────
  // Blocked server-side when NUXT_PUBLIC_TEST_MODE_AVAILABLE=false,
  // regardless of what the client sends.
  if (body.testMode === true) {
    if (!config.public.testModeAvailable) {
      throw createError({ statusCode: 403, statusMessage: 'Test mode is disabled in this environment' })
    }
    await simulateLatency()
    return {
      tests: getRandomMockTests(format),
      model: 'mock',
      tokens_used: 0,
    } satisfies GenerateResponse
  }

  // ── Real backend ─────────────────────────────────────────────────────────
  if (!config.backendUrl) {
    throw createError({ statusCode: 503, statusMessage: 'No backend URL configured. Enable Test Mode or set NUXT_BACKEND_URL.' })
  }

  const response = await $fetch<GenerateResponse>(`${config.backendUrl}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: body.code, format, model }),
  }).catch((err: Error) => {
    throw createError({ statusCode: 502, statusMessage: `Backend unavailable: ${err.message}` })
  })

  return response
})
