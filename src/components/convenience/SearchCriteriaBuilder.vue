<script setup lang="ts">
import { ref, watch } from 'vue'
import { useOpenApiStore } from '@/stores/openapi'
import { useRequestStore } from '@/stores/request'
import { toSnakeCase } from '@/utils/string'

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

function getDefaultCriteria() {
  return {
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
}

function apply() {
  if (!entity.value) return
  request.path = `/search/${toSnakeCase(entity.value)}`
  request.method = 'POST'
  request.body = JSON.stringify(getDefaultCriteria(), null, 2)
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
      <div class="relative">
        <input
          v-model="entityFilter"
          type="text"
          placeholder="Search entity..."
          class="w-full bg-bg-input text-text-primary text-xs px-3 py-1.5 rounded border border-border focus:border-accent focus:outline-none font-mono pr-7"
          @focus="if (entity) { entity = ''; entityFilter = '' }"
        />
        <button
          v-if="entity"
          class="absolute right-1.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs"
          @click="entity = ''; entityFilter = ''"
        >
          x
        </button>
      </div>
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
      Endpoint: <span class="text-accent">POST /search/{{ toSnakeCase(entity) }}</span>
    </div>

    <div class="text-[10px] text-text-muted leading-relaxed">
      Available filter types: <span class="text-text-secondary">equals, equalsAny, contains, range, not, multi, prefix, suffix</span>
    </div>
  </div>
</template>
