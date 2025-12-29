<template>
  <div class="d-block d-md-none">
    <div v-for="tenant in tenants" :key="tenant.id" class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">{{ tenant.nama }}</h5>
        <div class="card-text mb-2">
          <strong>Nama Pemilik:</strong> {{ tenant.staff?.nama ?? 'N/A' }}
        </div>
        <div class="mb-3">
          <strong>Pendapatan Bulanan:</strong>
          <div>Rp2.100.000</div>
        </div>
        <div class="d-flex gap-2">
          <slot name="actions" :tenant="tenant" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Tenant } from '~/types/api/tenant';
const props = defineProps<{ tenants: Tenant[] }>();
</script>

<style scoped>
.card-title { font-weight: 600; }
</style>
