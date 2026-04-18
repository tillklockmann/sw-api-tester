<script setup lang="ts">
import { ref, watch } from 'vue'

interface KeyValueItem {
  key: string
  value: string
}

const props = defineProps<{
  modelValue: Array<KeyValueItem>
  keyPlaceholder?: string
  valuePlaceholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Array<KeyValueItem>]
}>()

let nextId = 0
const itemIds = ref<number[]>(props.modelValue.map(() => nextId++))

watch(() => props.modelValue.length, (newLen) => {
  while (itemIds.value.length < newLen) {
    itemIds.value.push(nextId++)
  }
  if (itemIds.value.length > newLen) {
    itemIds.value = itemIds.value.slice(0, newLen)
  }
})

function updateItem(index: number, field: 'key' | 'value', val: string) {
  const items = [...props.modelValue]
  items[index] = { ...items[index], [field]: val }
  emit('update:modelValue', items)
}

function addItem() {
  itemIds.value.push(nextId++)
  emit('update:modelValue', [...props.modelValue, { key: '', value: '' }])
}

function removeItem(index: number) {
  itemIds.value.splice(index, 1)
  const items = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', items)
}
</script>

<template>
  <div class="space-y-1">
    <div
      v-for="(item, index) in modelValue"
      :key="itemIds[index]"
      class="flex gap-1 items-center"
    >
      <input
        :value="item.key"
        :placeholder="keyPlaceholder ?? 'Key'"
        class="flex-1 bg-bg-input text-text-primary text-xs px-2 py-1 rounded border border-border focus:border-accent focus:outline-none"
        @input="updateItem(index, 'key', ($event.target as HTMLInputElement).value)"
      />
      <input
        :value="item.value"
        :placeholder="valuePlaceholder ?? 'Value'"
        class="flex-1 bg-bg-input text-text-primary text-xs px-2 py-1 rounded border border-border focus:border-accent focus:outline-none"
        @input="updateItem(index, 'value', ($event.target as HTMLInputElement).value)"
      />
      <button
        class="text-text-secondary hover:text-error text-xs px-1"
        @click="removeItem(index)"
      >
        x
      </button>
    </div>
    <button
      class="text-xs text-text-secondary hover:text-accent"
      @click="addItem"
    >
      + Add
    </button>
  </div>
</template>
