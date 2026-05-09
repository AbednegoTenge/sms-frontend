export interface JWTPayload {
  user_id: string
  school_id: string
  active_role: string
  must_change_password: boolean
  exp: number
  iat: number
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload as JWTPayload
  } catch {
    return null
  }
}
