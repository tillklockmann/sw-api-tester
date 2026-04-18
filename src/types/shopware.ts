export type ApiMode = 'admin' | 'store'
export type ShopwareVersion = '6.7' | '6.6'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface OAuthTokenResponse {
  token_type: string
  expires_in: number
  access_token: string
}

export interface AdminAuthConfig {
  clientId: string
  clientSecret: string
}

export interface StoreApiAuthConfig {
  accessKey: string
  contextToken: string
}

export interface ConnectionConfig {
  baseUrl: string
  apiMode: ApiMode
  version: ShopwareVersion
  adminAuth: AdminAuthConfig
  storeAuth: StoreApiAuthConfig
}

export interface SyncOperation {
  entity: string
  action: 'upsert' | 'delete'
  payload: Record<string, unknown>[]
}

export interface SyncPayload {
  [operationName: string]: SyncOperation
}

export interface SearchCriteria {
  limit: number
  page: number
  filter: SearchFilter[]
  sort: SearchSort[]
  associations: Record<string, unknown>
  includes: Record<string, string[]>
}

export interface SearchFilter {
  type: string
  field: string
  value: unknown
}

export interface SearchSort {
  field: string
  order: 'ASC' | 'DESC'
}
