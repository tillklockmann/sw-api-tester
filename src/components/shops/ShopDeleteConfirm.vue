<script setup lang="ts">
import BaseModal from '@/components/common/BaseModal.vue'

defineProps<{
  open: boolean
  shopName: string
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <BaseModal :open="open" title="Delete Shop" @close="emit('close')">
    <p class="text-xs text-text-secondary">
      Delete <span class="text-text-primary font-medium">{{ shopName }}</span>? Saved requests that
      reference this shop will keep their origin metadata.
    </p>

    <template #footer>
      <button
        class="px-4 py-1.5 text-xs rounded text-text-secondary hover:text-text-primary transition-colors"
        @click="emit('close')"
      >
        Cancel
      </button>
      <button
        class="px-4 py-1.5 text-xs rounded font-medium bg-error/20 text-error hover:bg-error/30 transition-colors"
        @click="emit('confirm')"
      >
        Delete
      </button>
    </template>
  </BaseModal>
</template>
