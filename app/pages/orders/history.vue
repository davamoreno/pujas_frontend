<script setup lang="ts">
import { useCustomerStore } from '~/stores/customer';

definePageMeta({
  layout: 'customer',
  middleware: 'customer-auth'
});

const config = useRuntimeConfig();
const customerStore = useCustomerStore();
const router = useRouter();

// Fetch Data History
// Kita kirim kode_sesi user ke backend
const { data: response, pending, error, refresh } = await useFetch<any>(`${config.public.apiHost}/api/public/orders/history`, {
  query: { kode_sesi: customerStore.sesi_kode },
  key: `history-${customerStore.sesi_kode}` // Key unik biar refresh kalau ganti sesi
});

const orders = computed(() => response.value?.data || []);

// Helper Format
const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// Status Color Helper
const getStatusColor = (status: string) => {
  switch(status) {
    case 'pending': return 'bg-warning text-dark';
    case 'diproses': return 'bg-info text-white';
    case 'siap_diambil': return 'bg-primary text-white';
    case 'selesai': return 'bg-success text-white';
    case 'dibatalkan': return 'bg-danger text-white';
    default: return 'bg-secondary text-white';
  }
};
</script>

<template>
  <div class="container py-4 pb-safe-area">
    <h4 class="fw-bold mb-4">Riwayat Pesanan</h4>

    <div v-if="pending" class="text-center py-5">
      <div class="spinner-border text-primary mb-2" role="status"></div>
      <p class="text-muted small">Memuat riwayat...</p>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-5 mt-4">
      <i class="bi bi-receipt fs-1 text-muted mb-3 d-block"></i>
      <h6 class="text-muted">Belum ada pesanan nih.</h6>
      <NuxtLink to="/tenants" class="btn btn-outline-primary rounded-pill mt-3">Pesan Sekarang</NuxtLink>
    </div>

    <div v-else class="d-flex flex-column gap-3">
      
      <div v-for="order in orders" :key="order.id" class="card border-0 shadow-sm rounded-4 overflow-hidden hover-card">
        <div class="card-body p-3" @click="router.push(`/orders/${order.kode_pesanan}`)" style="cursor: pointer;">
          
          <div class="d-flex justify-content-between align-items-center mb-3">
             <div class="d-flex align-items-center gap-2">
                <img :src="order.tenant?.gambar_url || 'https://placehold.co/50'" class="rounded-circle border" width="40" height="40">
                <div>
                   <h6 class="fw-bold mb-0 text-dark" style="font-size: 0.9rem;">{{ order.tenant?.nama }}</h6>
                   <div class="text-muted" style="font-size: 0.7rem;">{{ formatDate(order.created_at) }}</div>
                </div>
             </div>
             <span class="badge rounded-pill" :class="getStatusColor(order.status_pesanan)" style="font-size: 0.7rem;">
                {{ order.status_pesanan.toUpperCase() }}
             </span>
          </div>

          <div class="border-top border-bottom py-2 my-2 bg-light bg-opacity-50 px-2 rounded">
             <div v-for="(item, idx) in order.detail_pesanans.slice(0, 2)" :key="idx" class="d-flex justify-content-between small mb-1">
                <span class="text-muted">{{ item.jumlah }}x {{ item.menu_item?.nama }}</span>
             </div>
             <div v-if="order.detail_pesanans.length > 2" class="small text-muted fst-italic">
                + {{ order.detail_pesanans.length - 2 }} menu lainnya...
             </div>
          </div>

          <div class="d-flex justify-content-between align-items-center mt-2">
             <div>
                <div class="small text-muted">Total Bayar</div>
                <div class="fw-bold text-primary">{{ formatRupiah(order.total_harga) }}</div>
             </div>
             
             <button class="btn btn-sm btn-light rounded-pill px-3 fw-bold text-primary border">
                Detail
             </button>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.hover-card:active {
  transform: scale(0.98);
  transition: transform 0.1s;
}
.pb-safe-area {
  padding-bottom: 100px; /* Biar ga ketutup navbar bawah */
}
</style>