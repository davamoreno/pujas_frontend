// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  nitro: {
    preset: 'node-server',
  },
  modules: ['@pinia/nuxt', '@vueuse/nuxt', 'pinia-plugin-persistedstate/nuxt'],
  css: [
        'bootstrap/dist/css/bootstrap.min.css', 
        'bootstrap-icons/font/bootstrap-icons.css',
        "vue-toastification/dist/index.css"
      ],
  plugins: ['app/plugins/bootstrap.client.ts', 'app/plugins/echo.client.ts'],
  routeRules: {
    '/api/**': { proxy: {to : 'http://127.0.0.1:8000/api/**'} },
    '/broadcasting/auth': { proxy: {to : 'http://127.0.0.1:8000/broadcasting/auth'} },
  },
  build: {
    transpile: ['vue-toastification'],
  },

  piniaPluginPersistedstate: {
    key: 'prefix_%id_postfix',
    storage: 'cookies',
    cookieOptions: {
      sameSite: 'lax',
      maxAge: 86400, // 1 day
      secure: false,
    },
    debug: true
  },

  runtimeConfig: {
    public: {
      apiHost: process.env.NUXT_PUBLIC_API_HOST,
      reverbAppKey: process.env.NUXT_PUBLIC_REVERB_APP_KEY,
      reverbHost: process.env.NUXT_PUBLIC_REVERB_HOST,
      reverbPort: Number(process.env.NUXT_PUBLIC_REVERB_PORT),
      reverbScheme: process.env.NUXT_PUBLIC_REVERB_SCHEME,
    },
  },
})
