<script setup lang="ts">
import { useCustomerStore } from '~/stores/customer';
import { useCartStore } from '~/stores/cart';

const customerStore = useCustomerStore();
const cartStore = useCartStore();
const router = useRouter();

// --- STATE ---
const timeRemaining = ref('');
const showNavbar = ref(true);
const lastScrollPosition = ref(0);
const showExpiredModal = ref(false);

// --- SCROLL LOGIC ---
const onScroll = () => {
  if (process.client) { // Pastikan jalan di client side
    const currentScrollPosition = window.scrollY || document.documentElement.scrollTop;
    if (currentScrollPosition < 0) return;
    
    // Threshold 60px
    if (Math.abs(currentScrollPosition - lastScrollPosition.value) < 60) return;
    
    showNavbar.value = currentScrollPosition < lastScrollPosition.value;
    lastScrollPosition.value = currentScrollPosition;
  }
};

// --- TIME LOGIC ---
function updateTime(){
  if(!customerStore.expired_at) return;

  const now = new Date().getTime();
  const expired = new Date(customerStore.expired_at).getTime();
  const diff = expired - now;

  if (diff <= 0) {
    timeRemaining.value = 'Habis';
    return;
  } 

  const diffHours = Math.floor(diff / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    timeRemaining.value = `${diffHours}j ${diffMinutes}m`;
  } else {
    timeRemaining.value = `${diffMinutes} mnt`;
  }
}

function checkExpiration() {
  if (!customerStore.expired_at || !customerStore.sesi_kode) return;

  const now = new Date().getTime();
  const expired = new Date(customerStore.expired_at).getTime();

  if (now >= expired) {
    showExpiredModal.value = true;
    if (timerInterval) clearInterval(timerInterval); // Stop timer
  }
}

// --- LIFECYCLE ---
let timerInterval: any;

onMounted(() => {
  updateTime(); // Jalan sekali di awal
  
  // PERBAIKAN: Gabung jadi satu interval
  timerInterval = setInterval(() => {
    updateTime();
    checkExpiration();
  }, 60000); // Cek setiap 1 menit

  window.addEventListener('scroll', onScroll);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  window.removeEventListener('scroll', onScroll);
});

// --- ACTIONS ---
async function forceLogout() {
  showExpiredModal.value = false;
  customerStore.$reset(); 
  cartStore.clearCart(); 
  router.push('/');
}

async function handleLogout() {
  const confirm = window.confirm('Apakah Anda ingin mengganti nama atau keluar?');
  if (confirm) {
    cartStore.clearCart();
    await customerStore.closeSession(); 
  }
}
</script>

<template>
  <div class="d-flex flex-column min-vh-100 bg-light">
    
    <nav class="navbar navbar-expand-md navbar-white bg-white shadow-sm fixed-top smart-navbar"
         :class="{ 'navbar-hidden': !showNavbar }">
      
      <div class="container">
        <NuxtLink to="/tenants" class="navbar-brand fw-bold text-primary d-flex align-items-center">
          <i class="bi bi-shop-window fs-4"></i>
          <span class="ms-2 d-none d-sm-block">Pujasera<span class="text-dark">PNB</span></span>
        </NuxtLink>

        <div class="collapse navbar-collapse justify-content-center d-none d-md-flex">
          <ul class="navbar-nav gap-4">
            <li class="nav-item">
              <NuxtLink to="/tenants" class="nav-link fw-bold" active-class="text-primary active-border">Menu</NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink to="/checkout" class="nav-link fw-bold" active-class="text-primary active-border">Keranjang</NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink to="/orders/history" class="nav-link fw-bold" active-class="text-primary active-border">Riwayat</NuxtLink>
            </li>
          </ul>
        </div>

        <div class="d-flex align-items-center">
          <div v-if="customerStore.nama && timeRemaining" class="me-2 me-md-3 text-muted small fw-bold" style="font-size: 0.85rem;">
            <i class="bi bi-clock me-1"></i>{{ timeRemaining }}
          </div>
          <div v-if="customerStore.nama" class="d-flex align-items-center bg-light rounded-pill px-2 px-md-3 py-1 border">
            <i class="bi bi-person-circle text-secondary me-1 me-md-2"></i>
            <span class="small fw-bold text-truncate" style="max-width: 80px;">{{ customerStore.nama }}</span>
            <span class="mx-1 mx-md-2 text-muted">|</span>
            <button @click="handleLogout" class="btn btn-link text-danger text-decoration-none p-0" title="Keluar">
              <i class="bi bi-box-arrow-right fs-5"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="flex-grow-1 main-content mt-5 pt-3">
      <slot />
    </main>

    <CustomerBottomNav class="d-md-none" />

    <footer class="bg-white py-3 mt-auto border-top mb-md-0 mb-5 d-none d-md-block">
      <div class="container text-center text-muted small">
        &copy; 2024 Pujasera PNB
      </div>
    </footer>

    <div v-if="showExpiredModal" class="modal-backdrop show-modal d-flex align-items-center justify-content-center">
        <div class="bg-white p-4 rounded-4 shadow-lg text-center mx-3 fade-in-up" style="max-width: 400px; width: 100%;">
            <div class="mb-3">
                <div class="bg-danger bg-opacity-10 rounded-circle d-inline-flex p-3 mb-2">
                    <i class="bi bi-alarm-fill text-danger display-4"></i>
                </div>
            </div>
            <h4 class="fw-bold text-dark">Waktu Sesi Habis! ⌛</h4>
            <p class="text-muted">Maaf, waktu sesi pemesanan kamu sudah berakhir. Silakan masukkan nama kembali.</p>
            <button @click="forceLogout" class="btn btn-danger w-100 py-2 rounded-pill fw-bold">Oke, Mengerti</button>
        </div>
    </div>

  </div>
</template>

<style scoped>
/* SMART NAVBAR */
.smart-navbar {
  transition: transform 0.3s ease-in-out;
  height: 65px; /* Tinggi standar */
  z-index: 1030;
}
.navbar-hidden {
  transform: translateY(-100%);
}
.active-border {
  border-bottom: 2px solid var(--bs-primary);
}

/* MAIN CONTENT PADDING */
.main-content {
  /* Mobile: 65px (Nav Bawah) + 70px (Cart) + Space */
  padding-bottom: 150px; 
}
@media (min-width: 768px) {
  .main-content {
    /* Desktop: Cukup space untuk footer */
    padding-bottom: 60px;
  }
}

/* MODAL BACKDROP */
.modal-backdrop.show-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 9999;
    backdrop-filter: blur(5px);
}

/* ANIMASI POPUP */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}
</style>