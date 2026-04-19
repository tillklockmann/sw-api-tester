<script setup lang="ts">
import { ref, watch } from 'vue'
import { useConnectionStore } from '@/stores/connection'
import { useShopsStore } from '@/stores/shops'
import ConnectionStatus from './ConnectionStatus.vue'
import ShopSelector from '@/components/shops/ShopSelector.vue'
import ShopFormModal from '@/components/shops/ShopFormModal.vue'
import type { ShopInstance } from '@/types/shop'

const connection = useConnectionStore()
const shops = useShopsStore()

const showShopForm = ref(false)
const editingShop = ref<ShopInstance | null>(null)

function openAddShop() {
  editingShop.value = null
  showShopForm.value = true
}

function openEditShop() {
  editingShop.value = shops.activeShop
  showShopForm.value = true
}

async function handleSaveShop(data: Omit<ShopInstance, 'id' | 'createdAt' | 'updatedAt'>) {
  if (editingShop.value) {
    await shops.updateShop(editingShop.value.id, data)
    if (shops.activeShopId === editingShop.value.id) {
      applyShopToConnection(shops.activeShop!)
    }
  } else {
    const newShop = await shops.addShop(data)
    shops.setActiveShop(newShop.id)
    applyShopToConnection(newShop)
  }
  showShopForm.value = false
}

async function handleDeleteShop() {
  if (shops.activeShop) {
    await shops.removeShop(shops.activeShop.id)
  }
  showShopForm.value = false
}

function applyShopToConnection(shop: ShopInstance) {
  connection.disconnect()
  connection.baseUrl = shop.baseUrl
  connection.version = shop.version
  connection.clientId = shop.clientId
  connection.clientSecret = shop.clientSecret
  connection.accessKey = shop.accessKey
  connection.saveToDisk()
}

// When the active shop changes via the selector, apply its config
watch(
  () => shops.activeShopId,
  (newId) => {
    if (newId) {
      const shop = shops.shops.find((s) => s.id === newId)
      if (shop) applyShopToConnection(shop)
    }
  },
)
</script>

<template>
  <div class="p-3 bg-bg-secondary border-b border-border">
    <div class="flex items-center gap-2 flex-wrap">
      <!-- Shop Selector -->
      <ShopSelector
        @add-shop="openAddShop"
        @edit-shop="openEditShop"
      />

      <template v-if="shops.activeShop">
        <div class="w-px h-5 bg-border" />

        <!-- Base URL (read-only display) -->
        <span class="text-xs text-text-secondary font-mono truncate max-w-[400px]" :title="connection.baseUrl">
          {{ connection.baseUrl }}
        </span>

        <!-- Connect/Disconnect button (Admin API) -->
        <template v-if="connection.apiMode === 'admin' && connection.clientId">
          <button
            class="px-4 py-1.5 text-xs rounded font-medium transition-colors"
            :class="
              connection.isConnected
                ? 'bg-error/20 text-error hover:bg-error/30'
                : 'bg-accent text-white hover:bg-accent-hover'
            "
            :disabled="connection.isConnecting"
            @click="connection.isConnected ? connection.disconnect() : connection.connect()"
          >
            {{
              connection.isConnecting
                ? 'Connecting...'
                : connection.isConnected
                  ? 'Disconnect'
                  : 'Connect'
            }}
          </button>
        </template>
      </template>

      <ConnectionStatus class="ml-auto" />
    </div>

    <!-- Modals -->
    <ShopFormModal
      :open="showShopForm"
      :shop="editingShop"
      @close="showShopForm = false"
      @save="handleSaveShop"
      @delete="handleDeleteShop"
    />
  </div>
</template>
