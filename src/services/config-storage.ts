import type { ShopInstance } from '@/types/shop'
import type { SavedRequest } from '@/types/saved-request'
import type { HistoryEntry } from '@/types/request'

async function loadArray<T>(key: string): Promise<T[]> {
  const res = await fetch(`/__config/${key}`)
  if (!res.ok) throw new Error(`Failed to load ${key}`)
  return res.json()
}

async function saveData(key: string, data: unknown): Promise<void> {
  const res = await fetch(`/__config/${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data, null, 2),
  })
  if (!res.ok) throw new Error(`Failed to save ${key}`)
}

export function loadShops(): Promise<ShopInstance[]> {
  return loadArray<ShopInstance>('shops')
}

export function saveShops(shops: ShopInstance[]): Promise<void> {
  return saveData('shops', shops)
}

export function loadSavedRequests(): Promise<SavedRequest[]> {
  return loadArray<SavedRequest>('saved-requests')
}

export function saveSavedRequests(requests: SavedRequest[]): Promise<void> {
  return saveData('saved-requests', requests)
}

export function loadHistory(): Promise<HistoryEntry[]> {
  return loadArray<HistoryEntry>('history')
}

export function saveHistory(entries: HistoryEntry[]): Promise<void> {
  return saveData('history', entries)
}

export async function loadConfig<T extends Record<string, unknown>>(key: string): Promise<T> {
  const res = await fetch(`/__config/${key}`)
  if (!res.ok) throw new Error(`Failed to load ${key}`)
  return res.json()
}

export function saveConfig(key: string, data: Record<string, unknown>): Promise<void> {
  return saveData(key, data)
}
