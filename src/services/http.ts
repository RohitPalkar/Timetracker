/**
 * HTTP client abstraction.
 *
 * In mock mode (no VITE_API_BASE_URL configured) requests resolve against
 * the in-app mock registry. When a backend is wired up later, set
 * VITE_API_BASE_URL and implement the fetch path — nothing else changes.
 */

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
  signal?: AbortSignal
}

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status = 500, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ''

export const IS_MOCK_MODE = API_BASE_URL === ''

export function notImplemented(domain: string): never {
  throw new ApiError(`${domain} service is not implemented yet.`, 501, 'NOT_IMPLEMENTED')
}

export function mockDelay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const base = API_BASE_URL.replace(/\/$/, '')
  const query = params
    ? Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&')
    : ''
  return `${base}${path}${query ? `?${query}` : ''}`
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (IS_MOCK_MODE) {
    throw new ApiError(
      'No mock handler registered for this request. Add a handler in services/mock.',
      501,
      'NO_MOCK_HANDLER',
    )
  }

  const { method = 'GET', body, params, headers, signal } = options

  let response: Response
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include',
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }
    throw new ApiError('Network error. Please try again.', 0, 'NETWORK')
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const payload = (await response.json()) as { message?: string; code?: string }
      if (payload.message) message = payload.message
      throw new ApiError(message, response.status, payload.code)
    } catch (error) {
      if (error instanceof ApiError) throw error
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const api = {
  get: <T>(path: string, params?: RequestOptions['params'], signal?: AbortSignal) =>
    request<T>(path, { params, signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
