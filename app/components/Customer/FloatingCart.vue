<script setup lang="ts">
  import { useCartStore } from '~/stores/cart';
  const cartStore = useCartStore();
  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
</script>

<template>
  <Transition name="slide-up">
    <div v-if="cartStore.items.length > 0" class="fixed-bottom container p-3 floating-cart-container">
      <div class="card border-0 shadow-lg bg-primary text-white rounded-4 overflow-hidden">
        <div class="card-body p-3 d-flex align-items-center justify-content-between" @click="navigateTo('/checkout')" style="cursor: pointer;">
          
          <div>
            <div class="fw-bold fs-6">{{ cartStore.totalQty }} Item &bull; {{ formatRupiah(cartStore.totalPrice) }}</div>
            <div class="small opacity-75 text-truncate" style="max-width: 200px;">{{ cartStore.tenantName }}</div>
          </div>

          <div class="d-flex align-items-center fw-bold">
            Lihat Keranjang <i class="bi bi-arrow-right ms-2"></i>
          </div>

        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Posisi Floating Cart */
.mb-safe {
  /* Di Desktop: Melayang biasa di bawah */
  margin-bottom: 40px; 
}

/* Di Mobile (Layar < 768px): Naikkan ke atas Bottom Nav */
@media (max-width: 768px) {
  .mb-safe {
    margin-bottom: 80px; /* Sesuaikan dengan tinggi BottomNav (65px) + spasi */
  }
}

/* Animasi Masuk/Keluar */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.floating-cart-container {
  z-index: 1040; /* Pastikan di atas BottomNav (biasanya z-index 1030) */
  pointer-events: none; /* Agar klik tembus ke elemen di bawahnya jika cart tidak diklik */
  bottom: 70px; /* Jarak dari bawah layar */
}

/* Container kartu cart itu sendiri */
.floating-cart-container .card {
  pointer-events: auto; /* Aktifkan klik pada kartu cart */
  /* Tambahkan shadow agar lebih 'melayang' */
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1); 
}

/* Pada layar kecil (mobile), angkat cart ke atas BottomNav */
@media (max-width: 767.98px) {
  .floating-cart-container {
    /* Sesuaikan dengan tinggi BottomNav + sedikit spasi */
    bottom: 70px; 
  }
}
</style>