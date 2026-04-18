<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { useRequestStore } from '@/stores/request'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [name: string]
}>()

const request = useRequestStore()
const name = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) name.value = ''
  },
)

function handleSave() {
  if (!name.value.trim()) return
  emit('save', name.value.trim())
}

const methodColors: Record<string, string> = {
  GET: 'text-method-get',
  POST: 'text-method-post',
  PUT: 'text-method-put',
  PATCH: 'text-method-patch',
  DELETE: 'text-method-delete',
}
</script>

<template>
  <BaseModal :open="open" title="Save Request" @close="emit('close')">
    <form class="flex flex-col gap-3" @submit.prevent="handleSave">
      <div>
        <label class="block text-[10px] text-text-secondary mb-1 uppercase tracking-wider"
          >Name *</label
        >
        <input
          v-model="name"
          type="text"
          placeholder="e.g. Get all products"
          class="w-full bg-bg-input text-text-primary text-xs px-3 py-1.5 rounded border border-border focus:border-accent focus:outline-none font-mono"
        />
      </div>

      <div class="bg-bg-primary rounded p-2 text-xs">
        <div class="flex items-center gap-2 mb-1">
          <span class="font-semibold text-[10px]" :class="methodColors[request.method]">{{
            request.method
          }}</span>
          <span class="text-text-primary font-mono">{{ request.path || '(no path)' }}</span>
        </div>
        <div v-if="request.body" class="text-text-muted text-[10px] truncate mt-1">
          {{ request.body.slice(0, 120) }}{{ request.body.length > 120 ? '...' : '' }}
        </div>
        <div class="text-text-muted text-[10px] mt-1">
          {{ request.customHeaders.filter((h) => h.key).length }} headers,
          {{ request.queryParams.filter((p) => p.key).length }} params
        </div>
      </div>
    </form>

    <template #footer>
      <button
        class="px-4 py-1.5 text-xs rounded text-text-secondary hover:text-text-primary transition-colors"
        @click="emit('close')"
      >
        Cancel
      </button>
      <button
        class="px-4 py-1.5 text-xs rounded font-medium bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!name.trim()"
        @click="handleSave"
      >
        Save
      </button>
    </template>
  </BaseModal>
</template>
