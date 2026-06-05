import jwt from 'jsonwebtoken'

export function signToken(payload: object, secret: string): string {
  return jwt.sign(payload, secret, { expiresIn: '8h' })
}

export function verifyToken(token: string, secret: string): jwt.JwtPayload | null {
  try {
    const decoded = jwt.verify(token, secret)
    return typeof decoded === 'object' && decoded !== null ? (decoded as jwt.JwtPayload) : null
  } catch {
    return null
  }
}
