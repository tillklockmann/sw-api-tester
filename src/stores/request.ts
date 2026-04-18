import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { HttpMethod } from '@/types/shopware'

export const useRequestStore = defineStore('request', () => {
  const path = ref('')
  const method = ref<HttpMethod>('GET')
  const body = ref('')
  const customHeaders = ref<Array<{ key: string; value: string }>>([])
  const queryParams = ref<Array<{ key: string; value: string }>>([])
  const isLoading = ref(false)

  function setEndpoint(newPath: string, defaultMethod?: HttpMethod) {
    path.value = newPath
    if (defaultMethod) {
      method.value = defaultMethod
    }
  }

  function setBody(json: string) {
    body.value = json
  }

  function reset() {
    path.value = ''
    method.value = 'GET'
    body.value = ''
    customHeaders.value = []
    queryParams.value = []
  }

  return {
    path,
    method,
    body,
    customHeaders,
    queryParams,
    isLoading,
    setEndpoint,
    setBody,
    reset,
  }
})
