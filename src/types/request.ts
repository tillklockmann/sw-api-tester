import type { HttpMethod } from './shopware'

export interface ApiRequest {
  url: string
  method: HttpMethod
  headers: Record<string, string>
  body: string | null
  timestamp: number
}

export interface ApiResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  size: number
  duration: number
  timestamp: number
}

export interface HistoryEntry {
  id: string
  request: ApiRequest
  response: ApiResponse | null
  error: string | null
}

export type StatusCategory = '2xx' | '3xx' | '4xx' | '5xx' | 'error'

export function getStatusCategory(status: number): StatusCategory {
  if (status >= 200 && status < 300) return '2xx'
  if (status >= 300 && status < 400) return '3xx'
  if (status >= 400 && status < 500) return '4xx'
  return '5xx'
}
