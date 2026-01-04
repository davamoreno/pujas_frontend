<script setup lang="ts">
// ... (Script bagian atas TETAP SAMA, tidak ada perubahan logic) ...
import { useAuthStore } from '~/stores/auth';
import { useToast } from "vue-toastification";
import type { Pesanan } from '~/types/api/pesanan';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

const authStore = useAuthStore();
const config = useRuntimeConfig();
const toast = useToast();
const { $echo } = useNuxtApp();

// --- STATE ---
const currentTab = ref('pending'); 
const paymentFilter = ref('all');
const pesananItems = ref<Pesanan[]>([]);
const isLoading = ref(false);
let channelName = '';

const counts = reactive({
  pending: 0,
  diproses: 0,
  selesai: 0,
  dibatalkan: 0 
});

let audio: HTMLAudioElement | null = null;
const isAudioReady = ref(false);

onMounted(() => {
  audio = new Audio('/sounds/ringtone.mp3'); 
  audio.play().then(() => {
    isAudioReady.value = true;
    audio?.pause();
    audio!.currentTime = 0;
  }).catch(() => {
    isAudioReady.value = false;
  });

  fetchPesanan();
  setupRealtime();
});

function enableAudio() {
  if (audio) {
    audio.play().then(() => {
      isAudioReady.value = true;
      audio?.pause();
      audio!.currentTime = 0;
      toast.success("Suara Notifikasi Aktif! 🔊");
    });
  }
}

function playSound() {
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(e => console.log("Audio diblokir browser:", e));
  }
}

