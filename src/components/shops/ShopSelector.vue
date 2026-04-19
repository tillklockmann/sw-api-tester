<script setup lang="ts">
import { useShopsStore } from '@/stores/shops'

const shops = useShopsStore()

const emit = defineEmits<{
  'add-shop': []
  'edit-shop': []
}>()

function onSelect(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  if (value) shops.setActiveShop(value)
}
</script>

<template>
  <div class="flex items-center gap-1.5">
    <!-- No shops: show prominent add button -->
    <template v-if="shops.shops.length === 0">
      <button
        class="px-4 py-1.5 text-xs rounded font-medium bg-accent text-white hover:bg-accent-hover transition-colors whitespace-nowrap"
        @click="emit('add-shop')"
      >
        + Add shop config
      </button>
    </template>

    <!-- Has shops: show select + add/edit buttons -->
    <template v-else>
      <select
        aria-label="Select shop"
        class="bg-bg-input text-text-primary text-xs px-2 py-1.5 rounded border border-border focus:border-accent focus:outline-none font-mono min-w-[140px]"
        :value="shops.activeShopId ?? ''"
        @change="onSelect"
      >
        <option v-if="!shops.activeShopId" value="" disabled>Select shop...</option>
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
    </template>
  </div>
</template>
