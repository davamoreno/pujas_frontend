<script setup lang="ts">
import type { DashboardStats } from '~/types/api/dashboardstats';

// Terima data dari Parent via Props
defineProps<{
  stats: DashboardStats | null;
  loading: boolean;
}>();

// Helper Rupiah
const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};
</script>

<template>
  <div>
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="stats">
      <div class="row">
        <div class="col-md-4 mb-4">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <div class="card-title text-muted mb-1">Total Menu</div>
                <div class="h2 fw-bold mb-0">{{ stats.total_menu_items }}</div>
              </div>
              <div class="icon-box bg-primary bg-opacity-10 text-primary rounded-3 p-3">
                <i class="bi bi-grid-fill fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <div class="card-title text-muted mb-1">Tenant</div>
                <div class="h2 fw-bold mb-0">{{ stats.total_tenants }}</div>
              </div>
              <div class="icon-box bg-warning bg-opacity-10 text-warning rounded-3 p-3">
                <i class="bi bi-shop fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <div class="card-title text-muted mb-1">Total Transaksi</div>
                <div class="h2 fw-bold mb-0">{{ stats.total_transactions }}</div>
              </div>
              <div class="icon-box bg-success bg-opacity-10 text-success rounded-3 p-3">
                <i class="bi bi-receipt fs-3"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col">
          <div class="card shadow-sm border-0">
            <div class="card-body p-4">
              <div class="card-title text-muted mb-2">Total Penjualan (Lunas)</div>
              <div class="display-5 fw-bold text-success">
                {{ formatRupiah(stats.total_income) }} 
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
}
</style>