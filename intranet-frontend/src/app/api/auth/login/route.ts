import { NextRequest, NextResponse } from 'next/server'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
  cookieOptions,
  BACKEND_API_URL,
} from '@/services/authCookies'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  const res = await fetch(`${BACKEND_API_URL}/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    return NextResponse.json(
      { message: error.message ?? 'Credenciais inválidas.' },
      { status: res.status },
    )
  }

  const { accessToken, refreshToken } = await res.json()

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions(ACCESS_MAX_AGE))
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions(REFRESH_MAX_AGE))
  return response
}
