import type { HttpMethod, ShopwareVersion } from './shopware'

export interface SavedRequest {
  id: string
  name: string
  path: string
  method: HttpMethod
  body: string
  customHeaders: Array<{ key: string; value: string }>
  queryParams: Array<{ key: string; value: string }>
  originShopId: string | null
  originBaseUrl: string
  originVersion: ShopwareVersion
  createdAt: number
  updatedAt: number
}
