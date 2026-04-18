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
      <h1 class="text-sm font-semibold tracking-wide flex items-center gap-2">
        <svg class="w-5 h-5 shrink-0" viewBox="25 25 115 115" xmlns="http://www.w3.org/2000/svg">
          <path fill="#189EFF" d="M115.28,125.52c-4.78-3.6-11.83-6.34-19.29-9.23c-8.88-3.44-18.95-7.35-26.51-13.36c-8.56-6.82-12.73-15.42-12.73-26.29c0-9.76,4.05-18.1,11.71-24.13c8.59-6.76,21.61-10.34,37.64-10.34c4.43,0,8.66,0.27,12.58,0.81c0.35,0.05,0.68-0.14,0.82-0.45c0.15-0.32,0.07-0.69-0.19-0.92c-10.1-9.09-23.16-14.09-36.76-14.09c-14.7,0-28.52,5.72-38.92,16.12C33.24,54.03,27.51,67.85,27.51,82.54c0,14.7,5.72,28.52,16.12,38.91c10.39,10.39,24.21,16.12,38.92,16.12c11.88,0,23.19-3.73,32.72-10.78c0.2-0.15,0.32-0.38,0.32-0.63C115.59,125.91,115.48,125.67,115.28,125.52z"/>
          <path fill="#189EFF" d="M137.34,77.46c-0.02-0.21-0.12-0.41-0.28-0.54C125.58,67.39,116.29,63.5,105,63.5c-6.02,0-10.64,1.21-13.72,3.59c-2.67,2.06-4.08,4.94-4.08,8.31c0,9.45,11.55,13.76,24.93,18.75c6.89,2.57,14.02,5.23,20.56,8.86c0.12,0.07,0.25,0.1,0.38,0.1c0.09,0,0.18-0.02,0.27-0.05c0.21-0.08,0.39-0.24,0.47-0.46c2.5-6.4,3.77-13.15,3.77-20.06C137.57,80.92,137.5,79.21,137.34,77.46z"/>
        </svg>
        <span class="text-[#189EFF]">SW</span>
        <span class="text-text-primary">API Tester</span>
      </h1>

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
