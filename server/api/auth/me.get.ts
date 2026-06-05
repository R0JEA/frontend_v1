import { verifyToken } from '~/server/utils/jwt'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth_token')

  if (!token) return { authenticated: false }

  const payload = verifyToken(token, config.jwtSecret)
  if (!payload) return { authenticated: false }

  return { authenticated: true, username: payload['username'] as string }
})
