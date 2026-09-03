export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'Qompyl Dashboard',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { key: 'description', name: 'description', content: 'Premium GSC Dashboard' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap' }
      ],
      script: [
        { src: 'https://unpkg.com/lucide@latest', defer: true },
        { src: 'https://cdn.jsdelivr.net/npm/chart.js', defer: true }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  css: [
    '~/assets/styles/main.css'
  ],


  components: true,
  build: {
    transpile: ['chart.js']
  },

  nitro: {
    // preset: 'node-server' // default
  },
  modules: [
    '@nuxtjs/supabase'
  ],
  supabase: {
    // هذه الإعدادات تجبر أي زائر غير مسجل بالذهاب لصفحة login
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: [], // لو أردت استثناء صفحات من الحماية تضعها هنا
    }
  },
  
})