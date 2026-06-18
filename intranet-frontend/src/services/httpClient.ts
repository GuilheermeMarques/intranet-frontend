export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message)
  }
}

const BASE = '/api/backend'

function toQuery(params?: Record<string, unknown>): string {
  if (!params) return ''
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    sp.set(key, value instanceof Date ? value.toISOString() : String(value))
  }
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

async function request<T>(method: string, path: string, opts: { params?: Record<string, unknown>; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}${toQuery(opts.params)}`, {
    method,
    headers: opts.body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })

  if (res.status === 204) return undefined as T

  const text = await res.text()
  const data = text ? JSON.parse(text) : undefined

  if (!res.ok) {
    const message = (data && (data.message as string)) ?? `Request failed (${res.status})`
    throw new ApiError(res.status, message, data)
  }

  return data as T
}

export const httpClient = {
  get: <T>(path: string, params?: Record<string, unknown>) => request<T>('GET', path, { params }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
