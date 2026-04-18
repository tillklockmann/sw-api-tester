<script setup lang="ts">
import { useConnectionStore } from '@/stores/connection'
import type { ApiMode, ShopwareVersion } from '@/types/shopware'

const connection = useConnectionStore()

const apiModes: { value: ApiMode; label: string }[] = [
  { value: 'admin', label: 'Admin API' },
  { value: 'store', label: 'Store API' },
]

const versions: ShopwareVersion[] = ['6.7', '6.6']

function setApiMode(mode: ApiMode) {
  if (mode !== connection.apiMode) {
    connection.disconnect()
    connection.apiMode = mode
    connection.saveToDisk()
  }
}

function setVersion(v: ShopwareVersion) {
  connection.version = v
  connection.saveToDisk()
}
</script>

<template>
  <header class="flex items-center justify-between px-4 py-2 bg-bg-secondary border-b border-border">
    <div class="flex items-center gap-4">
      <h1 class="text-sm font-semibold text-text-primary tracking-wide">SW API Tester</h1>

      <!-- API Mode Toggle -->
      <div class="flex rounded overflow-hidden border border-border">
        <button
          v-for="mode in apiModes"
          :key="mode.value"
          class="px-3 py-1 text-xs transition-colors"
          :class="
            connection.apiMode === mode.value
              ? 'bg-accent text-white'
              : 'bg-bg-panel text-text-secondary hover:text-text-primary hover:bg-bg-hover'
          "
          @click="setApiMode(mode.value)"
        >
          {{ mode.label }}
        </button>
      </div>

      <!-- Version Selector -->
      <div class="flex rounded overflow-hidden border border-border">
        <button
          v-for="v in versions"
          :key="v"
          class="px-2 py-1 text-xs transition-colors"
          :class="
            connection.version === v
              ? 'bg-accent text-white'
              : 'bg-bg-panel text-text-secondary hover:text-text-primary hover:bg-bg-hover'
          "
          @click="setVersion(v)"
        >
          v{{ v }}
        </button>
      </div>
    </div>
  </header>
</template>
