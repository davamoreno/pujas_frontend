<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
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
const { $echo } = useNuxtApp();
const user = authStore.user;

const selectedFilter = ref('all');
const shopStatus = ref(user?.tenant?.status_operasional);
const isUpdatingStatus = ref(false);

const queryParams = computed(() => {
  if (selectedFilter.value === 'all') return {};
  const [month, year] = selectedFilter.value.split('-');
  return { month, year };
});

const { data: stats, refresh: refreshStats, pending: pendingStats } = await useFetch<DashboardStats>(
  `${config.public.apiHost}/api/dashboard/stats`, 
  {
    headers: { 'Authorization': `Bearer ${authStore.token}` },
    query: queryParams
  }
);

const { data: recapData, refresh: refreshRecap, pending: pendingRecap } = await useFetch<SalesRecap[]>(
  `${config.public.apiHost}/api/dashboard/recap`, 
  {
    headers: { 'Authorization': `Bearer ${authStore.token}` },
    query: queryParams
  }
);

const { data: monthOptions } = await useFetch<any[]>(
  `${config.public.apiHost}/api/dashboard/months`,
  { headers: { 'Authorization': `Bearer ${authStore.token}` } }
);

onMounted(() => {
  if (user?.role === 'Pemilik Tenant' && user.tenant) {
    const channelName = `tenant.${user.tenant.id}`;
    $echo.private(channelName)
      .listen('.PesananMasukUntukTenant', (event: any) => {
        refreshStats();
        refreshRecap();
        if (stats.value?.low_stock_items?.length) {
             toast.warning("Cek stok! Ada menu yang menipis.");
        }
      });
  }
});

async function changeShopStatus(newStatus: string) {
    isUpdatingStatus.value = true;
    try {
        await $fetch(`${config.public.apiHost}/api/tenant/status`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${authStore.token}` },
            body: { status_operasional: newStatus }
        });
        shopStatus.value = newStatus;
        await authStore.refreshUser();
        toast.success(`Toko sekarang ${newStatus.toUpperCase()}`);
    } catch (error) {
        toast.error('Gagal update status');
    } finally {
        isUpdatingStatus.value = false;
    }
}

const statusBadgeClass = computed(() => {
    switch (shopStatus.value) {
        case 'buka': return 'bg-success';
        case 'tutup': return 'bg-danger';
        case 'istirahat': return 'bg-warning text-dark';
        default: return 'bg-secondary';
    }
});

// Logic Chart: Pastikan data ada sebelum dirender
const chartLabels = computed(() => stats.value?.top_items?.map(i => i.nama) || []);
const chartValues = computed(() => stats.value?.top_items?.map(i => i.total_qty) || []);

</script>

<template>
  <div class="container-fluid px-2 px-md-4 py-3">

    <div class="row g-3 mb-4">
      <div class="col-12 col-lg-6">
        <h1 class="h3 fw-bold mb-1">Dashboard</h1>
        <p class="text-muted mb-0 small">Halo, {{ user?.nama }}! Semangat jualan hari ini.</p>
      </div>

      <div class="col-12 col-lg-6" v-if="user?.role === 'Pemilik Tenant'">
        <div class="card border shadow-sm">
           <div class="card-body p-2 p-md-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
               <div class="d-flex align-items-center justify-content-between justify-content-md-start w-100 w-md-auto">
                  <span class="small fw-bold text-muted me-2">STATUS TOKO:</span>
                  <span class="badge rounded-pill" :class="statusBadgeClass">{{ shopStatus?.toUpperCase() }}</span>
               </div>
               
               <div class="btn-group w-100 w-md-auto" role="group">
                 <button class="btn btn-sm btn-outline-success py-2 px-3" :class="{active: shopStatus === 'buka'}" @click="changeShopStatus('buka')">Buka</button>
                 <button class="btn btn-sm btn-outline-warning py-2 px-3" :class="{active: shopStatus === 'istirahat'}" @click="changeShopStatus('istirahat')">Istirahat</button>
                 <button class="btn btn-sm btn-outline-danger py-2 px-3" :class="{active: shopStatus === 'tutup'}" @click="changeShopStatus('tutup')">Tutup</button>
               </div>
           </div>
        </div>
      </div>
    </div>

    <transition name="fade">
        <div v-if="stats && stats.low_stock_items && stats.low_stock_items.length > 0" 
             class="alert alert-warning border-0 shadow-sm mb-4">
          <div class="d-flex flex-column flex-md-row align-items-start gap-3">
              <div class="bg-warning bg-opacity-25 rounded p-2 text-warning-emphasis d-inline-block">
                 <i class="bi bi-exclamation-triangle-fill fs-4"></i>
              </div>
              <div class="flex-grow-1 w-100">
                <h6 class="fw-bold text-warning-emphasis mb-1">Stok Menu Menipis!</h6>
                <p class="small text-muted mb-2">Segera lakukan restock agar tidak kehabisan.</p>
                
                <div class="d-flex flex-wrap gap-2">
                    <span v-for="item in stats.low_stock_items" :key="item.id" 
                          class="badge bg-white text-dark border border-warning shadow-sm">
                        {{ item.nama }} (Sisa: {{ item.qty }})
                    </span>
                </div>
              </div>
          </div>
        </div>
    </transition>

    <div class="d-flex justify-content-end mb-3">
        <div class="input-group input-group-sm" style="max-width: 250px; width: 100%;">
            <span class="input-group-text bg-white"><i class="bi bi-calendar3"></i></span>
            <select v-model="selectedFilter" class="form-select shadow-sm">
              <option value="all">Semua Waktu</option>
              <option v-for="(opt, index) in monthOptions" :key="index" :value="`${opt.value}-${opt.year}`">
                {{ opt.label }}
              </option>
            </select>
        </div>
    </div>

    <DashboardStatsCards 
      :stats="stats ?? null" 
      :loading="pendingStats"
      class="mb-4"
    />

    <div class="row g-4">
      <div class="col-12 col-lg-8 order-2 order-lg-1">
        <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white fw-bold py-3 border-bottom-0 d-flex align-items-center gap-2">
                <i class="bi bi-table text-primary"></i> Rekap Penjualan
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <DashboardRecapTable 
                      :recapData="recapData ?? null"
                      :loading="pendingRecap"
                    />
                </div>
            </div>
        </div>
      </div>

      <div class="col-12 col-lg-4 order-1 order-lg-2">
        <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white fw-bold py-3 border-bottom-0 d-flex align-items-center gap-2">
                <i class="bi bi-pie-chart-fill text-danger"></i> Menu Terlaris
            </div>
            <div class="card-body d-flex align-items-center justify-content-center" style="min-height: 300px;">
                <ClientOnly>
                  <div v-if="!pendingStats && chartLabels.length === 0" class="text-center text-muted">
                      <i class="bi bi-clipboard-data fs-1 d-block mb-2 opacity-50"></i>
                      <small>Belum ada data penjualan lunas</small>
                  </div>
                  
                  <DashboardSalesCharts
                    v-else
                    :labels="chartLabels"
                    :data="chartValues"
                    :loading="pendingStats"
                  />
                  
                  <template #fallback>
                    <div class="spinner-border text-secondary" role="status"></div>
                  </template>
                </ClientOnly>
            </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Transisi Halus */
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Responsive adjustments */
@media (max-width: 768px) {
  .btn-group {
    display: flex;
  }
  .btn-group .btn {
    flex: 1; /* Tombol status rata lebar di mobile */
  }
}
</style>