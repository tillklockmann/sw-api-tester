import { defineStore } from 'pinia'
import { ref, computed, onScopeDispose } from 'vue'
import type { ApiMode, ShopwareVersion } from '@/types/shopware'
import { authenticate, scheduleRefresh, cancelRefresh } from '@/services/auth'
import { loadConfig, saveConfig } from '@/services/config-storage'

export const useConnectionStore = defineStore(
  'connection',
  () => {
    // Persisted config (file-based)
    const baseUrl = ref('')
    const apiMode = ref<ApiMode>('admin')
    const version = ref<ShopwareVersion>('6.7')
    const clientId = ref('')
    const clientSecret = ref('')
    const accessKey = ref('')
    const isLoaded = ref(false)

    // Runtime state (not persisted)
    const token = ref<string | null>(null)
    const tokenExpiresAt = ref<number | null>(null)
    const contextToken = ref<string | null>(null)
    const isConnecting = ref(false)
    const connectionError = ref<string | null>(null)

    // Reactive tick for time-dependent computeds
    const _tick = ref(0)
    const _tickInterval = setInterval(() => { _tick.value++ }, 1000)
    onScopeDispose(() => clearInterval(_tickInterval))

    const isConnected = computed(() => {
      if (apiMode.value === 'admin') {
        void _tick.value // subscribe to tick updates
        return token.value !== null && tokenExpiresAt.value !== null && tokenExpiresAt.value > Date.now()
      }
      return accessKey.value.length > 0
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

    async function loadFromDisk() {
      try {
        const data = await loadConfig<{
          baseUrl?: string
          apiMode?: ApiMode
          version?: ShopwareVersion
          clientId?: string
          clientSecret?: string
          accessKey?: string
        }>('connection')
        if (data.baseUrl !== undefined) baseUrl.value = data.baseUrl
        if (data.apiMode !== undefined) apiMode.value = data.apiMode
        if (data.version !== undefined) version.value = data.version
        if (data.clientId !== undefined) clientId.value = data.clientId
        if (data.clientSecret !== undefined) clientSecret.value = data.clientSecret
        if (data.accessKey !== undefined) accessKey.value = data.accessKey
      } catch {
        // First run or dev server not available — use defaults
      }
      isLoaded.value = true
    }

    async function saveToDisk() {
      try {
        await saveConfig('connection', {
          baseUrl: baseUrl.value,
          apiMode: apiMode.value,
          version: version.value,
          clientId: clientId.value,
          clientSecret: clientSecret.value,
          accessKey: accessKey.value,
        })
      } catch (err) {
        console.warn('Failed to save connection config:', err)
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
      isLoaded,
      connect,
      disconnect,
      updateContextToken,
      loadFromDisk,
      saveToDisk,
    }
  },
)
