<script setup lang="ts">
// 1. Terapkan Layout dan Middleware
definePageMeta({
  layout: 'admin',
  middleware: 'admin' // <-- Gunakan middleware 'admin' baru kita
});

// 2. Siapkan state
const authToken = useAuthStore().token;
const config = useRuntimeConfig();

// 3. Panggil API (useFetch)
// useFetch akan otomatis berjalan di sisi server, lalu di klien
const { data: tenants, pending, error } = await useFetch<any[]>(() => `${config.public.apiHost}/api/tenant`, {
lazy: true,

  // --- INI PERBAIKANNYA ---
  // Gunakan 'onRequest' untuk menyisipkan token secara dinamis
  onRequest({ request, options }) {
    // Pastikan kita punya token sebelum melampirkannya
    if (authToken) {
      options.headers = new Headers(options.headers); // Buat header baru
      options.headers.set('Authorization', `Bearer ${authToken}`);
      options.headers.set('Accept', 'application/json');
    }
  }
});
</script>

<template>
<div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Manajemen Tenant</h1>
      <NuxtLink  to="/admin/add/tenant" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
        <span class="d-none d-md-inline">Tambah Tenant Baru</span>
      </NuxtLink>
    </div>

    <div v-if="pending" class="text-center p-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      Gagal memuat data tenants: {{ error.message }}
    </div>

    <div v-else-if="tenants" class="card">
        <div class="card d-none d-md-block">
            <div class="card-body table-responsive">
                <table class="table table-hover">
                    <thead>
                      <tr>
                        <th scope="col">#ID</th>
                        <th scope="col">Nama Tenant</th>
                        <th scope="col">Pemilik (Staff)</th>
                        <th scope="col">Status</th>
                        <th scope="col">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr v-for="tenant in tenants" :key="tenant.id">
                            <th scope="row">{{ tenant.id }}</th>
                            <td>{{ tenant.nama }}</td>
                            <td>{{ tenant.staff?.nama || 'N/A' }} ({{ tenant.staff?.role?.nama || 'N/A' }})</td>
                            <td>
                              <span :class="tenant.is_active ? 'badge bg-success' : 'badge bg-secondary'">
                                {{ tenant.is_active ? 'Aktif' : 'Tidak Aktif' }}
                              </span>
                            </td>
                            <td>
                            <button class="btn btn-sm btn-outline-secondary">Edit</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="d-block d-md-none">
        <div v-for="tenant in tenants" :key="tenant.id" class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">{{ tenant.nama }}</h5>
            <div class="card-text mb-2">
              <strong>Pemilik:</strong> {{ tenant.staff?.nama || 'N/A' }}
            </div>
            <div class="mb-3">
              <strong>Status:</strong>
              <span :class="tenant.is_active ? 'badge bg-success' : 'badge bg-secondary'">
                {{ tenant.is_active ? 'Aktif' : 'Tidak Aktif' }}
              </span>
            </div>
            <button class="btn btn-sm btn-outline-secondary w-100">
              <i class="bi bi-pencil-fill"></i> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table th, .table td {
  vertical-align: middle;
}
</style>