<script setup lang="ts">
// 1. Terapkan Layout dan Middleware
definePageMeta({
  layout: 'admin',
  middleware: 'admin' // Hanya Admin yang boleh
});

// 2. Siapkan state
const authToken = useAuthToken();
const config = useRuntimeConfig();

// 3. Panggil API
const { data: staffList, pending, error } = await useFetch<any[]>(() => `${config.public.apiHost}/api/staff`, {
  lazy: true,
  // 4. Gunakan 'onRequest' untuk melampirkan token
  onRequest({ request, options }) {
    if (authToken.value) {
      options.headers = new Headers(options.headers);
      options.headers.set('Authorization', `Bearer ${authToken.value}`);
      options.headers.set('Accept', 'application/json');
    }
  }
});
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Manajemen Staff</h1>
      <nuxt-link to="/admin/add/staff" class="btn btn-primary">
        <i class="bi bi-plus-circle"></i> 
        <span class="d-none d-md-inline ms-1">Tambah Staff Baru</span>
      </nuxt-link>
    </div>

    <div v-if="pending" class="text-center p-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      Gagal memuat data staff: {{ error.message }}
    </div>

    <div v-else-if="staffList">
      
      <div class="card d-none d-md-block">
        <div class="card-body table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th scope="col">#ID</th>
                <th scope="col">Nama</th>
                <th scope="col">Username</th>
                <th scope="col">Peran (Role)</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="staff in staffList" :key="staff.id">
                <th scope="row">{{ staff.id }}</th>
                <td>{{ staff.nama }}</td>
                <td>{{ staff.username }}</td>
                <td>
                  <span class="badge" :class="staff.role.nama === 'Admin' ? 'bg-danger' : 'bg-info'">
                    {{ staff.role.nama }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-secondary me-2">
                    <i class="bi bi-pencil-fill"></i> Edit
                  </button>
                  <button class="btn btn-sm btn-outline-danger">
                    <i class="bi bi-trash-fill"></i> Hapus
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="d-block d-md-none">
        <div v-for="staff in staffList" :key="staff.id" class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">{{ staff.nama }}</h5>
            <div class="card-text mb-2">
              <strong>Username:</strong> {{ staff.username }}
            </div>
            <div class="mb-3">
              <strong>Peran:</strong>
              <span class="badge" :class="staff.role.nama === 'Admin' ? 'bg-danger' : 'bg-info'">
                {{ staff.role.nama }}
              </span>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-secondary w-100">
                <i class="bi bi-pencil-fill"></i> Edit
              </button>
              <button class="btn btn-sm btn-outline-danger w-100">
                <i class="bi bi-trash-fill"></i> Hapus
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
    
  </div>
</template>

<style scoped>
/* (Tidak perlu CSS tambahan, kita pakai Bootstrap semua) */
</style>