<script setup lang="ts">
import { computed } from 'vue'
import { getStatusCategory } from '@/types/request'

const props = defineProps<{
  status: number
  statusText: string
}>()

const category = computed(() => {
  if (props.status === 0) return 'error'
  return getStatusCategory(props.status)
})

const colorClass = computed(() => {
  switch (category.value) {
    case '2xx': return 'bg-status-2xx/20 text-status-2xx'
    case '3xx': return 'bg-status-3xx/20 text-status-3xx'
    case '4xx': return 'bg-status-4xx/20 text-status-4xx'
    case '5xx': return 'bg-status-5xx/20 text-status-5xx'
    case 'error': return 'bg-error/20 text-error'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
    :class="colorClass"
  >
    {{ status === 0 ? 'ERR' : status }} {{ statusText }}
  </span>
</template>
