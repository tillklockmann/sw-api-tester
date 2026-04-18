<script setup lang="ts">
import { ref, watch } from 'vue'
import { useConnectionStore } from '@/stores/connection'
import { useShopsStore } from '@/stores/shops'
import ConnectionStatus from './ConnectionStatus.vue'
import ShopSelector from '@/components/shops/ShopSelector.vue'
import ShopFormModal from '@/components/shops/ShopFormModal.vue'
import ShopDeleteConfirm from '@/components/shops/ShopDeleteConfirm.vue'
import type { ShopInstance } from '@/types/shop'

const connection = useConnectionStore()
const shops = useShopsStore()

const showShopForm = ref(false)
const editingShop = ref<ShopInstance | null>(null)
const showDeleteConfirm = ref(false)

function openAddShop() {
  editingShop.value = null
  showShopForm.value = true
}

function openEditShop() {
  editingShop.value = shops.activeShop
  showShopForm.value = true
}

function openDeleteShop() {
  showDeleteConfirm.value = true
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
  showDeleteConfirm.value = false
}

function applyShopToConnection(shop: ShopInstance) {
  connection.disconnect()
  connection.baseUrl = shop.baseUrl
  connection.version = shop.version
  connection.clientId = shop.clientId
  connection.clientSecret = shop.clientSecret
  connection.accessKey = shop.accessKey
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
  <div class="flex flex-col gap-2 p-3 bg-bg-secondary border-b border-border">
    <div class="flex items-center gap-2 flex-wrap">
      <!-- Shop Selector -->
      <ShopSelector
        @add-shop="openAddShop"
        @edit-shop="openEditShop"
        @delete-shop="openDeleteShop"
      />

      <div class="w-px h-5 bg-border" />

      <!-- Base URL -->
      <input
        v-model="connection.baseUrl"
        type="text"
        placeholder="https://your-shop.example.com"
        class="flex-1 min-w-[250px] bg-bg-input text-text-primary text-xs px-3 py-1.5 rounded border border-border focus:border-accent focus:outline-none font-mono"
      />

      <!-- Admin API auth fields -->
      <template v-if="connection.apiMode === 'admin'">
        <input
          v-model="connection.clientId"
          type="text"
          placeholder="Client ID"
          class="w-[180px] bg-bg-input text-text-primary text-xs px-3 py-1.5 rounded border border-border focus:border-accent focus:outline-none font-mono"
        />
        <input
          v-model="connection.clientSecret"
          type="password"
          placeholder="Client Secret"
          class="w-[180px] bg-bg-input text-text-primary text-xs px-3 py-1.5 rounded border border-border focus:border-accent focus:outline-none font-mono"
        />
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

      <!-- Store API auth fields -->
      <template v-else>
        <input
          v-model="connection.accessKey"
          type="text"
          placeholder="sw-access-key"
          class="w-[280px] bg-bg-input text-text-primary text-xs px-3 py-1.5 rounded border border-border focus:border-accent focus:outline-none font-mono"
        />
        <input
          v-model="connection.contextToken"
          type="text"
          placeholder="sw-context-token (auto-captured)"
          class="w-[280px] bg-bg-input text-text-primary text-xs px-3 py-1.5 rounded border border-border focus:border-accent focus:outline-none font-mono"
        />
      </template>
    </div>

    <ConnectionStatus />

    <!-- Modals -->
    <ShopFormModal
      :open="showShopForm"
      :shop="editingShop"
      @close="showShopForm = false"
      @save="handleSaveShop"
    />

    <ShopDeleteConfirm
      :open="showDeleteConfirm"
      :shop-name="shops.activeShop?.name ?? ''"
      @close="showDeleteConfirm = false"
      @confirm="handleDeleteShop"
    />
  </div>
</template>
