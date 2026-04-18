<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import type { ShopInstance } from '@/types/shop'
import type { ShopwareVersion } from '@/types/shopware'

const props = defineProps<{
  open: boolean
  shop: ShopInstance | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: Omit<ShopInstance, 'id' | 'createdAt' | 'updatedAt'>]
  delete: []
}>()

const name = ref('')
const baseUrl = ref('')
const version = ref<ShopwareVersion>('6.7')
const clientId = ref('')
const clientSecret = ref('')
const accessKey = ref('')
const confirmDelete = ref(false)

const versions: ShopwareVersion[] = ['6.7', '6.6']

watch(
  () => props.open,
  (isOpen) => {
    confirmDelete.value = false
    if (isOpen && props.shop) {
      name.value = props.shop.name
      baseUrl.value = props.shop.baseUrl
      version.value = props.shop.version
      clientId.value = props.shop.clientId
      clientSecret.value = props.shop.clientSecret
      accessKey.value = props.shop.accessKey
    } else if (isOpen) {
      name.value = ''
      baseUrl.value = ''
      version.value = '6.7'
      clientId.value = ''
      clientSecret.value = ''
      accessKey.value = ''
    }
  },
)

function handleSave() {
  if (!name.value.trim() || !baseUrl.value.trim()) return

  emit('save', {
    name: name.value.trim(),
    baseUrl: baseUrl.value.trim().replace(/\/+$/, ''),
    version: version.value,
    clientId: clientId.value.trim(),
    clientSecret: clientSecret.value.trim(),
    accessKey: accessKey.value.trim(),
  })
}

function handleDelete() {
  if (!confirmDelete.value) {
    confirmDelete.value = true
    return
  }
  emit('delete')
}

const inputClass =
  'w-full bg-bg-input text-text-primary text-xs px-3 py-1.5 rounded border border-border focus:border-accent focus:outline-none font-mono'
</script>

<template>
  <BaseModal :open="open" :title="shop ? 'Edit Shop' : 'Add Shop'" @close="emit('close')">
    <form class="flex flex-col gap-3" @submit.prevent="handleSave">
      <div>
        <label class="block text-[10px] text-text-secondary mb-1 uppercase tracking-wider"
          >Name *</label
        >
        <input v-model="name" type="text" placeholder="e.g. Production Shop" :class="inputClass" />
      </div>

      <div>
        <label class="block text-[10px] text-text-secondary mb-1 uppercase tracking-wider"
          >Base URL *</label
        >
        <input
          v-model="baseUrl"
          type="text"
          placeholder="https://your-shop.example.com"
          :class="inputClass"
        />
      </div>

      <div>
        <label class="block text-[10px] text-text-secondary mb-1 uppercase tracking-wider"
          >Shopware Version</label
        >
        <div class="flex rounded overflow-hidden border border-border w-fit">
          <button
            v-for="v in versions"
            :key="v"
            type="button"
            class="px-3 py-1 text-xs transition-colors"
            :class="
              version === v
                ? 'bg-accent text-white'
                : 'bg-bg-panel text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            "
            @click="version = v"
          >
            v{{ v }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-[10px] text-text-secondary mb-1 uppercase tracking-wider"
          >Client ID</label
        >
        <input
          v-model="clientId"
          type="text"
          placeholder="Admin API Client ID"
          :class="inputClass"
        />
      </div>

      <div>
        <label class="block text-[10px] text-text-secondary mb-1 uppercase tracking-wider"
          >Client Secret</label
        >
        <input
          v-model="clientSecret"
          type="password"
          placeholder="Admin API Client Secret"
          :class="inputClass"
        />
      </div>

      <div>
        <label class="block text-[10px] text-text-secondary mb-1 uppercase tracking-wider"
          >Access Key <span class="normal-case text-text-muted">(Store API, optional)</span></label
        >
        <input
          v-model="accessKey"
          type="text"
          placeholder="sw-access-key"
          :class="inputClass"
        />
      </div>
    </form>

    <template #footer>
      <!-- Delete button (only in edit mode) -->
      <button
        v-if="shop"
        class="px-4 py-1.5 text-xs rounded font-medium transition-colors mr-auto"
        :class="
          confirmDelete
            ? 'bg-error text-white hover:bg-error/80'
            : 'bg-error/20 text-error hover:bg-error/30'
        "
        @click="handleDelete"
      >
        {{ confirmDelete ? 'Confirm Delete' : 'Delete Shop' }}
      </button>

      <button
        class="px-4 py-1.5 text-xs rounded text-text-secondary hover:text-text-primary transition-colors"
        @click="emit('close')"
      >
        Cancel
      </button>
      <button
        class="px-4 py-1.5 text-xs rounded font-medium bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!name.trim() || !baseUrl.trim()"
        @click="handleSave"
      >
        {{ shop ? 'Update' : 'Add Shop' }}
      </button>
    </template>
  </BaseModal>
</template>
