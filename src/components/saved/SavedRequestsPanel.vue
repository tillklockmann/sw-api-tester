<script setup lang="ts">
import { ref } from 'vue'
import { useSavedRequestsStore } from '@/stores/saved-requests'
import { useShopsStore } from '@/stores/shops'
import type { SavedRequest } from '@/types/saved-request'

const savedRequests = useSavedRequestsStore()
const shops = useShopsStore()

const showPanel = ref(false)

const emit = defineEmits<{
  select: [request: SavedRequest]
}>()

const methodColors: Record<string, string> = {
  GET: 'bg-method-get/20 text-method-get',
  POST: 'bg-method-post/20 text-method-post',
  PUT: 'bg-method-put/20 text-method-put',
  PATCH: 'bg-method-patch/20 text-method-patch',
  DELETE: 'bg-method-delete/20 text-method-delete',
}

function selectRequest(req: SavedRequest) {
  emit('select', req)
  showPanel.value = false
}

function getOriginLabel(req: SavedRequest): string {
  if (!req.originShopId) return req.originBaseUrl || 'manual'
  const shop = shops.shops.find((s) => s.id === req.originShopId)
  if (shop) return `${shop.name} v${req.originVersion}`
  return `${req.originBaseUrl} v${req.originVersion} (deleted)`
}

function handleClickOutside() {
  showPanel.value = false
}
</script>

<template>
  <div class="relative">
    <button
      class="px-2 py-1.5 text-xs rounded border transition-colors whitespace-nowrap"
      :class="
        showPanel
          ? 'border-accent text-accent bg-accent/10'
          : 'border-border text-text-secondary hover:text-text-primary hover:border-accent'
      "
      @click="showPanel = !showPanel"
    >
      Saved
      <span
        v-if="savedRequests.requests.length"
        class="ml-1 text-[10px] bg-accent/20 text-accent px-1 rounded"
      >
        {{ savedRequests.requests.length }}
      </span>
    </button>

    <Teleport to="body">
      <div
        v-if="showPanel"
        class="fixed inset-0 z-40"
        @click="handleClickOutside"
      />
    </Teleport>

    <div
      v-if="showPanel"
      class="absolute z-50 mt-1 right-0 w-[380px] max-h-[400px] overflow-auto rounded border border-border bg-bg-secondary shadow-lg"
    >
      <div
        v-if="savedRequests.requests.length === 0"
        class="p-4 text-xs text-text-muted text-center"
      >
        No saved requests yet.
      </div>

      <template v-else>
        <template v-for="[path, items] in savedRequests.groupedByPath" :key="path">
          <div
            class="px-3 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider bg-bg-primary sticky top-0"
          >
            {{ path }}
          </div>

          <div
            v-for="req in items"
            :key="req.id"
            class="group flex items-center gap-2 px-3 py-1.5 hover:bg-accent/10 cursor-pointer"
            @click="selectRequest(req)"
          >
            <span
              class="text-[10px] font-semibold px-1 rounded shrink-0"
              :class="methodColors[req.method]"
            >
              {{ req.method }}
            </span>
            <div class="flex-1 min-w-0">
              <div class="text-xs text-text-primary truncate">{{ req.name }}</div>
              <div class="text-[10px] text-text-muted truncate">{{ getOriginLabel(req) }}</div>
            </div>
            <button
              class="text-text-muted hover:text-error text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              title="Delete"
              @click.stop="savedRequests.removeRequest(req.id)"
            >
              &#10005;
            </button>
          </div>
        </template>

        <div class="border-t border-border px-3 py-2 flex justify-end">
          <button
            class="text-[10px] text-text-muted hover:text-error transition-colors"
            @click="savedRequests.clearAll()"
          >
            Clear All
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
