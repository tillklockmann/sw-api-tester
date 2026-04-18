<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useRequestStore } from '@/stores/request'
import { buildCustomPricePayload, defaultCustomPriceEntry } from '@/services/custom-price'
import type { CustomPriceAction, CustomPriceTier } from '@/services/custom-price'

const request = useRequestStore()
const entry = reactive(defaultCustomPriceEntry())

// Guard against infinite loop: apply sets body, body watcher parses back
let syncing = false

function addPriceTier() {
  entry.priceTiers.push({
    quantityStart: entry.priceTiers.length + 1,
    quantityEnd: null,
    currencyId: '',
    gross: 0,
    net: 0,
    linked: false,
  })
}

function removePriceTier(index: number) {
  entry.priceTiers.splice(index, 1)
}

function setAction(action: CustomPriceAction) {
  entry.action = action
}

function apply() {
  syncing = true
  request.path = '/_action/custom-price'
  request.method = 'POST'
  request.body = buildCustomPricePayload(entry)
  syncing = false
}

// Sync entry → body
watch(entry, () => apply(), { deep: true })

// Sync body → entry (when loading a saved request or history entry)
watch(
  () => request.body,
  (body) => {
    if (syncing) return
    if (request.path !== '/_action/custom-price') return
    if (!body) return

    try {
      const parsed = JSON.parse(body)
      if (!Array.isArray(parsed) || parsed.length === 0) return

      const op = parsed[0]
      if (!op.action || !Array.isArray(op.payload) || op.payload.length === 0) return

      const item = op.payload[0]

      syncing = true
      entry.action = op.action as CustomPriceAction
      entry.productId = item.productId ?? ''
      entry.customerId = item.customerId ?? ''
      entry.customerGroupId = item.customerGroupId ?? ''
      entry.ruleId = item.ruleId ?? ''

      if (Array.isArray(item.price)) {
        entry.priceTiers = item.price.map((tier: Record<string, unknown>): CustomPriceTier => {
          const innerPrice = Array.isArray(tier.price) && tier.price.length > 0 ? tier.price[0] : {}
          return {
            quantityStart: (tier.quantityStart as number) ?? 1,
            quantityEnd: (tier.quantityEnd as number) ?? null,
            currencyId: (innerPrice.currencyId as string) ?? '',
            gross: (innerPrice.gross as number) ?? 0,
            net: (innerPrice.net as number) ?? 0,
            linked: (innerPrice.linked as boolean) ?? false,
          }
        })
      }
      syncing = false
    } catch {
      // Body is not valid custom price JSON — ignore
    }
  },
)
</script>

<template>
  <div class="p-3 space-y-3 text-xs">
    <div class="text-text-secondary font-semibold">Custom Price Builder (SwagCommercial)</div>

    <!-- Action selector -->
    <div>
      <label class="text-[10px] text-text-muted block mb-1">Action</label>
      <div class="flex rounded overflow-hidden border border-border">
        <button
          v-for="a in (['upsert', 'delete'] as const)"
          :key="a"
          class="px-3 py-1.5 text-xs transition-colors"
          :class="
            entry.action === a
              ? 'bg-accent text-white'
              : 'bg-bg-panel text-text-secondary hover:text-text-primary hover:bg-bg-hover'
          "
          @click="setAction(a)"
        >
          {{ a }}
        </button>
      </div>
    </div>

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

    <!-- Price tiers -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-text-muted text-[10px] font-semibold">Price Tiers</span>
        <button class="text-accent text-[10px] hover:text-accent-hover" @click="addPriceTier">
          + Add tier
        </button>
      </div>

      <div
        v-for="(tier, index) in entry.priceTiers"
        :key="index"
        class="flex gap-1.5 items-center bg-bg-panel p-2 rounded border border-border"
      >
        <div class="flex-1">
          <label class="text-[10px] text-text-muted">Qty Start</label>
          <input
            v-model.number="tier.quantityStart"
            type="number"
            class="w-full bg-bg-input text-text-primary px-1.5 py-0.5 rounded border border-border focus:border-accent focus:outline-none font-mono"
          />
        </div>
        <div class="flex-1">
          <label class="text-[10px] text-text-muted">Qty End</label>
          <input
            :value="tier.quantityEnd ?? ''"
            type="number"
            placeholder="null"
            class="w-full bg-bg-input text-text-primary px-1.5 py-0.5 rounded border border-border focus:border-accent focus:outline-none font-mono"
            @input="tier.quantityEnd = ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null"
          />
        </div>
        <div class="flex-1">
          <label class="text-[10px] text-text-muted">Currency ID</label>
          <input
            v-model="tier.currencyId"
            type="text"
            placeholder="UUID"
            class="w-full bg-bg-input text-text-primary px-1.5 py-0.5 rounded border border-border focus:border-accent focus:outline-none font-mono"
          />
        </div>
        <div class="flex-1">
          <label class="text-[10px] text-text-muted">Gross</label>
          <input
            v-model.number="tier.gross"
            type="number"
            step="0.01"
            class="w-full bg-bg-input text-text-primary px-1.5 py-0.5 rounded border border-border focus:border-accent focus:outline-none font-mono"
          />
        </div>
        <div class="flex-1">
          <label class="text-[10px] text-text-muted">Net</label>
          <input
            v-model.number="tier.net"
            type="number"
            step="0.01"
            class="w-full bg-bg-input text-text-primary px-1.5 py-0.5 rounded border border-border focus:border-accent focus:outline-none font-mono"
          />
        </div>
        <div class="w-12 text-center">
          <label class="text-[10px] text-text-muted">Linked</label>
          <input
            v-model="tier.linked"
            type="checkbox"
            class="block mx-auto mt-1"
          />
        </div>
        <button
          v-if="entry.priceTiers.length > 1"
          class="text-text-muted hover:text-error mt-3"
          @click="removePriceTier(index)"
        >
          x
        </button>
      </div>
    </div>

    <div class="text-[10px] text-text-muted">
      Endpoint: <span class="text-accent">POST /_action/custom-price</span>
      &nbsp;|&nbsp; Action: <span class="text-text-primary">{{ entry.action }}</span>
    </div>
  </div>
</template>
