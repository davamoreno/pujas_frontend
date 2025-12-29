<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useToast } from "vue-toastification";
// Import tipe jika sudah dipisah
import type { Pesanan } from '~/types/api/pesanan';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

const authStore = useAuthStore();
const config = useRuntimeConfig();
const toast = useToast();
const { $echo } = useNuxtApp();

// State Tab
const currentTab = ref('pending'); // pending, diproses, selesai

// --- STATE DATA ---
// Kita gunakan ref manual untuk menampung list pesanan agar mudah dimanipulasi (CRUD lokal)
const pesananItems = ref<Pesanan[]>([]);
const meta = ref<any>({});
const isLoading = ref(false);

// --- FETCH DATA FUNCTION ---
async function fetchPesanan() {
  isLoading.value = true;
  try {
    const data = await $fetch<any>(`${config.public.apiHost}/api/pesanan`, {
      params: { 
        status_pesanan: currentTab.value,
        page: 1 // Nanti bisa dinamis
      },
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    
    pesananItems.value = data.data;
    meta.value = data.meta;
  } catch (e) {
    console.error("Gagal fetch pesanan:", e);
    toast.error("Gagal memuat data pesanan.");
  } finally {
    isLoading.value = false;
  }
}

// Watch perubahan tab -> Fetch ulang
watch(currentTab, () => {
  fetchPesanan();
});

// Fetch awal saat mounted
onMounted(() => {
  fetchPesanan();
  setupRealtime();
});

// --- LOGIKA REAL-TIME ---
function setupRealtime() {
  const user = authStore.user;
  if (user?.role === 'Pemilik Tenant' && user.tenant) {
    const channelName = `tenant.${user.tenant.id}`;
    
    $echo.private(channelName)
      .listen('PesananMasukUntukTenant', (event: any) => {
        console.log('🔔 PESANAN BARU:', event);
        toast.info(`Pesanan Baru: ${event.kodePesanan}`);
        
        // HANYA jika kita sedang di tab "Belum Dibayar" (pending)
        if (currentTab.value === 'pending') {
            addNewOrderToState(event);
        } else {
            // Opsional: Kasih notif visual di tab "Belum Dibayar" (misal badge merah)
        }
      });
  }
}

// Helper: Masukkan data realtime ke state tanpa refresh
function addNewOrderToState(event: any) {
  // Mapping data event ke struktur Pesanan
  const newOrder: Pesanan = {
    id: event.pesanan_id || Date.now(), // Pastikan backend kirim ID pesanan asli di event!
    kode_pesanan: event.kodePesanan,
    status_pesanan: 'pending',
    total_harga: event.total_harga || 0, // Backend sebaiknya kirim ini juga
    created_at: new Date().toISOString(),
    is_new: true, // Flag untuk styling (misal background kuning)
    detail_pesanans: event.items.map((item: any) => ({
      id: item.id,
      jumlah: item.jumlah,
      catatan: item.catatan,
      menu_item: item.menuItem // Pastikan struktur ini sesuai backend
    }))
  };

  // Masukkan ke paling atas (unshift)
  pesananItems.value.unshift(newOrder);
}


// --- LOGIKA MODAL & AKSI ---
// (Bagian ini relatif sama, hanya sedikit perbaikan di refresh)
const modalState = reactive({
  title: '',
  message: '',
  confirmText: '',
  variant: 'primary',
  action: null as (() => Promise<void>) | null
});

function openModal(title: string, msg: string, btnText: string, variant: string, action: () => Promise<void>) {
  modalState.title = title;
  modalState.message = msg;
  modalState.confirmText = btnText;
  modalState.variant = variant;
  modalState.action = action;
}

async function executeAction() {
  if (modalState.action) await modalState.action();
}

async function konfirmasiBayar(pesanan: Pesanan) {
  try {
    await $fetch(`${config.public.apiHost}/api/pembayaran/${pesanan.id}/konfirmasi`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    
    toast.success(`Pesanan ${pesanan.kode_pesanan} lunas!`);
    
    // UI Optimis: Hapus dari list jika kita di tab 'pending'
    if (currentTab.value === 'pending') {
      pesananItems.value = pesananItems.value.filter(p => p.id !== pesanan.id);
    } else {
        fetchPesanan(); // Refresh data biar aman
    }

  } catch (e) {
    toast.error("Gagal konfirmasi pembayaran");
  }
}

async function selesaikanPesanan(pesanan: Pesanan) {
  try {
    await $fetch(`${config.public.apiHost}/api/pesanan/${pesanan.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: { status_pesanan: 'selesai' } // Sesuaikan status backend
    });

    toast.success(`Pesanan ${pesanan.kode_pesanan} selesai.`);
    
    // UI Optimis: Hapus dari list 'diproses'
    if (currentTab.value === 'diproses') {
      pesananItems.value = pesananItems.value.filter(p => p.id !== pesanan.id);
    } else {
      fetchPesanan();
    }

  } catch (e) {
    toast.error("Gagal update status pesanan");
  }
}
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Manajemen Pesanan</h1>
    </div>

    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: currentTab === 'pending' }" href="#" @click.prevent="currentTab = 'pending'">
          <i class="bi bi-wallet2 me-1"></i> Belum Dibayar
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: currentTab === 'diproses' }" href="#" @click.prevent="currentTab = 'diproses'">
          <i class="bi bi-fire me-1"></i> Sedang Diproses
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: currentTab === 'selesai' }" href="#" @click.prevent="currentTab = 'selesai'">
          <i class="bi bi-check-circle-fill me-1"></i> Selesai
        </a>
      </li>
    </ul>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else>
      
      <div v-if="pesananItems.length === 0" class="alert alert-secondary text-center py-4">
        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
        Tidak ada pesanan di status ini.
      </div>

      <div v-else class="row g-3">
        <div v-for="pesanan in pesananItems" :key="pesanan.id" class="col-md-6 col-lg-4">
          
          <div class="card h-100 shadow-sm border-0" :class="{ 'border-warning border-2': pesanan.is_new }">
            
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <span class="fw-bold text-primary">
                {{ pesanan.kode_pesanan }}
                <span v-if="pesanan.is_new" class="badge bg-warning text-dark ms-1 animate-pulse">BARU</span>
              </span>
              <small class="text-muted">{{ new Date(pesanan.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) }}</small>
            </div>
            
            <div class="card-body d-flex flex-column">
              <ul class="list-group list-group-flush mb-3 flex-grow-1">
                <li v-for="detail in pesanan.detail_pesanans" :key="detail.id" class="list-group-item px-0 py-2 border-bottom-0">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <span class="fw-bold me-1">{{ detail.jumlah }}x</span>
                      {{ detail.menu_item.nama }}
                    </div>
                    </div>
                  <div v-if="detail.catatan" class="text-danger small mt-1 ps-3 fst-italic">
                    <i class="bi bi-pencil-fill me-1" style="font-size: 0.7rem;"></i> {{ detail.catatan }}
                  </div>
                </li>
              </ul>

              <div class="mt-auto pt-3 border-top">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="text-muted small">Total Pesanan</span>
                  <span class="fs-5 fw-bold text-dark">Rp {{ Number(pesanan.total_harga).toLocaleString('id-ID') }}</span>
                </div>

                <div v-if="currentTab === 'pending'">
                  <button class="btn btn-success w-100 fw-bold" 
                    data-bs-toggle="modal" data-bs-target="#actionModal"
                    @click="openModal(
                      'Konfirmasi Pembayaran', 
                      `Terima pembayaran untuk <b>${pesanan.kode_pesanan}</b> senilai <b>Rp ${Number(pesanan.total_harga).toLocaleString('id-ID')}</b>?`, 
                      'Terima Pembayaran', 'success', 
                      () => konfirmasiBayar(pesanan)
                    )">
                    <i class="bi bi-cash-coin me-1"></i> Terima Bayar
                  </button>
                </div>

                <div v-if="currentTab === 'diproses'">
                  <button class="btn btn-primary w-100 fw-bold"
                    data-bs-toggle="modal" data-bs-target="#actionModal"
                    @click="openModal(
                      'Pesanan Selesai', 
                      `Pesanan <b>${pesanan.kode_pesanan}</b> sudah siap disajikan ke pelanggan?`, 
                      'Selesaikan', 'primary', 
                      () => selesaikanPesanan(pesanan)
                    )">
                    <i class="bi bi-bell-fill me-1"></i> Panggil Pelanggan
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>

    <ModalConfirmation 
      modalId="actionModal"
      :title="modalState.title"
      :message="modalState.message"
      :confirmText="modalState.confirmText"
      :confirmVariant="modalState.variant"
      @onConfirm="executeAction"
    />

  </div>
</template>

<style scoped>
/* Animasi kecil untuk badge BARU */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
.animate-pulse {
  animation: pulse 2s infinite;
}
.border-warning {
    transition: border-color 0.5s;
}
</style>