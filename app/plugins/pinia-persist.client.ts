// plugins/pinia-persist.client.ts
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin((nuxtApp) => {
  // Gunakan instance Pinia yang sudah dibuat oleh Nuxt ($pinia)
  (nuxtApp.$pinia as any).use(piniaPluginPersistedstate)
})