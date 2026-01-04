<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

const authStore = useAuthStore();
const config = useRuntimeConfig();

// --- STATE ---
// Filter Tanggal
const selectedMonth = ref(new Date().getMonth() + 1); // Default bulan ini
const selectedYear = ref(new Date().getFullYear());   // Default tahun ini

// Data
const { data: reportData, pending, refresh } = await useFetch<any[]>(`${config.public.apiHost}/api/dashboard/recap`, {
  headers: { 'Authorization': `Bearer ${authStore.token}` },
  query: computed(() => ({ 
      month: selectedMonth.value, 
      year: selectedYear.value 
  }))
});

// Options untuk Dropdown
const months = [
  { val: 1, label: 'Januari' }, { val: 2, label: 'Februari' }, { val: 3, label: 'Maret' },
  { val: 4, label: 'April' }, { val: 5, label: 'Mei' }, { val: 6, label: 'Juni' },
  { val: 7, label: 'Juli' }, { val: 8, label: 'Agustus' }, { val: 9, label: 'September' },
  { val: 10, label: 'Oktober' }, { val: 11, label: 'November' }, { val: 12, label: 'Desember' }
];

const years = [2024, 2025, 2026]; // Sesuaikan

// --- COMPUTED ---
// Hitung Total Omzet Pujasera Bulan Ini
const totalOmzetPujasera = computed(() => {
   return reportData.value?.reduce((acc, curr) => acc + curr.total_penjualan, 0) || 0;
});

// Cari Tenant Terbaik
const topTenant = computed(() => {
    if (!reportData.value || reportData.value.length === 0) return '-';
    // Sort desc by omzet, ambil yang pertama
    const sorted = [...reportData.value].sort((a, b) => b.total_penjualan - a.total_penjualan);
    return sorted[0].tenant_name;
});

// Helper Format Rupiah
const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

// Fungsi Cetak (Dummy/Browser Print)
const printReport = () => {
    window.print();
}
</script>

<template>
  <div class="container-fluid px-4">
    
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-4 gap-3 no-print">
      <div>
         <h2 class="fw-bold text-dark mb-0">Laporan Bulanan</h2>
         <p class="text-muted mb-0">Rekapitulasi performa seluruh tenant Pujasera.</p>
      </div>

      <div class="d-flex gap-2">
         <select v-model="selectedMonth" class="form-select shadow-sm" style="width: 140px;">
            <option v-for="m in months" :key="m.val" :value="m.val">{{ m.label }}</option>
         </select>
         
         <select v-model="selectedYear" class="form-select shadow-sm" style="width: 100px;">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
         </select>

         <button @click="printReport" class="btn btn-primary shadow-sm">
            <i class="bi bi-printer-fill me-1"></i> Cetak
         </button>
      </div>
    </div>

    <div class="row g-3 mb-4">
       <div class="col-md-6 col-xl-4">
          <div class="card border-0 shadow-sm h-100 bg-primary text-white bg-gradient">
             <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                   <div>
                      <h6 class="text-white-50 text-uppercase small ls-1 mb-1">Total Omzet (Bulan Ini)</h6>
                      <h3 class="fw-bold mb-0">{{ formatRupiah(totalOmzetPujasera) }}</h3>
                   </div>
                   <div class="bg-white bg-opacity-25 rounded p-2">
                      <i class="bi bi-wallet2 fs-4"></i>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <div class="col-md-6 col-xl-4">
          <div class="card border-0 shadow-sm h-100 bg-success text-white bg-gradient">
             <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                   <div>
                      <h6 class="text-white-50 text-uppercase small ls-1 mb-1">Tenant Terlaris</h6>
                      <h3 class="fw-bold mb-0">{{ topTenant }}</h3>
                   </div>
                   <div class="bg-white bg-opacity-25 rounded p-2">
                      <i class="bi bi-trophy-fill fs-4"></i>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>

    <div class="card border-0 shadow-sm mb-4">
       <div class="card-header bg-white py-3">
          <h6 class="mb-0 fw-bold"><i class="bi bi-table me-2"></i>Detail Per Tenant</h6>
       </div>
       <div class="card-body p-0">
          <div class="table-responsive">
             <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                   <tr>
                      <th class="ps-4 py-3">Nama Tenant</th>
                      <th class="py-3">Menu Terlaris</th>
                      <th class="py-3 text-center">Item Terjual</th>
                      <th class="pe-4 py-3 text-end">Total Pendapatan</th>
                   </tr>
                </thead>
                <tbody>
                   <tr v-if="pending">
                      <td colspan="4" class="text-center py-5">
                         <div class="spinner-border text-primary" role="status"></div>
                         <p class="text-muted mt-2 mb-0">Memuat data laporan...</p>
                      </td>
                   </tr>

                   <tr v-else-if="!reportData || reportData.length === 0">
                      <td colspan="4" class="text-center py-5 text-muted">
                         <i class="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
                         Belum ada data transaksi di periode ini.
                      </td>
                   </tr>

                   <tr v-else v-for="(row, idx) in reportData" :key="idx">
                      <td class="ps-4 fw-bold text-primary">{{ row.tenant_name }}</td>
                      <td>
                         <span class="fw-semibold text-dark">{{ row.menu_populer }}</span>
                         <div class="small text-muted">{{ formatRupiah(row.harga_menu) }}</div>
                      </td>
                      <td class="text-center">
                         <span class="badge bg-secondary bg-opacity-10 text-secondary border">
                            {{ row.terjual }} porsi
                         </span>
                      </td>
                      <td class="pe-4 text-end fw-bold text-success fs-6">
                         {{ formatRupiah(row.total_penjualan) }}
                      </td>
                   </tr>
                </tbody>
             </table>
          </div>
       </div>
    </div>

  </div>
</template>

<style scoped>
/* CSS Khusus Print agar tampilan bersih saat dicetak */
@media print {
  .no-print {
    display: none !important;
  }
  .app-sidebar {
    display: none;
  }
  .app-main {
    margin-left: 0 !important;
    padding: 0 !important;
  }
  .card {
    border: 1px solid #ddd !important;
    box-shadow: none !important;
  }
}
</style>