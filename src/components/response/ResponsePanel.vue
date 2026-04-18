<script setup lang="ts">
import { ref } from 'vue'
import { useResponseStore } from '@/stores/response'
import StatusBadge from './StatusBadge.vue'
import JsonEditor from '@/components/common/JsonEditor.vue'
import TabBar from '@/components/common/TabBar.vue'

const response = useResponseStore()

const tabs = ['Body', 'Headers', 'Info']
const activeTab = ref('Body')

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function copyBody() {
  if (response.formattedBody) {
    navigator.clipboard.writeText(response.formattedBody)
  }
}
</script>

<template>
  <div class="flex flex-col h-full bg-bg-panel">
    <!-- Response header bar -->
    <div class="flex items-center justify-between px-3 py-2 border-b border-border">
      <div class="flex items-center gap-3">
        <span class="text-xs font-semibold text-text-secondary">Response</span>
        <template v-if="response.current">
          <StatusBadge
            :status="response.current.status"
            :status-text="response.current.statusText"
          />
          <span class="text-xs text-text-secondary">
            {{ response.current.duration }}ms
          </span>
          <span class="text-xs text-text-muted">
            {{ formatSize(response.current.size) }}
          </span>
        </template>
      </div>
      <button
        v-if="response.formattedBody"
        class="text-xs text-text-secondary hover:text-accent"
        @click="copyBody"
      >
        Copy
      </button>
    </div>

    <TabBar :tabs="tabs" :active-tab="activeTab" @update:active-tab="activeTab = $event" />

    <div class="flex-1 overflow-auto">
      <!-- Body -->
      <div v-show="activeTab === 'Body'" class="h-full">
        <template v-if="response.error && !response.current?.body">
          <div class="p-4 text-error text-xs">
            {{ response.error }}
          </div>
        </template>
        <template v-else-if="response.formattedBody">
          <JsonEditor
            :model-value="response.formattedBody"
            readonly
            placeholder="Response will appear here..."
          />
        </template>
        <template v-else>
          <div class="p-4 text-text-muted text-xs">
            Send a request to see the response.
          </div>
        </template>
      </div>

      <!-- Headers -->
      <div v-show="activeTab === 'Headers'" class="p-3">
        <template v-if="response.current">
          <table class="w-full text-xs">
            <tbody>
              <tr
                v-for="(value, key) in response.current.headers"
                :key="key"
                class="border-b border-border"
              >
                <td class="py-1 pr-4 text-text-secondary font-semibold whitespace-nowrap">
                  {{ key }}
                </td>
                <td class="py-1 text-text-primary break-all">
                  {{ value }}
                </td>
              </tr>
            </tbody>
          </table>
        </template>
        <div v-else class="text-text-muted text-xs">
          No response headers yet.
        </div>
      </div>

      <!-- Info -->
      <div v-show="activeTab === 'Info'" class="p-3 space-y-2 text-xs">
        <template v-if="response.current">
          <div class="flex gap-4">
            <div>
              <span class="text-text-secondary">Status: </span>
              <StatusBadge
                :status="response.current.status"
                :status-text="response.current.statusText"
              />
            </div>
            <div>
              <span class="text-text-secondary">Time: </span>
              <span class="text-text-primary font-semibold">{{ response.current.duration }}ms</span>
            </div>
            <div>
              <span class="text-text-secondary">Size: </span>
              <span class="text-text-primary">{{ formatSize(response.current.size) }}</span>
            </div>
          </div>
          <div v-if="response.error" class="text-error">
            Error: {{ response.error }}
          </div>
        </template>
        <div v-else class="text-text-muted">
          No response info yet.
        </div>
      </div>
    </div>
  </div>
</template>
