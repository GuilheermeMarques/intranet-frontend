export const ACCESS_TOKEN_COOKIE = 'intranet_access_token'
export const REFRESH_TOKEN_COOKIE = 'intranet_refresh_token'

export const ACCESS_MAX_AGE = 60 * 15 // 15 min
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  }
}

export const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3001/api/v1'
