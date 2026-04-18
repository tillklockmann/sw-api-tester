import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { HistoryEntry } from '@/types/request'

const MAX_HISTORY = 100

export const useHistoryStore = defineStore(
  'history',
  () => {
    const entries = ref<HistoryEntry[]>([])

    function addEntry(entry: HistoryEntry) {
      entries.value.unshift(entry)
      if (entries.value.length > MAX_HISTORY) {
        entries.value = entries.value.slice(0, MAX_HISTORY)
      }
    }

    function clearHistory() {
      entries.value = []
    }

    return { entries, addEntry, clearHistory }
  },
  {
    persist: true,
  },
)
