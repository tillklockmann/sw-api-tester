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
  <div class="flex-1 relative">
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
      class="absolute z-50 mt-1 max-h-[300px] w-full overflow-auto border border-border rounded bg-bg-secondary shadow-lg"
    >
      <button
        v-for="name in filteredEntities"
        :key="name"
        class="w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-bg-hover text-text-secondary hover:text-text-primary"
        @click="entity = name; entityFilter = name"
      >
        {{ name }}
      </button>
    </div>
  </div>
</template>
