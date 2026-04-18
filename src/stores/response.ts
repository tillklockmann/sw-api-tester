import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiResponse } from '@/types/request'
import { getStatusCategory } from '@/types/request'

export const useResponseStore = defineStore('response', () => {
  const current = ref<ApiResponse | null>(null)
  const error = ref<string | null>(null)

  const statusCategory = computed(() => {
    if (!current.value || current.value.status === 0) return 'error'
    return getStatusCategory(current.value.status)
  })

  const formattedBody = computed(() => {
    if (!current.value?.body) return ''
    try {
      return JSON.stringify(JSON.parse(current.value.body), null, 2)
    } catch {
      return current.value.body
    }
  })

  function setResponse(response: ApiResponse | null, err: string | null = null) {
    current.value = response
    error.value = err
  }

  function clear() {
    current.value = null
    error.value = null
  }

  return {
    current,
    error,
    statusCategory,
    formattedBody,
    setResponse,
    clear,
  }
})
