<script setup lang="ts">
// 1. Terapkan Layout dan Middleware
definePageMeta({
  layout: 'admin',
  middleware: 'auth' // Kita pakai 'auth' (bukan 'admin') karena Pemilik Toko juga boleh
});

// 2. Ambil state user (untuk cek role) dan token (untuk API call)
const user = useAuthStore().user;
const authToken = useAuthStore().token;
const config = useRuntimeConfig();

// 3. Panggil API
const { data: menuItems, pending, error } = await useFetch<any[]>(() => `${config.public.apiHost}/api/menu-items`, {
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Accept': 'application/json'
  },
  lazy: true
});
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Manajemen Menu Items</h1>
      <button v-if="user?.role !== 'Admin'" class="btn btn-primary">
        <i class="bi bi-plus-circle"></i> Tambah Item Baru
      </button>
    </div>

    <div v-if="pending" class="text-center p-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Memuat menu...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      Gagal memuat data menu: {{ error.message }}
    </div>

    <div v-else-if="menuItems" class="card">
      <div class="card-body table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th scope="col">Gambar</th>
              <th scope="col">Nama Item</th>
              <th scope="col">Kategori</th>
              <th scope="col">Harga</th>
              <th scope="col">Stok (Qty)</th>
              <th scope="col">Status</th>
              <th v-if="user?.role === 'Admin'" scope="col">Tenant</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in menuItems" :key="item.id">
              <td>
                <img :src="item.gambar_url || 'https://via.placeholder.com/100x100.png?text=No+Image'" 
                     alt="Gambar menu" 
                     class="menu-item-img">
              </td>
              <td>{{ item.nama }}</td>
              <td>{{ item.kategori?.nama || 'N/A' }}</td>
              <td>Rp {{ Number(item.harga).toLocaleString('id-ID') }}</td>
              <td>{{ item.qty }}</td>
              <td>
                <span :class="item.is_tersedia ? 'badge bg-success' : 'badge bg-secondary'">
                  {{ item.is_tersedia ? 'Tersedia' : 'Habis' }}
                </span>
              </td>
              <td v-if="user?.role === 'Admin'">
                {{ item.tenant?.nama || 'N/A' }}
              </td>
              <td>
                <button class="btn btn-sm btn-outline-secondary">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
  </div>
</template>

<style scoped>
.menu-item-img {
  width: 75px;
  height: 75px;
  object-fit: cover;
  border-radius: 0.25rem;
}
</style>