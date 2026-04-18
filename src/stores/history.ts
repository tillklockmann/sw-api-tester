import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { HistoryEntry } from '@/types/request'
import { loadHistory, saveHistory } from '@/services/config-storage'

const MAX_HISTORY = 100

export const useHistoryStore = defineStore('history', () => {
  const entries = ref<HistoryEntry[]>([])
  const isLoaded = ref(false)

  async function loadFromDisk() {
    try {
      entries.value = await loadHistory()
    } catch {
      entries.value = []
    }
    isLoaded.value = true
  }

  async function saveToDisk() {
    try {
      await saveHistory(entries.value)
    } catch (err) {
      console.warn('Failed to save history:', err)
    }
  }

  async function addEntry(entry: HistoryEntry) {
    entries.value.unshift(entry)
    if (entries.value.length > MAX_HISTORY) {
      entries.value = entries.value.slice(0, MAX_HISTORY)
    }
    await saveToDisk()
  }

  async function clearHistory() {
    entries.value = []
    await saveToDisk()
  }

  return { entries, isLoaded, addEntry, clearHistory, loadFromDisk }
})
