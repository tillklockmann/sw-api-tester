<script setup lang="ts">
import { Codemirror } from 'vue-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'

defineProps<{
  modelValue: string
  readonly?: boolean
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const baseTheme = EditorView.theme({
  '&': {
    backgroundColor: '#2d2d2d',
    height: '100%',
  },
  '.cm-gutters': {
    backgroundColor: '#2d2d2d',
    borderRight: '1px solid #3e3e3e',
  },
})

const extensions = [json(), oneDark, baseTheme]
</script>

<template>
  <div class="h-full w-full overflow-hidden rounded border border-border">
    <Codemirror
      :model-value="modelValue"
      :extensions="extensions"
      :disabled="readonly"
      :placeholder="placeholder ?? 'Enter JSON...'"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>
