<script setup lang="ts">
import type { HttpMethod } from '@/types/shopware'

defineProps<{
  modelValue: HttpMethod
}>()

defineEmits<{
  'update:modelValue': [value: HttpMethod]
}>()

const methods: { value: HttpMethod; color: string }[] = [
  { value: 'GET', color: 'text-method-get' },
  { value: 'POST', color: 'text-method-post' },
  { value: 'PUT', color: 'text-method-put' },
  { value: 'PATCH', color: 'text-method-patch' },
  { value: 'DELETE', color: 'text-method-delete' },
]
</script>

<template>
  <div class="flex rounded overflow-hidden border border-border">
    <button
      v-for="m in methods"
      :key="m.value"
      class="px-2 py-1 text-xs font-semibold transition-colors"
      :class="[
        modelValue === m.value
          ? `${m.color} bg-bg-panel border-b-2 border-current`
          : 'text-text-muted bg-bg-secondary hover:text-text-secondary',
      ]"
      @click="$emit('update:modelValue', m.value)"
    >
      {{ m.value }}
    </button>
  </div>
</template>
