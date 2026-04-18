import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SavedRequest } from '@/types/saved-request'
import { loadSavedRequests, saveSavedRequests } from '@/services/config-storage'

const MAX_SAVED_REQUESTS = 200

export const useSavedRequestsStore = defineStore('savedRequests', () => {
  const requests = ref<SavedRequest[]>([])
  const isLoaded = ref(false)

  const groupedByPath = computed(() => {
    const groups = new Map<string, SavedRequest[]>()
    for (const req of requests.value) {
      const key = req.path || '(custom)'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(req)
    }
    return groups
  })

  async function loadFromDisk() {
    try {
      requests.value = await loadSavedRequests()
    } catch {
      requests.value = []
    }
    isLoaded.value = true
  }

  async function saveToDisk() {
    try {
      await saveSavedRequests(requests.value)
    } catch (err) {
      console.warn('Failed to save requests:', err)
    }
  }

  async function addRequest(
    req: Omit<SavedRequest, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<SavedRequest> {
    const newReq: SavedRequest = {
      ...req,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    requests.value.unshift(newReq)
    if (requests.value.length > MAX_SAVED_REQUESTS) {
      requests.value = requests.value.slice(0, MAX_SAVED_REQUESTS)
    }
    await saveToDisk()
    return newReq
  }

  async function removeRequest(id: string) {
    requests.value = requests.value.filter((r) => r.id !== id)
    await saveToDisk()
  }

  async function clearAll() {
    requests.value = []
    await saveToDisk()
  }

  return {
    requests,
    isLoaded,
    groupedByPath,
    loadFromDisk,
    addRequest,
    removeRequest,
    clearAll,
  }
})
