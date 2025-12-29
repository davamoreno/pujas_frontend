<script setup lang="ts">
import { useCustomerStore } from '~/stores/customer';

definePageMeta({
  layout: 'customer', // Pastikan layout ini ada, atau pakai 'default'
});

const customerStore = useCustomerStore();
const router = useRouter();
const namaInput = ref('');
const isLoading = ref(false);

// Jika user ternyata sudah punya sesi aktif, langsung lempar ke halaman Tenants
// (Misal dia tutup browser terus buka lagi)
onMounted(() => {
  if (customerStore.isGuestRegistered) {
    navigateTo('/tenants');
  }
});

async function mulaiPesan() {
  if (!namaInput.value.trim()) {
    alert("Masukkan namamu dulu ya!");
    return;
  }

  isLoading.value = true;
  
  // Panggil action di Store
  const success = await customerStore.registerGuest(namaInput.value);
  
  if (success) {
    // Redirect ke halaman pilih Kantin
    router.push('/tenants');
  } else {
    alert("Gagal memulai sesi. Coba lagi.");
  }
  
  isLoading.value = false;
}
</script>

<template>
  <div class="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light px-3">
    
    <div class="card border-0 shadow-lg rounded-4 overflow-hidden" style="max-width: 400px; width: 100%;">
      <div class="bg-primary p-5 text-center text-white position-relative">
        <i class="bi bi-shop display-1"></i>
        <div class="mt-3 fw-bold fs-4">Pujasera PNB</div>
        <p class="small opacity-75">Pesan makan tanpa antri</p>
        
        <div class="position-absolute top-0 start-0 translate-middle bg-white opacity-10 rounded-circle" style="width: 150px; height: 150px;"></div>
      </div>

      <div class="card-body p-4">
        <div class="mb-4 text-center">
          <h5 class="fw-bold text-dark">Selamat Datang! 👋</h5>
          <p class="text-muted small">Masukkan namamu untuk mulai memesan.</p>
        </div>

        <form @submit.prevent="mulaiPesan">
          <div class="mb-3">
            <label class="form-label fw-bold small text-uppercase text-muted">Nama Kamu</label>
            <input 
              v-model="namaInput"
              type="text" 
              class="form-control form-control-lg bg-light border-0" 
              placeholder="Contoh: Budi Gemez" 
              required
              autofocus
            >
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm transition-btn"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            {{ isLoading ? 'Memproses...' : 'Mulai Pesan Sekarang' }}
          </button>
        </form>
      </div>
      
      <div class="card-footer bg-white text-center border-0 pb-4">
        <small class="text-muted" style="font-size: 0.7rem;">&copy; 2024 Pujasera Digital</small>
      </div>
    </div>

  </div>
</template>

<style scoped>
.transition-btn {
  transition: transform 0.2s;
}
.transition-btn:active {
  transform: scale(0.95);
}
</style>