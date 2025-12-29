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

// Warna Badge Status Pesanan
const statusColor = (status: string) => {
  switch(status) {
    case 'pending': return 'bg-warning text-dark';
    case 'diproses': return 'bg-info text-white'; // Sedang dimasak
    case 'siap_diambil': return 'bg-primary'; // Siap diambil
    case 'selesai': return 'bg-success';
    case 'dibatalkan': return 'bg-danger';
    default: return 'bg-secondary';
  }
};

// Logic Bayar Ulang (Jika link ada & belum lunas)
function payNow() {
  if (order.value?.pembayaran?.checkout_link) { // Asumsi backend simpan link invoice
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
      
      <div class="card border-0 shadow-sm mb-4 bg-white">
        <div class="card-body text-center p-4">
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

      <div v-if="order.pembayaran?.status_pembayaran === 'pending' && order.pembayaran?.metode_pembayaran_id !== 1" class="alert alert-warning border-0 shadow-sm d-flex align-items-center justify-content-between mb-4">
        <div>
           <strong class="d-block"><i class="bi bi-exclamation-circle-fill me-1"></i> Menunggu Pembayaran</strong>
           <span class="small">Selesaikan pembayaran agar pesanan diproses.</span>
        </div>
        <button v-if="order.pembayaran?.external_id" @click="payNow" class="btn btn-warning btn-sm fw-bold shadow-sm text-nowrap ms-2">
           Bayar Sekarang
        </button>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white fw-bold py-3">Rincian Pesanan</div>
        <div class="card-body p-0">
          <ul class="list-group list-group-flush">
            <li v-for="item in order.detail_pesanans" :key="item.id" class="list-group-item p-3 d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center gap-3">
                 <div class="bg-light rounded p-2 text-center" style="width: 50px; height: 50px;">
                    <span class="fw-bold text-muted">{{ item.jumlah }}x</span>
                 </div>
                 <div>
                    <h6 class="mb-0 fw-bold">{{ item.menu_item?.nama }}</h6>
                    <small class="text-muted" v-if="item.catatan">Note: {{ item.catatan }}</small>
                 </div>
              </div>
              <span class="fw-bold">{{ formatRupiah(item.harga_saat_pesan * item.jumlah) }}</span>
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

      <div class="card border-0 shadow-sm mb-5">
        <div class="card-body d-flex align-items-center gap-3">
           <img :src="order.tenant?.gambar_url || 'https://placehold.co/50'" class="rounded-circle" width="50" height="50">
           <div>
              <h6 class="fw-bold mb-0">{{ order.tenant?.nama }}</h6>
              <p class="text-muted small mb-0">Lokasi: Kantin Pujasera</p>
           </div>
        </div>
      </div>

      <div class="fixed-bottom p-3 container text-center" style="max-width: 600px;">
         <NuxtLink to="/tenants" class="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow">
            Pesan Menu Lain
         </NuxtLink>
      </div>

    </div>
  </div>
</template>