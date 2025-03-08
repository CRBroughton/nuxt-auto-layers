export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-03-08',

  autoLayers: {
    debug: false,
    autoRegister: {
      components: true,
      composables: true,
      plugins: true,
      utils: true,
      shared: false,
      pages: true,
    },
  },
})
