<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
    <div class="max-w-2xl w-full text-center">

      <!-- Error Code -->
      <div class="mb-4">
        <h1 class="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-2">
          403
        </h1>
        <div class="h-1 w-32 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full"></div>
      </div>

      <!-- Error Message -->
      <h2 class="text-3xl font-bold text-gray-800 mb-4">
        Akses Ditolak
      </h2>
      <p class="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika Anda yakin ini adalah kesalahan.
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <NuxtLink 
          to="/" 
          class="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Kembali ke Beranda
        </NuxtLink>
        <button 
          @click="goBack"
          class="px-8 py-3 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:shadow-lg border-2 border-gray-200 transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Halaman Sebelumnya
        </button>
      </div>

      <!-- Additional Info -->
      <div class="mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
        <h3 class="font-semibold text-gray-800 mb-2">Kemungkinan Penyebab:</h3>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• Anda tidak login atau sesi Anda telah berakhir</li>
          <li>• Akun Anda tidak memiliki hak akses yang diperlukan</li>
          <li>• Halaman ini dibatasi untuk pengguna tertentu</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const goBack = () => {
  router.back()
}

// Set page meta
useHead({
  title: '403 - Akses Ditolak',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.3;
  }
}

.animate-pulse {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>