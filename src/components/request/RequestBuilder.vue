<script setup lang="ts">
import { ref } from 'vue'
import { useRequestStore } from '@/stores/request'
import { useConnectionStore } from '@/stores/connection'
import { useResponseStore } from '@/stores/response'
import { useHistoryStore } from '@/stores/history'
import { useShopsStore } from '@/stores/shops'
import { useSavedRequestsStore } from '@/stores/saved-requests'
import { executeRequest } from '@/services/api'
import { useOpenApiStore } from '@/stores/openapi'
import EndpointSelector from './EndpointSelector.vue'
import MethodSelector from './MethodSelector.vue'
import SendButton from './SendButton.vue'
import JsonEditor from '@/components/common/JsonEditor.vue'
import TabBar from '@/components/common/TabBar.vue'
import KeyValueEditor from '@/components/common/KeyValueEditor.vue'
import SyncApiBuilder from '@/components/convenience/SyncApiBuilder.vue'
import SearchCriteriaBuilder from '@/components/convenience/SearchCriteriaBuilder.vue'
import SaveRequestModal from '@/components/saved/SaveRequestModal.vue'
import SavedRequestsPanel from '@/components/saved/SavedRequestsPanel.vue'
import type { SavedRequest } from '@/types/saved-request'

const request = useRequestStore()
const connection = useConnectionStore()
const response = useResponseStore()
const history = useHistoryStore()
const shops = useShopsStore()
const openapi = useOpenApiStore()
const savedRequests = useSavedRequestsStore()

type EndpointGroup = 'all' | 'crud' | 'search' | 'aggregate' | 'sync' | 'action' | 'custom'

const endpointGroups: { value: EndpointGroup; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'crud', label: 'Entity CRUD' },
  { value: 'search', label: 'Search' },
  { value: 'aggregate', label: 'Aggregate' },
  { value: 'sync', label: 'Sync' },
  { value: 'action', label: 'Actions' },
  { value: 'custom', label: 'Custom Path' },
]

const activeGroup = ref<EndpointGroup>('all')
const requestTabs = ['Body', 'Headers', 'Params']
const activeTab = ref('Body')
const showSaveModal = ref(false)

async function send() {
  if (!connection.baseUrl || !request.path) return

  request.isLoading = true
  response.clear()

  const customHeaders: Record<string, string> = {}
  for (const h of request.customHeaders) {
    if (h.key) customHeaders[h.key] = h.value
  }

  // Build query params
  let path = request.path
  const params = request.queryParams.filter((p) => p.key)
  if (params.length > 0) {
    const qs = params
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&')
    path += (path.includes('?') ? '&' : '?') + qs
  }

  try {
    const result = await executeRequest({
      baseUrl: connection.baseUrl,
      path,
      method: request.method,
      headers: customHeaders,
      body: request.method !== 'GET' ? request.body || null : null,
      apiMode: connection.apiMode,
      token: connection.token,
      accessKey: connection.accessKey,
      contextToken: connection.contextToken,
    })

    response.setResponse(result.response, result.error)

    if (result.newContextToken) {
      connection.updateContextToken(result.newContextToken)
    }

    history.addEntry({
      id: crypto.randomUUID(),
      request: result.request,
      response: result.response,
      error: result.error,
    })
  } finally {
    request.isLoading = false
  }
}

function handleSaveRequest(name: string) {
  savedRequests.addRequest({
    name,
    path: request.path,
    method: request.method,
    body: request.body,
    customHeaders: request.customHeaders.filter((h) => h.key),
    queryParams: request.queryParams.filter((p) => p.key),
    originShopId: shops.activeShopId,
    originBaseUrl: connection.baseUrl,
    originVersion: connection.version,
  })
  showSaveModal.value = false
}

function handleLoadRequest(saved: SavedRequest) {
  request.path = saved.path
  request.method = saved.method
  request.body = saved.body
  request.customHeaders = saved.customHeaders.length
    ? [...saved.customHeaders]
    : []
  request.queryParams = saved.queryParams.length
    ? [...saved.queryParams]
    : []
}

