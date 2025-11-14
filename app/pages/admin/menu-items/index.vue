<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useRoute } from 'vue-router';

// 1. Terapkan Layout dan Middleware
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

// 2. Ambil state user (untuk cek role) dan token (untuk API call)
const authStore = useAuthStore();
const route = useRoute();
const config = useRuntimeConfig();

// Interface untuk Menu Item
interface MenuItem {
  id: number;
  nama: string;
  kategori: {
    nama: string;
  } | null;
  harga: number;
  qty: number;
  is_tersedia: boolean;
  gambar_url: string | null;
  tenant: {
    nama: string;
  } | null;
}

// Interface untuk response paginasi
interface paginatedResponse<MenuItem> {
  data: MenuItem[];
  meta: object;
  links: object;
}

// 3. Panggil API
const { data: paginatedData, pending, error, refresh } = await useFetch<paginatedResponse<MenuItem>>(() => {
    // Ini akan otomatis dijalankan ulang jika query berubah
    let url = `${config.public.apiHost}/api/menu-items`;
    
    // Ambil tenant_id dari URL query
    const tenantId = route.query.tenant_id;

    // Jika ada tenant_id, tambahkan ke URL
    if (tenantId) {
      url += `?tenant_id=${tenantId}`;
    }
    
    return url;
  }, 
  {
    // Jangan langsung panggil saat komponen dimuat
    lazy: true,
    onRequest({ request, options }) {
      if (authStore.token) {
        options.headers = new Headers(options.headers);
        options.headers.set('Authorization', `Bearer ${authStore.token}`);
        options.headers.set('Accept', 'application/json');
      }
    },
  });

// 4. Siapkan computed untuk daftar menu items
const menuItems = computed(() => paginatedData.value?.data || []);

// 5. Siapkan computed untuk user (cek role)
const user = computed(() => authStore.user);

// 6. Fungsi untuk menghapus menu item
async function handleDelete(id: number, nama: string) {
  // Konfirmasi dulu
  if (!confirm(`Apakah kamu yakin ingin menghapus "${nama}"?`)) {
    return;
  }

  try {
    // Panggil API DELETE
    await $fetch(`${config.public.apiHost}/api/menu-items/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json'
      }
    });

    // Jika berhasil, panggil 'refresh()'
    // Ini akan memanggil ulang 'useFetch' di atas dan memperbarui daftar
    refresh(); 
    
  } catch (err: any) {
    console.error(err);
    alert(`Gagal menghapus item: ${err.data?.message || 'Error server'}`);
  }
}
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Manajemen Menu Items</h1>
      <NuxtLink 
        v-if="user?.role === 'Admin' || user?.role === 'Pemilik Tenant'" 
        to="/menu-items/create" 
        class="btn btn-primary"
      >
        <i class="bi bi-plus-circle"></i> 
        <span class="d-none d-md-inline ms-1">Tambah Item Baru</span>
      </NuxtLink>
    </div>

    <div v-if="pending" class="text-center p-5">...</div>

    <div v-else-if="error" class="alert alert-danger">...</div>

    <div v-else-if="menuItems && menuItems.length > 0">
      
      <div class="card d-none d-md-block">
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
                  <NuxtLink 
                    :to="`/menu-items/${item.id}/edit`" 
                    class="btn btn-sm btn-outline-secondary me-2"
                  >
                    <i class="bi bi-pencil-fill"></i> Edit
                  </NuxtLink>
                  <button 
                    class="btn btn-sm btn-outline-danger" 
                    @click="handleDelete(item.id, item.nama)"
                  >
                    <i class="bi bi-trash-fill"></i> Hapus
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="d-block d-md-none">
        <div v-for="item in menuItems" :key="item.id" class="card mb-3">
          
          <div class="row g-0">
            <div class="col-4">
              <img :src="item.gambar_url || 'https://via.placeholder.com/150'" 
                   class="img-fluid rounded-start menu-item-img-mobile" 
                   alt="Gambar menu">
            </div>
            <div class="col-8">
              <div class="card-body py-3 px-3">
                <h5 class="card-title mb-1">{{ item.nama }}</h5>
                <p class="card-text mb-1">
                  <strong>Rp {{ Number(item.harga).toLocaleString('id-ID') }}</strong>
                </p>
                <p class="card-text mb-2">
                  <small class="text-muted">Stok: {{ item.qty }}</small>
                </p>
                <span :class="item.is_tersedia ? 'badge bg-success' : 'badge bg-secondary'">
                  {{ item.is_tersedia ? 'Tersedia' : 'Habis' }}
                </span>
                <p v-if="user?.role === 'Admin'" class="card-text mt-2 mb-0">
                  <small class="text-muted">Tenant: {{ item.tenant?.nama || 'N/A' }}</small>
                </p>
              </div>
            </div>
          </div>

          <div class="card-footer bg-white p-2 d-flex gap-2">
            <NuxtLink :to="`/menu-items/${item.id}/edit`" class="btn btn-sm btn-outline-secondary w-100">
              <i class="bi bi-pencil-fill"></i> Edit
            </NuxtLink>
            <button class="btn btn-sm btn-outline-danger w-100" @click="handleDelete(item.id, item.nama)">
              <i class="bi bi-trash-fill"></i> Hapus
            </button>
          </div>
        </div>
      </div>
      
    </div>

    <div v-else class="alert alert-info">...</div>
    
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