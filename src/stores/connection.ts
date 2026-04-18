import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiMode, ShopwareVersion } from '@/types/shopware'
import { authenticate, scheduleRefresh, cancelRefresh } from '@/services/auth'

export const useConnectionStore = defineStore(
  'connection',
  () => {
    // Persisted config
    const baseUrl = ref('')
    const apiMode = ref<ApiMode>('admin')
    const version = ref<ShopwareVersion>('6.7')
    const clientId = ref('')
    const clientSecret = ref('')
    const accessKey = ref('')

    // Runtime state (not persisted)
    const token = ref<string | null>(null)
    const tokenExpiresAt = ref<number | null>(null)
    const contextToken = ref<string | null>(null)
    const isConnecting = ref(false)
    const connectionError = ref<string | null>(null)

    const isConnected = computed(() => {
      if (apiMode.value === 'admin') {
        return token.value !== null && tokenExpiresAt.value !== null && tokenExpiresAt.value > Date.now()
      }
      return accessKey.value.length > 0
    })

    const tokenSecondsRemaining = computed(() => {
      if (!tokenExpiresAt.value) return 0
      return Math.max(0, Math.round((tokenExpiresAt.value - Date.now()) / 1000))
    })

    async function connect() {
      if (apiMode.value === 'store') return

      isConnecting.value = true
      connectionError.value = null

      try {
        const res = await authenticate(baseUrl.value, clientId.value, clientSecret.value)
        token.value = res.access_token
        tokenExpiresAt.value = Date.now() + res.expires_in * 1000

        scheduleRefresh(
          baseUrl.value,
          clientId.value,
          clientSecret.value,
          res.expires_in,
          (refreshed) => {
            token.value = refreshed.access_token
            tokenExpiresAt.value = Date.now() + refreshed.expires_in * 1000
          },
          (err) => {
            connectionError.value = `Token refresh failed: ${err.message}`
          },
        )
      } catch (err) {
        connectionError.value = err instanceof Error ? err.message : String(err)
        token.value = null
        tokenExpiresAt.value = null
      } finally {
        isConnecting.value = false
      }
    }

    function disconnect() {
      cancelRefresh()
      token.value = null
      tokenExpiresAt.value = null
      contextToken.value = null
      connectionError.value = null
    }

    function updateContextToken(newToken: string | null) {
      if (newToken) {
        contextToken.value = newToken
      }
    }

    return {
      baseUrl,
      apiMode,
      version,
      clientId,
      clientSecret,
      accessKey,
      token,
      tokenExpiresAt,
      contextToken,
      isConnecting,
      connectionError,
      isConnected,
      tokenSecondsRemaining,
      connect,
      disconnect,
      updateContextToken,
    }
  },
  {
    persist: {
      pick: ['baseUrl', 'apiMode', 'version', 'clientId', 'clientSecret', 'accessKey'],
    },
  },
)
