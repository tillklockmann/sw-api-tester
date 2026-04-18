<script setup lang="ts">
import { useShopsStore } from '@/stores/shops'

const shops = useShopsStore()

const emit = defineEmits<{
  'add-shop': []
  'edit-shop': []
}>()

function onSelect(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  shops.setActiveShop(value === '__manual__' ? null : value)
}
</script>

<template>
  <div class="flex items-center gap-1.5">
    <select
      class="bg-bg-input text-text-primary text-xs px-2 py-1.5 rounded border border-border focus:border-accent focus:outline-none font-mono min-w-[140px]"
      :value="shops.activeShopId ?? '__manual__'"
      @change="onSelect"
    >
      <option value="__manual__">Manual</option>
      <option v-for="shop in shops.shops" :key="shop.id" :value="shop.id">
        {{ shop.name }}
      </option>
    </select>

    <button
      class="px-2 py-1.5 text-[10px] rounded border border-border text-text-secondary hover:text-text-primary hover:border-accent transition-colors whitespace-nowrap"
      title="Add Shop"
      @click="emit('add-shop')"
    >
      + Add
    </button>

    <button
      v-if="shops.activeShop"
      class="px-1.5 py-1.5 text-[10px] rounded border border-border text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
      title="Edit Shop"
      @click="emit('edit-shop')"
    >
      &#9998;
    </button>
  </div>
</template>
