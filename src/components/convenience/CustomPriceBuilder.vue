<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useRequestStore } from '@/stores/request'
import { buildCustomPricePayload, defaultCustomPriceEntry } from '@/services/custom-price'

const request = useRequestStore()
const entry = reactive(defaultCustomPriceEntry())

function addPriceRow() {
  entry.prices.push({
    quantityStart: entry.prices.length + 1,
    quantityEnd: null,
    currencyId: '',
    gross: 0,
    net: 0,
    linked: false,
  })
}

function removePriceRow(index: number) {
  entry.prices.splice(index, 1)
}

function apply() {
  request.path = '/_action/custom-price'
  request.method = 'POST'
  request.body = buildCustomPricePayload(entry)
}

watch(entry, () => apply(), { deep: true })
</script>

<template>
  <div class="p-3 space-y-3 text-xs">
    <div class="text-text-secondary font-semibold">Custom Price Builder (SwagCommercial)</div>

    <div class="grid grid-cols-2 gap-2">
      <div>
        <label class="text-[10px] text-text-muted block mb-1">Product ID</label>
        <input
          v-model="entry.productId"
          type="text"
          placeholder="UUID"
          class="w-full bg-bg-input text-text-primary px-2 py-1 rounded border border-border focus:border-accent focus:outline-none font-mono"
        />
      </div>
      <div>
        <label class="text-[10px] text-text-muted block mb-1">Customer ID</label>
        <input
          v-model="entry.customerId"
          type="text"
          placeholder="UUID (optional)"
          class="w-full bg-bg-input text-text-primary px-2 py-1 rounded border border-border focus:border-accent focus:outline-none font-mono"
        />
      </div>
      <div>
        <label class="text-[10px] text-text-muted block mb-1">Customer Group ID</label>
        <input
          v-model="entry.customerGroupId"
          type="text"
          placeholder="UUID (optional)"
          class="w-full bg-bg-input text-text-primary px-2 py-1 rounded border border-border focus:border-accent focus:outline-none font-mono"
        />
      </div>
      <div>
        <label class="text-[10px] text-text-muted block mb-1">Rule ID</label>
        <input
          v-model="entry.ruleId"
          type="text"
          placeholder="UUID (optional)"
          class="w-full bg-bg-input text-text-primary px-2 py-1 rounded border border-border focus:border-accent focus:outline-none font-mono"
        />
      </div>
    </div>

    <!-- Price rows -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-text-muted text-[10px] font-semibold">Price Tiers</span>
        <button class="text-accent text-[10px] hover:text-accent-hover" @click="addPriceRow">
          + Add tier
        </button>
      </div>

      <div
        v-for="(row, index) in entry.prices"
        :key="index"
        class="flex gap-1.5 items-center bg-bg-panel p-2 rounded border border-border"
      >
        <div class="flex-1">
          <label class="text-[10px] text-text-muted">Qty Start</label>
          <input
            v-model.number="row.quantityStart"
            type="number"
            class="w-full bg-bg-input text-text-primary px-1.5 py-0.5 rounded border border-border focus:border-accent focus:outline-none font-mono"
          />
        </div>
        <div class="flex-1">
          <label class="text-[10px] text-text-muted">Qty End</label>
          <input
            :value="row.quantityEnd ?? ''"
            type="number"
            placeholder="null"
            class="w-full bg-bg-input text-text-primary px-1.5 py-0.5 rounded border border-border focus:border-accent focus:outline-none font-mono"
            @input="row.quantityEnd = ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null"
          />
        </div>
        <div class="flex-1">
          <label class="text-[10px] text-text-muted">Gross</label>
          <input
            v-model.number="row.gross"
            type="number"
            step="0.01"
            class="w-full bg-bg-input text-text-primary px-1.5 py-0.5 rounded border border-border focus:border-accent focus:outline-none font-mono"
          />
        </div>
        <div class="flex-1">
          <label class="text-[10px] text-text-muted">Net</label>
          <input
            v-model.number="row.net"
            type="number"
            step="0.01"
            class="w-full bg-bg-input text-text-primary px-1.5 py-0.5 rounded border border-border focus:border-accent focus:outline-none font-mono"
          />
        </div>
        <div class="w-12 text-center">
          <label class="text-[10px] text-text-muted">Linked</label>
          <input
            v-model="row.linked"
            type="checkbox"
            class="block mx-auto mt-1"
          />
        </div>
        <button
          v-if="entry.prices.length > 1"
          class="text-text-muted hover:text-error mt-3"
          @click="removePriceRow(index)"
        >
          x
        </button>
      </div>
    </div>

    <div class="text-[10px] text-text-muted">
      Endpoint: <span class="text-accent">POST /_action/custom-price</span>
    </div>
  </div>
</template>