function loadSchema(requiredOnly: boolean) {
  if (!request.path) return
  const template = openapi.getTemplateForEndpoint(request.path, request.method, { requiredOnly })
  if (template) request.body = template
}

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault()
    send()
  }
}
</script>

<template>
  <div class="flex flex-col h-full" @keydown="onKeydown">
    <!-- Endpoint group selector -->
    <div class="flex gap-0 border-b border-border">
      <button
        v-for="group in endpointGroups"
        :key="group.value"
        class="px-3 py-1.5 text-xs transition-colors border-b-2"
        :class="
          activeGroup === group.value
            ? 'text-text-primary border-accent bg-bg-panel'
            : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-hover'
        "
        @click="activeGroup = group.value"
      >
        {{ group.label }}
      </button>
    </div>

    <!-- Endpoint selector row -->
    <div class="flex items-center gap-2 p-3 border-b border-border">
      <MethodSelector v-model="request.method" />

      <!-- All: full endpoint autocomplete -->
      <EndpointSelector v-if="activeGroup === 'all'" />

      <!-- Entity CRUD: filtered to crud group -->
      <EndpointSelector v-else-if="activeGroup === 'crud'" group-filter="crud" />

      <!-- Search: entity picker -->
      <SearchCriteriaBuilder v-else-if="activeGroup === 'search'" />

      <!-- Aggregate: filtered to aggregate group -->
      <EndpointSelector v-else-if="activeGroup === 'aggregate'" group-filter="aggregate" />

      <!-- Sync: entity + action picker -->
      <SyncApiBuilder v-else-if="activeGroup === 'sync'" />

      <!-- Actions: filtered to action group -->
      <EndpointSelector v-else-if="activeGroup === 'action'" group-filter="action" />

      <!-- Custom Path: free-text input -->
      <input
        v-else-if="activeGroup === 'custom'"
        v-model="request.path"
        type="text"
        placeholder="/custom/path"
        class="flex-1 bg-bg-input text-text-primary text-xs px-3 py-1.5 rounded border border-border focus:border-accent focus:outline-none font-mono"
        @keydown.enter.meta="send"
        @keydown.enter.ctrl="send"
      />

      <SavedRequestsPanel @select="handleLoadRequest" />
      <div class="flex items-center gap-1">
        <SendButton :loading="request.isLoading" @send="send" />
        <button
          class="px-3 py-1.5 text-xs rounded border border-accent text-accent hover:bg-accent/10 transition-colors font-medium"
          title="Save current request"
          @click="showSaveModal = true"
        >
          Save
        </button>
      </div>
    </div>

    <!-- Request content tabs -->
    <TabBar :tabs="requestTabs" :active-tab="activeTab" @update:active-tab="activeTab = $event" />

    <div class="flex-1 overflow-auto">
      <div v-show="activeTab === 'Body'" class="h-full flex flex-col">
        <div v-if="request.path && ['POST', 'PUT', 'PATCH'].includes(request.method)" class="flex items-center gap-1.5 px-3 py-1.5 border-b border-border">
          <span class="text-[10px] text-text-muted">Load schema:</span>
          <button
            class="px-2 py-0.5 text-[10px] rounded border border-border text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
            @click="loadSchema(false)"
          >
            All fields
          </button>
          <button
            class="px-2 py-0.5 text-[10px] rounded border border-border text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
            @click="loadSchema(true)"
          >
            Required only
          </button>
        </div>
        <div class="flex-1 min-h-0">
          <JsonEditor v-model="request.body" placeholder="Request body (JSON)..." />
        </div>
      </div>
      <div v-show="activeTab === 'Headers'" class="p-3">
        <KeyValueEditor
          v-model="request.customHeaders"
          key-placeholder="Header name"
          value-placeholder="Header value"
        />
      </div>
      <div v-show="activeTab === 'Params'" class="p-3">
        <KeyValueEditor
          v-model="request.queryParams"
          key-placeholder="Parameter"
          value-placeholder="Value"
        />
      </div>
    </div>

    <!-- Save modal -->
    <SaveRequestModal
      :open="showSaveModal"
      @close="showSaveModal = false"
      @save="handleSaveRequest"
    />
  </div>
</template>
