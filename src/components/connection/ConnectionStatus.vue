<script setup lang="ts">
import { useConnectionStore } from '@/stores/connection'
import { ref, onUnmounted } from 'vue'

const connection = useConnectionStore()
const displaySeconds = ref(0)

function updateCountdown() {
  if (connection.tokenExpiresAt) {
    displaySeconds.value = Math.max(0, Math.round((connection.tokenExpiresAt - Date.now()) / 1000))
  } else {
    displaySeconds.value = 0
  }
}

updateCountdown()
const interval = setInterval(updateCountdown, 1000)

onUnmounted(() => clearInterval(interval))

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="flex items-center gap-2 text-xs">
    <template v-if="connection.apiMode === 'admin'">
      <span
        class="w-2 h-2 rounded-full"
        :class="connection.isConnected ? 'bg-success' : 'bg-text-muted'"
      />
      <span v-if="connection.isConnected" class="text-text-secondary">
        Token expires in {{ formatTime(displaySeconds) }}
      </span>
      <span v-else-if="connection.isConnecting" class="text-text-secondary">
        Connecting...
      </span>
      <span v-else class="text-text-muted">
        Not connected
      </span>
    </template>
    <template v-else>
      <span
        class="w-2 h-2 rounded-full"
        :class="connection.accessKey ? 'bg-success' : 'bg-text-muted'"
      />
      <span class="text-text-secondary">
        {{ connection.accessKey ? 'Access key set' : 'No access key' }}
      </span>
      <span v-if="connection.contextToken" class="text-text-muted ml-2">
        ctx: {{ connection.contextToken.slice(0, 8) }}...
      </span>
    </template>

    <span v-if="connection.connectionError" class="text-error ml-2">
      {{ connection.connectionError }}
    </span>
  </div>
</template>
