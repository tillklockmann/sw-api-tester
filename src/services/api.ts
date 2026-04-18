import type { ApiRequest, ApiResponse } from '@/types/request'
import type { ApiMode, HttpMethod } from '@/types/shopware'

export interface RequestOptions {
  baseUrl: string
  path: string
  method: HttpMethod
  headers?: Record<string, string>
  body?: string | null
  apiMode: ApiMode
  token?: string | null
  accessKey?: string | null
  contextToken?: string | null
}

export interface RequestResult {
  request: ApiRequest
  response: ApiResponse | null
  error: string | null
  newContextToken: string | null
}

export async function executeRequest(options: RequestOptions): Promise<RequestResult> {
  const {
    baseUrl,
    path,
    method,
    headers = {},
    body = null,
    apiMode,
    token,
    accessKey,
    contextToken,
  } = options

  const base = baseUrl.replace(/\/+$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const prefix = apiMode === 'admin' ? '/api' : '/store-api'
  // Don't double-prefix if the user already typed /api or /store-api
  const fullPath = cleanPath.startsWith(prefix) ? cleanPath : `${prefix}${cleanPath}`
  const url = `${base}${fullPath}`

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  }

  // Auth headers
  if (apiMode === 'admin' && token) {
    requestHeaders['Authorization'] = `Bearer ${token}`
  } else if (apiMode === 'store') {
    if (accessKey) {
      requestHeaders['sw-access-key'] = accessKey
    }
    if (contextToken) {
      requestHeaders['sw-context-token'] = contextToken
    }
  }

  const request: ApiRequest = {
    url,
    method,
    headers: requestHeaders,
    body: method !== 'GET' ? body : null,
    timestamp: Date.now(),
  }

  const startTime = performance.now()

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
    }

    if (method !== 'GET' && body) {
      fetchOptions.body = body
    }

    const res = await fetch(url, fetchOptions)
    const duration = Math.round(performance.now() - startTime)

    const responseHeaders: Record<string, string> = {}
    res.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    const responseBody = await res.text()

    // Extract new context token from store API responses
    const newContextToken = responseHeaders['sw-context-token'] ?? null

    const response: ApiResponse = {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
      body: responseBody,
      size: new Blob([responseBody]).size,
      duration,
      timestamp: Date.now(),
    }

    return { request, response, error: null, newContextToken }
  } catch (err) {
    const duration = Math.round(performance.now() - startTime)
    return {
      request,
      response: {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        body: '',
        size: 0,
        duration,
        timestamp: Date.now(),
      },
      error: err instanceof Error ? err.message : String(err),
      newContextToken: null,
    }
  }
}
