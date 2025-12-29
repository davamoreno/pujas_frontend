<template>
  <div class="bg-white rounded shadow-sm d-none d-md-block">
    <div class="card-body table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th class="py-3 px-4" style="width:30%;">Nama Tenant</th>
            <th class="py-3 px-4" style="width:25%;">Pemilik Tenant (Staff)</th>
            <th class="py-3 px-4" style="width:20%;">Pendapatan Bulanan</th>
            <th class="py-3 px-4" style="width:25%;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tenant in tenants" :key="tenant.id">
            <td class="py-3 px-4">{{ tenant.nama }}</td>
            <td class="py-3 px-4">{{ tenant.staff?.nama ?? 'N/A' }}</td>
            <td class="py-3 px-4">Rp2.100.000</td>
            <td class="py-3 px-4">
              <slot name="actions" :tenant="tenant" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <slot name="footer" />
  </div>
</template>

<script setup lang="ts">
import type { Tenant } from '~/types/api/tenant';
const props = defineProps<{ tenants: Tenant[] }>();
</script>

<style scoped>
.table { vertical-align: middle; }
.table thead th { color: #6c757d; font-weight: 600; }
</style>
