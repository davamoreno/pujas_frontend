<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
// Pastikan path types ini benar ada di folder proyekmu
import type { DashboardStats } from '~/types/api/dashboardstats';
import type { SalesRecap } from '~/types/api/salesrecap';
import { useToast } from 'vue-toastification';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

const authStore = useAuthStore();
const config = useRuntimeConfig();
const toast = useToast();
const user = authStore.user;
const selectedFilter = ref('all');

// Interface untuk Opsi Bulan
interface MonthOption {
  value: number;
  year: number;
  label: string;
}

const shopStatus = ref(user?.tenant?.status_operasional);
const isUpdatingStatus = ref(false);

const { data: monthOptions } = await useFetch<MonthOption[]>(
  `${config.public.apiHost}/api/dashboard/months`,
  {
    headers: { 'Authorization': `Bearer ${authStore.token}` }
  }
);

const queryParams = computed(() => {
  if (selectedFilter.value === 'all') {
    return {}; // Tidak kirim parameter apa-apa
  }
  const [month, year] = selectedFilter.value.split('-');
  return { month, year };
});

// 1. Fetch Stats (Kartu Atas)
const { data: stats, pending: pendingStats } = await useFetch<DashboardStats>(
  `${config.public.apiHost}/api/dashboard/stats`, 
  {
    lazy: true,
    headers: { 'Authorization': `Bearer ${authStore.token}` },
    query: queryParams
  }
);

// 2. Fetch Recap (Tabel Bawah)
const { data: recapData, pending: pendingRecap } = await useFetch<SalesRecap[]>(
  `${config.public.apiHost}/api/dashboard/recap`, 
  {
    lazy: true,
    headers: { 'Authorization': `Bearer ${authStore.token}` },
    query: queryParams
  }
);

async function changeShopStatus(newStatus: string) {
    isUpdatingStatus.value = true;
    try {
        await $fetch(`${config.public.apiHost}/api/tenant/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authStore.token}`,
                'Accept': 'application/json',
            },
            body: { status_operasional: newStatus }
        });
        shopStatus.value = newStatus;
        // refresh user store to reflect new status
        await authStore.refreshUser();
        shopStatus.value = authStore.user?.tenant?.status_operasional;
        toast.success(`Status toko berhasil diperbarui menjadi ${newStatus}`);
    } catch (error) {
        toast.error('Gagal memperbarui status toko');
    } finally {
        isUpdatingStatus.value = false;
    }
}

// 3. Data Chart (Nanti bisa diambil dari API juga)
// Sementara kita hardcode di sini atau ambil dari stats jika backend sudah support
const chartLabels = ['Makanan', 'Minuman'];
const chartValues = [30, 15]; // Contoh: 30 Makanan, 15 Minuman
const statusBadgeClass = computed(() => {
    switch (shopStatus.value) {
        case 'buka':
            return 'badge bg-success';
        case 'tutup':
            return 'badge bg-danger';
        case 'istirahat':
            return 'badge bg-warning text-dark';
        case 'sibuk':
            return 'badge bg-primary';
        case 'tutup-permanent':
            return 'badge bg-info text-dark';
        default:
            return 'badge bg-secondary';
    }
});

console.log('Operasional status:', shopStatus.value);
console.log("FULL USER:", JSON.stringify(user, null, 2));

</script>

<template>
  <div class="container-fluid">

    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
        <div>
          <h1 class="h3 fw-bold mb-1">Dashboard</h1>
          <p class="text-muted mb-2 mb-md-0">Selamat datang kembali, {{ user?.nama }}!</p>
        </div>

        <!-- Status -->
        <div 
          v-if="user?.role === 'Pemilik Tenant'"
          class="d-flex flex-column flex-sm-row align-items-sm-center gap-2 bg-white p-3 rounded shadow-sm border mt-3 mt-md-0"
        >
          <div class="d-flex align-items-center">
            <span class="small fw-semibold text-muted me-2">Status:</span>
            <span class="badge px-3 py-2 fs-6" :class="statusBadgeClass">
              {{ shopStatus }}
            </span>
          </div>

          <div class="btn-group btn-group-sm w-100 w-sm-auto">
            <button 
              class="btn btn-outline-success"
              :class="{ active: shopStatus === 'buka' }"
              @click="changeShopStatus('buka')"
              :disabled="isUpdatingStatus"
            >
              Buka
            </button>

            <button 
              class="btn btn-outline-warning"
              :class="{ active: shopStatus === 'istirahat' }"
              @click="changeShopStatus('istirahat')"
              :disabled="isUpdatingStatus"
            >
              Istirahat
            </button>

            <button 
              class="btn btn-outline-danger"
              :class="{ active: shopStatus === 'tutup' }"
              @click="changeShopStatus('tutup')"
              :disabled="isUpdatingStatus"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Alert -->
    <div 
      v-if="stats && stats.low_stock_items?.length > 0"
      class="alert alert-warning d-flex align-items-start shadow-sm border-warning"
    >
      <i class="bi bi-exclamation-triangle-fill fs-3 me-3"></i>
      <div>
        <h6 class="fw-bold mb-1">Perhatian: Stok Menipis!</h6>
        <p class="mb-1 small">Beberapa menu Anda hampir habis. Segera lakukan restock:</p>
        <ul class="small mb-0">
          <li v-for="item in stats.low_stock_items" :key="item.nama">
            <strong>{{ item.nama }}</strong> (Sisa: {{ item.qty }})
          </li>
        </ul>
      </div>
    </div>

    <!-- Filter Periode -->
    <div class="mb-3">
      <div class="d-flex align-items-center flex-wrap gap-2">
        <label class="small text-muted">Periode:</label>
        <select v-model="selectedFilter" class="form-select form-select-sm" style="width: 220px;">
          <option value="all">Semua Waktu</option>
          <option
            v-for="(opt, index) in monthOptions"
            :key="index"
            :value="`${opt.value}-${opt.year}`"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Stats -->
    <DashboardStatsCards 
      :stats="stats ?? null" 
      :loading="pendingStats"
      class="mb-4"
    />

    <!-- Recap + Chart -->
    <div class="row">
      <div class="col-lg-8 mb-4">
        <DashboardRecapTable 
          :recapData="recapData ?? null"
          :loading="pendingRecap"
        />
      </div>

      <div class="col-lg-4 mb-4">
        <ClientOnly>
          <DashboardSalesCharts
            :labels="chartLabels"
            :data="chartValues"
            :loading="pendingStats"
          />
          <template #fallback>
            <div class="card h-100 d-flex align-items-center justify-content-center text-muted">
              Loading Chart...
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>

  </div>
</template>