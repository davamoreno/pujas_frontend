<script setup lang="ts">
import type { SalesRecap } from '~/types/api/salesrecap';

defineProps<{
  recapData: SalesRecap[] | null;
  loading: boolean;
}>();

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};
</script>

<template>
  <div class="card shadow-sm border-0 h-100">
    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
      <h5 class="mb-0 fw-bold">Rekap Penjualan</h5>
    </div>
    
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="py-3 ps-4">Bulan</th>
              <th class="py-3">Tenant</th>
              <th class="py-3">Menu Populer</th>
              <th class="py-3 pe-4 text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="4" class="text-center py-4">Loading...</td>
            </tr>
            <tr v-else-if="!recapData || recapData.length === 0">
              <td colspan="4" class="text-center py-4 text-muted">Belum ada data.</td>
            </tr>
            <tr v-else v-for="(item, index) in recapData" :key="index">
              <td class="py-3 ps-4">{{ item.bulan }}</td>
              <td>{{ item.tenant_name }}</td>
              <td>{{ item.menu_populer }}</td>
              <td class="fw-bold pe-4 text-end">{{ formatRupiah(item.total_penjualan) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>