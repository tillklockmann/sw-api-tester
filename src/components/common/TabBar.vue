<script setup lang="ts">
defineProps<{
  tabs: string[]
  activeTab: string
}>()

defineEmits<{
  'update:activeTab': [value: string]
}>()
</script>

<template>
  <div class="flex gap-0 border-b border-border">
    <button
      v-for="tab in tabs"
      :key="tab"
      class="px-3 py-1.5 text-xs transition-colors border-b-2"
      :class="
        activeTab === tab
          ? 'text-text-primary border-accent bg-bg-panel'
          : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-hover'
      "
      @click="$emit('update:activeTab', tab)"
    >
      {{ tab }}
    </button>
  </div>
</template>