async function fetchPesanan(refreshCounts = true) {
  isLoading.value = true;
  try {
    const data = await $fetch<any>(`${config.public.apiHost}/api/pesanan`, {
      params: { 
        status_pesanan: currentTab.value,
        page: 1 
      },
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    
    pesananItems.value = data.data; 
    if (refreshCounts) fetchCounts();

  } catch (e) {
    console.error("Gagal fetch pesanan:", e);
  } finally {
    isLoading.value = false;
  }
}

const filteredPesananItems = computed(() => {
  if (paymentFilter.value === 'all') {
    return pesananItems.value;
  }
  return pesananItems.value.filter(pesanan => {
    const isTunai = pesanan.pembayaran?.metode_pembayaran_id === 1;
    if (paymentFilter.value === 'tunai') return isTunai;
    if (paymentFilter.value === 'emoney') return !isTunai;
    return true;
  });
});

async function fetchCounts() {
  try {
    const data = await $fetch<any>(`${config.public.apiHost}/api/pesanan/counts`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (data) {
        counts.pending = data.pending || 0;
        counts.diproses = data.diproses || 0;
        counts.selesai = data.selesai || 0;
        counts.dibatalkan = data.dibatalkan || 0;
    }
  } catch (e) {}
}

watch(currentTab, () => {
  paymentFilter.value = 'all'; 
  fetchPesanan(false); 
});

function setupRealtime() {
  const user = authStore.user;
  if (user?.role === 'Pemilik Tenant' && user.tenant) {
    channelName = `tenant.${user.tenant.id}`;
    $echo.leave(channelName);
    
    console.log(`📡 Menghubungkan ke Reverb Channel: ${channelName}`);
    $echo.private(channelName)
      .listen('.PesananMasukUntukTenant', (event: any) => {
        console.log('🔥 REALTIME EVENT:', event);
        playSound(); 
        fetchPesanan(true); 
        
        const statusMsg = event.pesanan?.status_pesanan || 'Update Status';
        toast.info(`Pesanan ${event.kodePesanan}: ${statusMsg}`, { timeout: 5000, icon: "🔔" });
      })
      .error((error: any) => { console.error('❌ Reverb Error:', error); });
  }
}

const modalState = reactive({
  title: '', message: '', confirmText: '', variant: 'primary',
  action: null as (() => Promise<void>) | null
});

function openModal(title: string, msg: string, btnText: string, variant: string, action: () => Promise<void>) {
  modalState.title = title; modalState.message = msg;
  modalState.confirmText = btnText; modalState.variant = variant;
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
    toast.success(`Pembayaran Tunai Diterima!`);
    pesananItems.value = pesananItems.value.filter(p => p.id !== pesanan.id);
    counts.pending--; counts.diproses++;
  } catch (e) { toast.error("Gagal konfirmasi"); }
}

async function selesaikanPesanan(pesanan: Pesanan) {
  try {
    await $fetch(`${config.public.apiHost}/api/pesanan/${pesanan.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: { status_pesanan: 'selesai' }
    });
    toast.success(`Pesanan Selesai!`);
    pesananItems.value = pesananItems.value.filter(p => p.id !== pesanan.id);
    counts.diproses--; counts.selesai++;
  } catch (e) { toast.error("Gagal update status"); }
}

function isDigitalPayment(pesanan: Pesanan) {
    const method = pesanan.pembayaran?.metode_pembayaran_id;
    return method !== 1; 
}
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 fw-bold">Manajemen Pesanan</h1>
      <button v-if="!isAudioReady" @click="enableAudio" class="btn btn-warning btn-sm shadow-sm animate-pulse">
        <i class="bi bi-volume-up-fill"></i> Aktifkan Suara
      </button>
    </div>

    <div class="row g-2 mb-3">
      
      <div class="col-6 col-md-3">
        <button class="btn w-100 py-3 shadow-sm d-flex flex-column align-items-center justify-content-center h-100 position-relative"
          :class="currentTab === 'pending' ? 'btn-primary' : 'btn-outline-primary bg-white'"
          @click="currentTab = 'pending'">
          <i class="bi bi-wallet2 fs-4 mb-1"></i>
          <span class="fw-bold small">Belum Bayar</span>
          <span v-if="counts.pending > 0" 
                class="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger border border-light">
            {{ counts.pending }}
          </span>
        </button>
      </div>

      <div class="col-6 col-md-3">
        <button class="btn w-100 py-3 shadow-sm d-flex flex-column align-items-center justify-content-center h-100 position-relative"
          :class="currentTab === 'diproses' ? 'btn-warning text-dark' : 'btn-outline-warning bg-white text-dark'"
          @click="currentTab = 'diproses'">
          <i class="bi bi-fire fs-4 mb-1"></i>
          <span class="fw-bold small">Diproses</span>
          <span v-if="counts.diproses > 0" 
                class="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger border border-light">
            {{ counts.diproses }}
          </span>
        </button>
      </div>

      <div class="col-6 col-md-3">
        <button class="btn w-100 py-3 shadow-sm d-flex flex-column align-items-center justify-content-center h-100"
          :class="currentTab === 'selesai' ? 'btn-success' : 'btn-outline-success bg-white'"
          @click="currentTab = 'selesai'">
          <i class="bi bi-check-circle-fill fs-4 mb-1"></i>
          <span class="fw-bold small">Selesai</span>
        </button>
      </div>

      <div class="col-6 col-md-3">
        <button class="btn w-100 py-3 shadow-sm d-flex flex-column align-items-center justify-content-center h-100 position-relative"
          :class="currentTab === 'dibatalkan' ? 'btn-danger' : 'btn-outline-danger bg-white'"
          @click="currentTab = 'dibatalkan'">
          <i class="bi bi-x-circle-fill fs-4 mb-1"></i>
          <span class="fw-bold small">Dibatalkan</span>
          <span v-if="counts.dibatalkan > 0" 
                class="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-secondary border border-light">
            {{ counts.dibatalkan }}
          </span>
        </button>
      </div>

    </div>

    <div v-if="currentTab === 'pending'" class="card border-0 shadow-sm mb-4 bg-white rounded-3">
        <div class="card-body py-2 px-3">
            <div class="d-flex align-items-center justify-content-between mb-2 d-md-none">
               <small class="text-muted fw-bold">Filter Pembayaran:</small>
            </div>
            
            <div class="btn-group w-100" role="group">
                <input type="radio" class="btn-check" name="btnradio" id="btnradio1" value="all" v-model="paymentFilter" checked>
                <label class="btn btn-outline-secondary btn-sm" for="btnradio1">Semua</label>

                <input type="radio" class="btn-check" name="btnradio" id="btnradio2" value="tunai" v-model="paymentFilter">
                <label class="btn btn-outline-success btn-sm" for="btnradio2"><i class="bi bi-cash"></i> Tunai</label>

                <input type="radio" class="btn-check" name="btnradio" id="btnradio3" value="emoney" v-model="paymentFilter">
                <label class="btn btn-outline-info btn-sm" for="btnradio3"><i class="bi bi-qr-code"></i> E-Money</label>
            </div>
        </div>
    </div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else>
      <div v-if="filteredPesananItems.length === 0" class="text-center py-5 bg-white rounded-4 shadow-sm">
        <div class="bg-light rounded-circle d-inline-flex p-4 mb-3">
            <i class="bi bi-inbox fs-1 text-muted"></i>
        </div>
        <h6 class="text-muted">Tidak ada pesanan.</h6>
      </div>

      <div v-else class="row g-3">
        <div v-for="pesanan in filteredPesananItems" :key="pesanan.id" class="col-md-6 col-lg-4">
          
          <div class="card h-100 shadow-sm border-0 rounded-3 overflow-hidden" 
               :class="{ 
                   'border-start border-5 border-warning': pesanan.is_new && currentTab !== 'dibatalkan',
                   'opacity-75': currentTab === 'dibatalkan' 
               }">
            
            <div class="card-header bg-white border-bottom-0 pt-3 d-flex justify-content-between align-items-start">
              <div style="width: 60%">
                <div class="fw-bold text-primary fs-5 text-truncate">{{ pesanan.kode_pesanan }}</div>
                <div class="text-muted small text-truncate">
                    <i class="bi bi-person-fill"></i> {{ pesanan?.nama_pembeli_snapshot || 'Pelanggan' }}
                </div>
              </div>
              <div class="text-end" style="width: 40%">
                  <div class="badge bg-light text-secondary border mb-1">
                      {{ new Date(pesanan.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) }}
                  </div>
                  <div class="badge border w-100" 
                       :class="isDigitalPayment(pesanan) ? 'bg-info bg-opacity-10 text-info border-info' : 'bg-success bg-opacity-10 text-success border-success'">
                      {{ isDigitalPayment(pesanan) ? 'E-MONEY' : 'TUNAI' }}
                  </div>
              </div>
            </div>
            
            <div class="card-body py-2">
              <ul class="list-group list-group-flush">
                <li v-for="detail in pesanan.detail_pesanans" :key="detail.id" class="list-group-item px-0 border-bottom-0 py-1">
                  <div class="d-flex gap-2">
                      <span class="badge bg-secondary rounded-1 align-self-start mt-1">{{ detail.jumlah }}x</span>
                      <div>
                        <span class="fw-bold text-dark d-block lh-sm">{{ detail.menu_item?.nama }}</span>
                        <div v-if="detail.catatan" class="text-danger small fst-italic mt-1">
                          <i class="bi bi-pencil me-1"></i>{{ detail.catatan }}
                        </div>
                      </div>
                  </div>
                </li>
              </ul>
            </div>

            <div class="card-footer bg-white border-top pb-3 pt-0">
              <div class="d-flex justify-content-between align-items-center mb-3 mt-2 pt-2 border-top">
                <span class="text-muted small">Total</span>
                <span class="fs-5 fw-bold text-dark">Rp {{ Number(pesanan.total_harga).toLocaleString('id-ID') }}</span>
              </div>

              <div v-if="currentTab === 'pending'">
                <button class="btn w-100 fw-bold py-2" 
                  :class="isDigitalPayment(pesanan) ? 'btn-secondary' : 'btn-success'"
                  :disabled="isDigitalPayment(pesanan)"
                  data-bs-toggle="modal" data-bs-target="#actionModal"
                  @click="!isDigitalPayment(pesanan) && openModal(
                    'Konfirmasi Pembayaran', 
                    `Terima pembayaran TUNAI senilai Rp ${Number(pesanan.total_harga).toLocaleString('id-ID')}?`, 
                    'Terima Uang', 'success', 
                    () => konfirmasiBayar(pesanan)
                  )">
                  <i v-if="isDigitalPayment(pesanan)" class="bi bi-hourglass-split me-1"></i>
                  <i v-else class="bi bi-cash-coin me-1"></i> 
                  {{ isDigitalPayment(pesanan) ? 'Menunggu Xendit...' : 'Terima Tunai' }}
                </button>
              </div>

              <div v-if="currentTab === 'diproses'">
                <button class="btn btn-primary w-100 fw-bold py-2 shadow-sm"
                  data-bs-toggle="modal" data-bs-target="#actionModal"
                  @click="openModal('Pesanan Selesai', `Pesanan siap disajikan?`, 'Selesaikan', 'primary', () => selesaikanPesanan(pesanan))">
                  <i class="bi bi-bell-fill me-1"></i> Panggil Pelanggan
                </button>
              </div>

               <div v-if="currentTab === 'dibatalkan'" class="text-center">
                   <div class="badge bg-danger w-100 py-2">DIBATALKAN / EXPIRED</div>
               </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <ModalConfirmation modalId="actionModal" :title="modalState.title" :message="modalState.message" 
      :confirmText="modalState.confirmText" :confirmVariant="modalState.variant" @onConfirm="executeAction" />
  </div>
</template>

<style scoped>
@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
.animate-pulse { animation: pulse 2s infinite; }

/* Custom Style untuk Tombol Tab agar lebih 'button-like' */
.btn {
  transition: all 0.2s ease-in-out;
}
.btn-outline-primary:hover, .btn-outline-warning:hover, 
.btn-outline-success:hover, .btn-outline-danger:hover {
  transform: translateY(-2px);
}
</style>