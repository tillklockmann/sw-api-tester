<script setup lang="ts">
defineProps<{
  loading: boolean
  disabled?: boolean
}>()

defineEmits<{
  send: []
}>()
</script>

<template>
  <button
    class="px-6 py-1.5 text-xs font-semibold rounded transition-colors"
    :class="
      loading || disabled
        ? 'bg-accent/40 text-white/50 cursor-not-allowed'
        : 'bg-accent text-white hover:bg-accent-hover'
    "
    :disabled="loading || disabled"
    @click="$emit('send')"
  >
    {{ loading ? 'Sending...' : 'Send' }}
  </button>
</template>
