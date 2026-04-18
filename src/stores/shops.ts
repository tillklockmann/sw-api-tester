import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ShopInstance } from '@/types/shop'
import { loadShops, saveShops } from '@/services/config-storage'

export const useShopsStore = defineStore(
  'shops',
  () => {
    const shops = ref<ShopInstance[]>([])
    const activeShopId = ref<string | null>(null)
    const isLoaded = ref(false)

    const activeShop = computed(() =>
      shops.value.find((s) => s.id === activeShopId.value) ?? null,
    )

    async function loadFromDisk() {
      try {
        shops.value = await loadShops()
      } catch {
        shops.value = []
      }
      isLoaded.value = true
    }

    async function saveToDisk() {
      try {
        await saveShops(shops.value)
      } catch (err) {
        console.warn('Failed to save shops:', err)
      }
    }

    async function addShop(
      shop: Omit<ShopInstance, 'id' | 'createdAt' | 'updatedAt'>,
    ): Promise<ShopInstance> {
      const newShop: ShopInstance = {
        ...shop,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      shops.value.push(newShop)
      await saveToDisk()
      return newShop
    }

    async function updateShop(
      id: string,
      updates: Partial<Omit<ShopInstance, 'id' | 'createdAt'>>,
    ) {
      const index = shops.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        shops.value[index] = {
          ...shops.value[index],
          ...updates,
          updatedAt: Date.now(),
        }
        await saveToDisk()
      }
    }

    async function removeShop(id: string) {
      shops.value = shops.value.filter((s) => s.id !== id)
      if (activeShopId.value === id) {
        activeShopId.value = null
      }
      await saveToDisk()
    }

    function setActiveShop(id: string | null) {
      activeShopId.value = id
    }

    return {
      shops,
      activeShopId,
      activeShop,
      isLoaded,
      loadFromDisk,
      addShop,
      updateShop,
      removeShop,
      setActiveShop,
    }
  },
  {
    persist: {
      pick: ['activeShopId'],
    },
  },
)
