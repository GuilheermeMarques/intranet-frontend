import { NextRequest, NextResponse } from 'next/server'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
  cookieOptions,
  BACKEND_API_URL,
} from '@/services/authCookies'

async function handler(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  const targetPath = path.join('/')
  const search = request.nextUrl.search
  const method = request.method
  const contentType = request.headers.get('content-type') ?? ''

  // Cache the body once so we can retry after a refresh.
  const hasBody = !['GET', 'HEAD'].includes(method)
  const bodyBuffer = hasBody ? Buffer.from(await request.arrayBuffer()) : undefined

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value

  async function call(token?: string) {
    const headers = new Headers()
    if (token) headers.set('authorization', `Bearer ${token}`)
    if (contentType) headers.set('content-type', contentType)
    return fetch(`${BACKEND_API_URL}/${targetPath}${search}`, {
      method,
      headers,
      body: bodyBuffer,
      cache: 'no-store',
    })
  }

  let res = await call(accessToken)
  let refreshed: { accessToken: string; refreshToken: string } | null = null

  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${BACKEND_API_URL}/sessions/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    })
    if (refreshRes.ok) {
      refreshed = await refreshRes.json()
      res = await call(refreshed!.accessToken)
    }
  }

  // 204/304 responses must not carry a body (Next throws otherwise).
  const hasNoBody = res.status === 204 || res.status === 304
  const responseBody = hasNoBody ? null : await res.arrayBuffer()
  const response = new NextResponse(responseBody, {
    status: res.status,
    headers: hasNoBody
      ? undefined
      : { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  })

  if (refreshed) {
    response.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.accessToken, cookieOptions(ACCESS_MAX_AGE))
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.refreshToken, cookieOptions(REFRESH_MAX_AGE))
  }

  return response
}

export {
  handler as GET,
  handler as POST,
  handler as PATCH,
  handler as PUT,
  handler as DELETE,
}
