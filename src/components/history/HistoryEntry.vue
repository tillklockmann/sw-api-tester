<script setup lang="ts">
import type { HistoryEntry } from '@/types/request'

defineProps<{
  entry: HistoryEntry
  active?: boolean
}>()

defineEmits<{
  select: []
}>()

function methodColor(method: string): string {
  switch (method) {
    case 'GET': return 'text-method-get'
    case 'POST': return 'text-method-post'
    case 'PUT': return 'text-method-put'
    case 'PATCH': return 'text-method-patch'
    case 'DELETE': return 'text-method-delete'
    default: return 'text-text-secondary'
  }
}

function statusColor(status: number): string {
  if (status === 0) return 'text-error'
  if (status >= 200 && status < 300) return 'text-status-2xx'
  if (status >= 300 && status < 400) return 'text-status-3xx'
  if (status >= 400 && status < 500) return 'text-status-4xx'
  return 'text-status-5xx'
}

function extractPath(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}
</script>

<template>
  <button
    class="w-full text-left px-2 py-1.5 text-xs hover:bg-bg-hover transition-colors border-l-2"
    :class="active ? 'border-accent bg-bg-hover' : 'border-transparent'"
    @click="$emit('select')"
  >
    <div class="flex items-center gap-1.5">
      <span :class="methodColor(entry.request.method)" class="font-semibold text-[10px] w-10 shrink-0">
        {{ entry.request.method }}
      </span>
      <span class="truncate text-text-primary">
        {{ extractPath(entry.request.url) }}
      </span>
    </div>
    <div class="flex items-center gap-2 mt-0.5">
      <span
        v-if="entry.response"
        :class="statusColor(entry.response.status)"
        class="text-[10px] font-semibold"
      >
        {{ entry.response.status || 'ERR' }}
      </span>
      <span v-if="entry.response" class="text-text-muted text-[10px]">
        {{ entry.response.duration }}ms
      </span>
    </div>
  </button>
</template>
