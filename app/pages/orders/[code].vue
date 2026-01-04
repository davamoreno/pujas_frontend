<script setup lang="ts">
import { useCustomerStore } from '~/stores/customer';

definePageMeta({
  layout: 'customer',
  middleware: 'customer-auth'
});

const route = useRoute();
const config = useRuntimeConfig();
const orderCode = route.params.code as string;

// --- 1. FETCH DATA ---
const { data: response, pending, error, refresh } = await useFetch<any>(`${config.public.apiHost}/api/public/orders/${orderCode}`);

const order = computed(() => response.value?.data || null);

// --- 2. HELPERS ---
const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// Helper khusus jam (misal: 14:30)
const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

// Warna Badge Status Pesanan
const statusColor = (status: string) => {
  switch(status) {
    case 'pending': return 'bg-warning text-dark';
    case 'diproses': return 'bg-info text-white'; 
    case 'siap_diambil': return 'bg-primary'; 
    case 'selesai': return 'bg-success';
    case 'dibatalkan': return 'bg-danger';
    default: return 'bg-secondary';
  }
};

// Logic Bayar Ulang
function payNow() {
  if (order.value?.pembayaran?.checkout_link) { 
     window.location.href = order.value.pembayaran.checkout_link;
  } else {
     alert("Link pembayaran tidak tersedia. Silakan hubungi kasir.");
  }
}
</script>

<template>
  <div class="container py-4 pb-5">
    
    <div v-if="pending" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Memuat status pesanan...</p>
    </div>

    <div v-else-if="error || !order" class="text-center py-5">
      <i class="bi bi-x-circle text-danger fs-1"></i>
      <h4 class="mt-3">Pesanan Tidak Ditemukan</h4>
      <p class="text-muted">Kode pesanan salah atau data sudah dihapus.</p>
      <NuxtLink to="/tenants" class="btn btn-outline-primary">Kembali ke Menu</NuxtLink>
    </div>

    <div v-else>
      
      <div class="card border-0 shadow-sm mb-3 bg-white text-center">
        <div class="card-body p-4">
          <h6 class="text-muted text-uppercase small ls-1 mb-2">Kode Pesanan</h6>
          <h1 class="fw-bold text-primary mb-3 display-4">{{ order.kode_pesanan }}</h1>
          
          <div class="d-flex justify-content-center gap-2 mb-3">
            <span class="badge rounded-pill px-3 py-2 fs-6" :class="statusColor(order.status_pesanan)">
              {{ order.status_pesanan.toUpperCase() }}
            </span>
          </div>

          <p class="text-muted small mb-0">Dipesan pada: {{ formatDate(order.created_at) }}</p>
          
          <button @click="refresh" class="btn btn-sm btn-light mt-3 rounded-pill text-muted">
            <i class="bi bi-arrow-clockwise me-1"></i> Refresh Status
          </button>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body d-flex align-items-center gap-3 py-3">
           <img :src="order.tenant?.gambar_url || 'https://placehold.co/50'" class="rounded-circle border" width="50" height="50">
           <div class="flex-grow-1">
              <small class="text-muted">Pesanan dari:</small>
              <h6 class="fw-bold mb-0 text-primary">{{ order.tenant?.nama }}</h6>
           </div>
           <NuxtLink :to="`/tenants/${order.tenant?.id}`" class="btn btn-sm btn-outline-secondary rounded-pill">
              <i class="bi bi-shop"></i>
           </NuxtLink>
        </div>
      </div>

      <div v-if="order.pembayaran?.status_pembayaran === 'pending' && order.pembayaran?.metode_pembayaran_id !== 1" 
           class="alert alert-warning border-0 shadow-sm mb-4">
        
        <div class="d-flex align-items-center justify-content-between">
            <div>
               <strong class="d-block"><i class="bi bi-exclamation-circle-fill me-1"></i> Menunggu Pembayaran</strong>
               <div v-if="order.pembayaran?.xendit_expires_at" class="text-danger small mt-1">
                  Batas Bayar: <strong>{{ formatTime(order.pembayaran.xendit_expires_at) }}</strong> 
                  ({{ formatDate(order.pembayaran.xendit_expires_at) }})
               </div>
            </div>
            <button v-if="order.pembayaran?.external_id" @click="payNow" class="btn btn-warning btn-sm fw-bold shadow-sm text-nowrap ms-2">
               Bayar Sekarang
            </button>
        </div>
      </div>
      
      <div v-else-if="order.pembayaran?.status_pembayaran === 'pending'" class="alert alert-info border-0 shadow-sm mb-4">
         <div class="d-flex gap-2">
            <i class="bi bi-cash-coin fs-4"></i>
            <div>
                <strong>Bayar Tunai di Kasir</strong>
                <p class="mb-0 small">Silakan menuju kasir <b>{{ order.tenant?.nama }}</b> dan tunjukkan kode pesanan di atas.</p>
                <p class="mb-0 small">Sebelum jam {{ formatTime(order.pembayaran.expires_at) }}</p>
            </div>
         </div>
      </div>

      <div class="card border-0 shadow-sm mb-5">
        <div class="card-header bg-white fw-bold py-3">Rincian Menu</div>
        <div class="card-body p-0">
          <ul class="list-group list-group-flush">
            <li v-for="item in order.detail_pesanans" :key="item.id" class="list-group-item p-3 d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center gap-3">
                 <div class="bg-light rounded p-2 text-center d-flex align-items-center justify-content-center" style="width: 45px; height: 45px;">
                    <span class="fw-bold text-dark">{{ item.jumlah }}x</span>
                 </div>
                 <div>
                    <h6 class="mb-0 fw-bold text-dark">{{ item.menu_item?.nama }}</h6>
                    <small class="text-danger fst-italic" v-if="item.catatan">Note: {{ item.catatan }}</small>
                 </div>
              </div>
              <span class="fw-bold text-muted">{{ formatRupiah(item.harga_saat_pesan * item.jumlah) }}</span>
            </li>
          </ul>
        </div>
        <div class="card-footer bg-light p-3">
           <div class="d-flex justify-content-between fw-bold fs-5">
              <span>Total</span>
              <span class="text-primary">{{ formatRupiah(order.total_harga) }}</span>
           </div>
        </div>
      </div>

      <div class="container text-center" style="max-width: 600px;">
         <NuxtLink to="/tenants" class="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow">
            Pesan Menu Lain
         </NuxtLink>
      </div>

    </div>
  </div>
</template>