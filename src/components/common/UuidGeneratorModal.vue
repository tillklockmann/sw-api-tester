<script setup lang="ts">
import { ref, watch } from 'vue'
import md5 from 'md5'
import BaseModal from '@/components/common/BaseModal.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const inputString = ref('')
const generatedUuid = ref('')
const copied = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      inputString.value = ''
      generatedUuid.value = ''
      copied.value = false
    }
  },
)

function generateUuid() {
  if (inputString.value.trim()) {
    generatedUuid.value = md5(inputString.value)
  } else {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    generatedUuid.value = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  copyToClipboard()
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(generatedUuid.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // clipboard API might fail in non-secure contexts
  }
}

const inputClass =
  'w-full bg-bg-input text-text-primary text-xs px-3 py-1.5 rounded border border-border focus:border-accent focus:outline-none font-mono'
</script>

<template>
  <BaseModal :open="open" title="UUID Generator" @close="emit('close')">
    <form class="flex flex-col gap-3" @submit.prevent="generateUuid">
      <div>
        <label class="block text-[10px] text-text-secondary mb-1 uppercase tracking-wider"
          >Hash String <span class="normal-case text-text-muted">(leave empty for random)</span></label
        >
        <input
          v-model="inputString"
          type="text"
          placeholder="e.g. my-custom-entity-id"
          :class="inputClass"
        />
      </div>

      <div v-if="generatedUuid">
        <label class="block text-[10px] text-text-secondary mb-1 uppercase tracking-wider"
          >Generated UUID</label
        >
        <div class="flex items-center gap-2">
          <code
            class="flex-1 bg-bg-input text-accent text-xs px-3 py-1.5 rounded border border-border font-mono select-all"
          >
            {{ generatedUuid }}
          </code>
          <button
            type="button"
            class="px-2 py-1.5 text-xs rounded border border-border text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            @click="copyToClipboard"
          >
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </div>
    </form>

    <template #footer>
      <button
        class="px-4 py-1.5 text-xs rounded text-text-secondary hover:text-text-primary transition-colors"
        @click="emit('close')"
      >
        Close
      </button>
      <button
        class="px-4 py-1.5 text-xs rounded font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
        @click="generateUuid"
      >
        Generate
      </button>
    </template>
  </BaseModal>
</template>
