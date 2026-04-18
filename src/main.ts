import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import './assets/main.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia)

// Load file-based stores before mounting to avoid flash of empty state
async function loadStores() {
  const { useShopsStore } = await import('@/stores/shops')
  const { useSavedRequestsStore } = await import('@/stores/saved-requests')
  const { useHistoryStore } = await import('@/stores/history')
  const { useConnectionStore } = await import('@/stores/connection')

  await Promise.all([
    useShopsStore().loadFromDisk(),
    useSavedRequestsStore().loadFromDisk(),
    useHistoryStore().loadFromDisk(),
    useConnectionStore().loadFromDisk(),
  ])
}

loadStores().finally(() => {
  app.mount('#app')
})
