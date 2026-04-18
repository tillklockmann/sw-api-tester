<script setup lang="ts">
import { ref } from 'vue'
import { useHistoryStore } from '@/stores/history'
import { useRequestStore } from '@/stores/request'
import { useResponseStore } from '@/stores/response'
import HistoryEntry from './HistoryEntry.vue'
import type { HistoryEntry as HistoryEntryType } from '@/types/request'
import type { HttpMethod } from '@/types/shopware'

const history = useHistoryStore()
const request = useRequestStore()
const response = useResponseStore()

const activeId = ref<string | null>(null)

function selectEntry(entry: HistoryEntryType) {
  activeId.value = entry.id

  // Extract path from full URL
  try {
    const url = new URL(entry.request.url)
    request.path = url.pathname.replace(/^\/(api|store-api)/, '')
  } catch {
    request.path = entry.request.url
  }

  request.method = entry.request.method as HttpMethod
  request.body = entry.request.body ?? ''
  response.setResponse(entry.response, entry.error)
}
</script>

<template>
  <div class="flex flex-col h-full bg-bg-secondary border-r border-border">
    <div class="flex items-center justify-between px-3 py-2 border-b border-border">
      <span class="text-xs font-semibold text-text-secondary">History</span>
      <button
        v-if="history.entries.length > 0"
        class="text-[10px] text-text-muted hover:text-error"
        @click="history.clearHistory()"
      >
        Clear
      </button>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div v-if="history.entries.length === 0" class="p-3 text-text-muted text-xs">
        No requests yet.
      </div>
      <HistoryEntry
        v-for="entry in history.entries"
        :key="entry.id"
        :entry="entry"
        :active="entry.id === activeId"
        @select="selectEntry(entry)"
      />
    </div>
  </div>
</template>
