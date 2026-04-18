<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/vue'
import { useOpenApiStore } from '@/stores/openapi'
import { useRequestStore } from '@/stores/request'
import { classifyPath } from '@/services/openapi-parser'

const openapi = useOpenApiStore()
const request = useRequestStore()

const query = ref('')

interface PathOption {
  path: string
  group: string
}

const groupLabels: Record<string, string> = {
  action: 'Actions',
  search: 'Search',
  aggregate: 'Aggregate',
  crud: 'Entities',
  other: 'Other',
}

const groupOrder = ['crud', 'search', 'aggregate', 'action', 'other']

const filteredOptions = computed(() => {
  const q = query.value.toLowerCase()
  // Use full spec endpoints if loaded, otherwise summary paths
  let paths: PathOption[]

  if (openapi.endpoints.length > 0) {
    paths = openapi.endpoints.map((e) => ({ path: e.path, group: e.group }))
  } else {
    paths = openapi.summaryPaths.map((p) => ({ path: p, group: classifyPath(p) }))
  }

  if (q) {
    paths = paths.filter((p) => p.path.toLowerCase().includes(q))
  }

  // Group and limit
  const grouped = new Map<string, PathOption[]>()
  for (const p of paths) {
    if (!grouped.has(p.group)) grouped.set(p.group, [])
    grouped.get(p.group)!.push(p)
  }

  // Flatten with group headers, respecting order
  const result: Array<{ type: 'header'; label: string } | { type: 'option'; path: string }> = []
  for (const group of groupOrder) {
    const items = grouped.get(group)
    if (!items || items.length === 0) continue
    result.push({ type: 'header', label: groupLabels[group] ?? group })
    for (const item of items.slice(0, q ? 50 : 20)) {
      result.push({ type: 'option', path: item.path })
    }
  }

  return result
})

const selectedPath = ref('')

watch(selectedPath, (path) => {
  if (!path) return
  request.path = path

  // Update available methods and set default
  const methods = openapi.getMethodsFor(path)
  if (methods.length > 0 && !methods.includes(request.method)) {
    request.method = methods[0]
  }

  // Generate template body for POST/PUT/PATCH if body is empty
  if (['POST', 'PUT', 'PATCH'].includes(request.method) && !request.body?.trim()) {
    const template = openapi.getTemplateForEndpoint(path, request.method)
    if (template) {
      request.body = template
    }
  }
})

// When method changes, update template only if body is empty
watch(() => request.method, (method) => {
  if (!request.path || !['POST', 'PUT', 'PATCH'].includes(method)) return
  if (request.body?.trim()) return
  const template = openapi.getTemplateForEndpoint(request.path, method)
  if (template) {
    request.body = template
  }
})

function onInputChange(event: Event) {
  query.value = (event.target as HTMLInputElement).value
}
</script>

<template>
  <Combobox v-model="selectedPath" nullable>
    <div class="relative flex-1">
      <div class="relative">
        <ComboboxInput
          class="w-full bg-bg-input text-text-primary text-xs px-3 py-1.5 rounded border border-border focus:border-accent focus:outline-none font-mono pr-8"
          :display-value="(val: any) => val || ''"
          placeholder="Search endpoints... (e.g., /product, /search/order)"
          @change="onInputChange"
        />
        <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
          <span class="text-text-muted text-xs">▼</span>
        </ComboboxButton>
      </div>

      <ComboboxOptions
        class="absolute z-50 mt-1 max-h-[400px] w-full overflow-auto rounded border border-border bg-bg-secondary shadow-lg"
      >
        <div v-if="openapi.isLoadingSpec" class="p-3 text-xs text-text-muted">
          Loading API spec...
        </div>

        <template v-for="(item, index) in filteredOptions" :key="index">
          <!-- Group header -->
          <div
            v-if="item.type === 'header'"
            class="px-3 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider bg-bg-primary sticky top-0"
          >
            {{ item.label }}
          </div>

          <!-- Path option -->
          <ComboboxOption
            v-else
            v-slot="{ active, selected }"
            :value="item.path"
            as="template"
          >
            <li
              class="px-3 py-1.5 text-xs font-mono cursor-pointer flex items-center justify-between"
              :class="{
                'bg-accent/20 text-text-primary': active,
                'text-text-primary': selected && !active,
                'text-text-secondary': !active && !selected,
              }"
            >
              <span>{{ item.path }}</span>
              <span v-if="selected" class="text-accent text-[10px]">●</span>
            </li>
          </ComboboxOption>
        </template>

        <div
          v-if="filteredOptions.length === 0 && !openapi.isLoadingSpec"
          class="p-3 text-xs text-text-muted"
        >
          No endpoints found.
        </div>
      </ComboboxOptions>
    </div>
  </Combobox>
</template>
