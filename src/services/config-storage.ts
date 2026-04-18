import type { ShopInstance } from '@/types/shop'
import type { SavedRequest } from '@/types/saved-request'

async function load<T>(key: string): Promise<T[]> {
  const res = await fetch(`/__config/${key}`)
  if (!res.ok) throw new Error(`Failed to load ${key}`)
  return res.json()
}

async function save<T>(key: string, data: T[]): Promise<void> {
  const res = await fetch(`/__config/${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data, null, 2),
  })
  if (!res.ok) throw new Error(`Failed to save ${key}`)
}

export function loadShops(): Promise<ShopInstance[]> {
  return load<ShopInstance>('shops')
}

export function saveShops(shops: ShopInstance[]): Promise<void> {
  return save('shops', shops)
}

export function loadSavedRequests(): Promise<SavedRequest[]> {
  return load<SavedRequest>('saved-requests')
}

export function saveSavedRequests(requests: SavedRequest[]): Promise<void> {
  return save('saved-requests', requests)
}
