<script setup>
import { ref } from 'vue';

// Logika data reaktif
const order = ref({
  name: 'Mumuchang',
  quantity: 2,
  totalPrice: 'Rp25.000',
  status: 'Diproses'
});

// Logika tombol
function goToHome() {
  console.log("Navigasi ke beranda...");
  // Di sini Anda akan menggunakan Vue Router, contoh: router.push('/')
}
</script>

<template>
  <div class="container d-flex justify-content-center align-items-center vh-100 bg-white">
    
    <div class="text-center" style="width: 100%; max-width: 400px;">
      
      <div class="success-checkmark-simple mb-4">
        <svg viewBox="0 0 52 52">
          <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      </div>
      
      <h2 class="fw-bold">Pembayaran Sukses</h2>
      <p class="text-muted mb-4">Pesananmu sedang diproses</p>
      
      <div class="card shadow-sm border-0 rounded-4">
        <div class="card-body p-4">
          
          <ul class="list-group list-group-flush">
            <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
              <span class="text-secondary">Nama</span>
              <span class="fw-semibold">{{ order.name }}</span>
            </li>
            
            <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
              <span class="text-secondary">Jumlah Pesanan</span>
              <span class="fw-semibold">{{ order.quantity }}</span>
            </li>
            
            <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
              <span class="text-secondary">Total Harga</span>
              <span class="fw-semibold">{{ order.totalPrice }}</span>
            </li>
            
            <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
              <span class="text-secondary">Status Pesanan</span>
              <span class="fw-semibold">{{ order.status }}</span>
            </li>
          </ul>
          
        </div>
      </div>
      
      <button 
        @click="goToHome" 
        class="btn btn-dark w-100 py-3 mt-4 rounded-3 fw-semibold"
      >
        Kembali ke Beranda
      </button>
      
    </div>
  </div>
</template>

<style scoped>
/* Style Bootstrap kustom */
.bg-light {
  background-color: #f8f9fa !important;
}

.rounded-4 {
  border-radius: 1rem;
}

/* --- STYLE UNTUK ANIMASI CENTANG SVG --- */
.success-checkmark-simple {
  width: 80px;
  height: 80px;
  margin: 0 auto;
}
.success-checkmark-simple svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.checkmark-circle {
  stroke-width: 4;
  stroke: #000;
  fill: none;
  /* Animasi untuk lingkaran */
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: stroke-circle 0.6s ease-out forwards;
}

.checkmark-check {
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke: #000;
  fill: none;
  /* Animasi untuk centang */
  stroke-dasharray: 48; /* Panjang path centang */
  stroke-dashoffset: 48;
  animation: stroke-check 0.6s ease-out forwards 0.3s; /* Mulai setelah lingkaran */
}

/* Keyframes untuk Animasi SVG */
@keyframes stroke-circle {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes stroke-check {
  to {
    stroke-dashoffset: 0;
  }
}
</style>