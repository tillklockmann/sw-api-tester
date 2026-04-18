import type { ShopwareVersion } from './shopware'

export interface ShopInstance {
  id: string
  name: string
  baseUrl: string
  version: ShopwareVersion
  clientId: string
  clientSecret: string
  accessKey: string
  createdAt: number
  updatedAt: number
}
