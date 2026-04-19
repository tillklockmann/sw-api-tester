import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useConnectionStore } from './connection'
import { loadSummary, loadFullSpec } from '@/services/openapi-loader'
import { extractEndpoints, getMethodsForPath, getEndpointDetail, getEntityNames } from '@/services/openapi-parser'
import { generateTemplateJson, type TemplateOptions } from '@/services/schema-template'
import type { OpenApiSpec, EndpointInfo } from '@/types/openapi'
import type { HttpMethod } from '@/types/shopware'

export const useOpenApiStore = defineStore('openapi', () => {
  const connection = useConnectionStore()

  const summaryPaths = ref<string[]>([])
  const endpoints = ref<EndpointInfo[]>([])
  const fullSpec = ref<OpenApiSpec | null>(null)
  const isLoadingSpec = ref(false)
  const entityNames = ref<string[]>([])

  // Merged paths from summary + commercial summary
  const allPaths = computed(() => summaryPaths.value)

  function reloadSummary() {
    const summary = loadSummary(connection.apiMode, connection.version)
    summaryPaths.value = summary.paths
  }

  async function loadSpec() {
    if (isLoadingSpec.value) return
    isLoadingSpec.value = true
    try {
      const spec = await loadFullSpec(connection.apiMode, connection.version, true)
      fullSpec.value = spec
      endpoints.value = extractEndpoints(spec)
      entityNames.value = getEntityNames(spec)
    } finally {
      isLoadingSpec.value = false
    }
  }

  function getMethodsFor(path: string): HttpMethod[] {
    if (!fullSpec.value) return ['GET']
    return getMethodsForPath(fullSpec.value, path)
  }

  function getTemplateForEndpoint(path: string, method: string, options: TemplateOptions = {}): string {
    if (!fullSpec.value) return ''
    const detail = getEndpointDetail(fullSpec.value, path, method)
    if (!detail?.requestBodySchema) return ''
    return generateTemplateJson(fullSpec.value, detail.requestBodySchema, options)
  }

  function getEndpointSummary(path: string, method: string): string {
    if (!fullSpec.value) return ''
    const detail = getEndpointDetail(fullSpec.value, path, method)
    return detail?.summary ?? ''
  }

  // Watch for API mode and version changes
  watch(
    () => [connection.apiMode, connection.version],
    () => {
      reloadSummary()
      fullSpec.value = null
      endpoints.value = []
      entityNames.value = []
      // Lazy-load full spec
      loadSpec()
    },
    { immediate: true },
  )

  return {
    summaryPaths,
    endpoints,
    allPaths,
    fullSpec,
    isLoadingSpec,
    entityNames,
    reloadSummary,
    loadSpec,
    getMethodsFor,
    getTemplateForEndpoint,
    getEndpointSummary,
  }
})
