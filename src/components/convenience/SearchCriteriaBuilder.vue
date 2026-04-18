<script setup lang="ts">
import { ref, watch } from 'vue'
import { useOpenApiStore } from '@/stores/openapi'
import { useRequestStore } from '@/stores/request'

const openapi = useOpenApiStore()
const request = useRequestStore()

const entity = ref('')
const entityFilter = ref('')
const filteredEntities = ref<string[]>([])

watch(
  [() => openapi.entityNames, entityFilter],
  () => {
    const q = entityFilter.value.toLowerCase()
    filteredEntities.value = openapi.entityNames
      .filter((name) => name.toLowerCase().includes(q))
      .slice(0, 30)
  },
  { immediate: true },
)

const defaultCriteria = {
  limit: 25,
  page: 1,
  filter: [
    { type: 'equals', field: '', value: '' },
  ],
  sort: [
    { field: '', order: 'ASC' },
  ],
  associations: {},
  includes: {},
}

function apply() {
  if (!entity.value) return
  const snakeName = entity.value
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/_+/g, '_')
  request.path = `/search/${snakeName}`
  request.method = 'POST'
  request.body = JSON.stringify(defaultCriteria, null, 2)
}

watch(entity, () => {
  if (entity.value) apply()
})
</script>

<template>
  <div class="p-3 space-y-3">
    <div class="text-xs text-text-secondary font-semibold">Search Criteria Builder</div>

    <div>
      <label class="text-[10px] text-text-muted block mb-1">Entity to search</label>
      <input
        v-model="entityFilter"
        type="text"
        placeholder="Search entity..."
        class="w-full bg-bg-input text-text-primary text-xs px-3 py-1.5 rounded border border-border focus:border-accent focus:outline-none font-mono"
      />
      <div
        v-if="entityFilter && filteredEntities.length > 0 && !entity"
        class="mt-1 max-h-[200px] overflow-auto border border-border rounded bg-bg-secondary"
      >
        <button
          v-for="name in filteredEntities"
          :key="name"
          class="w-full text-left px-3 py-1 text-xs font-mono hover:bg-bg-hover text-text-secondary hover:text-text-primary"
          @click="entity = name; entityFilter = name"
        >
          {{ name }}
        </button>
      </div>
    </div>

    <div v-if="entity" class="text-[10px] text-text-muted">
      Endpoint: <span class="text-accent">POST /search/{{ entity.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '').replace(/_+/g, '_') }}</span>
    </div>

    <div class="text-[10px] text-text-muted leading-relaxed">
      Available filter types: <span class="text-text-secondary">equals, equalsAny, contains, range, not, multi, prefix, suffix</span>
    </div>
  </div>
</template>
