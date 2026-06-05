import { signToken } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{ username?: string; password?: string }>(event)

  if (!body?.username || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Username and password required' })
  }

  if (body.username !== config.authUsername || body.password !== config.authPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const token = signToken({ username: body.username }, config.jwtSecret)

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })

  return { success: true }
})
