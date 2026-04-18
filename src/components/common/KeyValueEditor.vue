<script setup lang="ts">
const props = defineProps<{
  modelValue: Array<{ key: string; value: string }>
  keyPlaceholder?: string
  valuePlaceholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Array<{ key: string; value: string }>]
}>()

function updateItem(index: number, field: 'key' | 'value', val: string) {
  const items = [...props.modelValue]
  items[index] = { ...items[index], [field]: val }
  emit('update:modelValue', items)
}

function addItem() {
  emit('update:modelValue', [...props.modelValue, { key: '', value: '' }])
}

function removeItem(index: number) {
  const items = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', items)
}
</script>

<template>
  <div class="space-y-1">
    <div
      v-for="(item, index) in modelValue"
      :key="index"
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
