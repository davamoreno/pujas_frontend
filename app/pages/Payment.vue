<template>
  <div class="d-flex flex-column align-items-center justify-content-center vh-100 bg-light p-4">
    
    <div class="w-100 text-center" style="max-width: 480px;">
    
      <h1 class="h2 text-dark mb-4">
        Pembayaran
      </h1>

      <div class="shadow-sm bg-white rounded-3 p-3">
        <div class="d-flex align-items-center justify-content-between">
          
          <div class="text-start">
            <span class="text-muted small d-block">Bayar sebelum</span>
            <span class="fw-semibold text-dark d-block">{{ formattedTargetDate }}</span>
          </div>
          
          <div class="d-flex align-items-center">
            <div class="timer-box-bs">{{ minutesTens }}</div>
            <div class="timer-box-bs ms-1">{{ minutesOnes }}</div>
            <span class="timer-colon-bs mx-2">:</span>
            <div class="timer-box-bs">{{ secondsTens }}</div>
            <div class="timer-box-bs ms-1">{{ secondsOnes }}</div>
          </div>
        </div>
      </div>

      <div class="shadow-sm bg-white rounded-3 p-4 mt-3 text-center">
        
        <h3 class="h5 fw-semibold text-dark">
          {{ paymentDetails.storeName }}
        </h3>
        
        <img 
          src="/img/QR Code.jpg"
          alt="QR Code Pembayaran" 
          class="img-fluid mx-auto my-3"
          style="width: 192px; height: 192px;" 
        >
        
        <p class="h6 text-muted">
          {{ paymentDetails.status }}
        </p>
        
      </div>

      <button 
        :disabled="!isPaid" 
        class="btn w-100 mt-3 py-2 fs-6 fw-semibold"
        :class="isPaid ? 'btn-dark' : 'btn-secondary'"
      >
        Cetak Struk
      </button>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// --- DATA UNTUK QR CODE & STATUS ---
const isPaid = ref(false); // Ganti jadi 'true' untuk mengaktifkan tombol

const paymentDetails = ref({
  storeName: 'Wr. Bu Mang',
  // paymentId: 'ORDER-12345-XYZ', // Tidak lagi perlu
  status: 'Menunggu verifikasi pembayaran'
});

// --- PERUBAHAN DI SINI: QR Code menggunakan gambar statis ---
// Anda harus memastikan gambar 'qr-code.png' ada di folder 'public'
// atau di alias path 'assets' Anda.
const qrCodeUrl = ref('/qr-code.png'); // <-- Ganti dengan path ke gambar Anda

// --- LOGIKA COUNTDOWN (Tidak berubah) ---
// Script ini SAMA PERSIS dengan versi Tailwind di atas.
const DURATION_IN_MINUTES = 30;
const DURATION_IN_SECONDS = DURATION_IN_MINUTES * 60;
const formattedTargetDate = ref('');
const remainingSeconds = ref(DURATION_IN_SECONDS);
let intervalId = null;

function setTargetDateAndTime() {
  const now = new Date();
  const targetTime = new Date(now.getTime() + DURATION_IN_SECONDS * 1000);
  const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
  const formattedDate = targetTime.toLocaleString('id-ID', dateOptions);
  const formattedTime = targetTime.toLocaleString('id-ID', timeOptions);
  formattedTargetDate.value = `${formattedDate}, ${formattedTime}`;
}

function updateTimer() {
  if (remainingSeconds.value > 0) {
    remainingSeconds.value--;
  } else {
    clearInterval(intervalId);
    console.log("Waktu habis!");
    paymentDetails.value.status = "Waktu pembayaran habis";
  }
}

onMounted(() => {
  setTargetDateAndTime();
  intervalId = setInterval(updateTimer, 1000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});

const minutes = computed(() => Math.floor(remainingSeconds.value / 60));
const seconds = computed(() => Math.floor(remainingSeconds.value % 60));
const minutesTens = computed(() => Math.floor(minutes.value / 10));
const minutesOnes = computed(() => minutes.value % 10);
const secondsTens = computed(() => Math.floor(seconds.value / 10));
const secondsOnes = computed(() => seconds.value % 10);
</script>

<style scoped>
/* Style kotak timer (sama seperti sebelumnya) */
.timer-box-bs {
  background-color: #f8f9fa; /* .bg-light */
  color: #212529;            /* .text-dark */
  font-weight: 700;
  font-size: 1.5rem;
  padding: 0.75rem;
  border-radius: 0.375rem;   /* .rounded-2 */
  width: 3rem;
  text-align: center;
  line-height: 1.25;
}

.timer-colon-bs {
  font-weight: 700;
  font-size: 1.5rem;
  color: #6c757d; /* .text-muted */
}
</style>