<script setup lang="ts">
import type { Staff } from '~/types/api/staff';
import type { PaginatedResponse } from '~/types/api/pagination';
// 1. Terapkan Layout dan Middleware
definePageMeta({
  layout: 'admin',
  middleware: 'admin' // Hanya Admin yang boleh
});

// 2. Siapkan state
const authStore = useAuthStore();
const config = useRuntimeConfig();
const page = ref(1);
const search = ref('');
const searchInput = ref('');
const sortBy = ref('id');
const sortDir = ref('asc');

// 3. Panggil API
const { data: staffList, pending, error } = await useFetch<PaginatedResponse<Staff>>(
  () => {
    const params = new URLSearchParams();
    params.append('page', page.value.toString());

    if (search.value) {
      params.append('search', search.value);
    }
    params.append('sort_by', sortBy.value);
    params.append('sort_dir', sortDir.value);

    return `${config.public.apiHost}/api/staff?${params.toString()}`;
  }, 
  {
    lazy: true,
    // 4. Gunakan 'onRequest' untuk melampirkan token
    onRequest({ request, options }) {
      if (authStore.token) {
        options.headers = new Headers(options.headers);
        options.headers.set('Authorization', `Bearer ${authStore.token}`);
        options.headers.set('Accept', 'application/json');
      }
    },
    onResponseError({ request, response, options }) {
      if (response.status === 401) {
        // Token mungkin sudah tidak valid, redirect ke halaman login
        authStore.logout();
      }
    }
  }
);
  
const staffData = computed(() => {
  return staffList.value?.data || [];
});

const staffDataStore = computed(() => authStore.user);

function applySearch() {
  search.value = searchInput.value;
  page.value = 1; // Reset ke halaman pertama saat mencari
}

function changePage(newPage : number){
  page.value = newPage;
}

function changePageByUrl(url: string | null) {
  if (!url) return;
  try{
    const urlObj = new URL(url);
    const pageParam = urlObj.searchParams.get('page');
    if (pageParam) {
      page.value = parseInt(pageParam);
    }
  } catch (e) {
    console.error('Invalid URL:', e);
  }
}

</script>

<template>
  <div>
   <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Manajemen Staff</h1>
      <NuxtLink 
        v-if="staffDataStore?.role === 'Admin'" 
        to="/admin/staffs/create" 
        class="btn btn-primary"
      >
        <i class="bi bi-plus-circle"></i> 
        <span class="d-none d-md-inline ms-1">Tambah Admin/Pemilik Tenant</span>
      </NuxtLink>
    </div>

   <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-md-5">
            <div class="row">
              <div class="col-auto">
                <label for="sort_by" class="col-form-label">Urutkan:</label>
              </div>
              <div class="col">
                <select v-model="sortBy" class="form-select">
                  <option value="id">ID</option>
                  <option value="nama">Nama</option>
                  <option value="created_at">Terakhir Dibuat</option>
                </select>
              </div>
              <div class="col">
                <select v-model="sortDir" class="form-select">
                  <option value="asc">Ascending (A-Z)</option>
                  <option value="desc">Descending (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
          <div class="col-md-7">
            <div class="input-group">
              <input 
                type="text" 
                class="form-control" 
                placeholder="Cari nama tenant atau pemilik..." 
                v-model="searchInput"
                @keyup.enter="applySearch"
              >
              <button class="btn btn-outline-secondary" type="button" @click="applySearch">
                <i class="bi bi-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
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
              <tr v-for="staffs in staffData" :key="staffs.id">
                <th scope="row">{{ staffs.id }}</th>
                <td>{{ staffs.nama }}</td>
                <td>{{ staffs.username }}</td>
                <td>
                  <span class="badge" :class="staffs?.role?.nama === 'Admin' ? 'bg-danger' : 'bg-info'">
                    {{ staffs?.role?.nama }}
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
        <nav v-if="staffList && staffList.total > staffList.per_page" 
             class="card-footer d-flex justify-content-between align-items-center">
          <div>
            Menampilkan <strong>{{ staffList.from }}</strong> 
            - <strong>{{ staffList.to }}</strong> 
            dari <strong>{{ staffList.total }}</strong> data
          </div>
          <div class="btn-group">
            <button 
              class="btn btn-outline-secondary" 
              :disabled="!staffList.prev_page_url"
              @click="changePageByUrl(staffList.prev_page_url)"
            >
              <i class="bi bi-chevron-left"></i> Prev
            </button>
            <button 
              class="btn btn-outline-secondary" 
              :disabled="!staffList.next_page_url"
              @click="changePageByUrl(staffList.next_page_url)"
            >
              Next <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </nav>
      </div>
      
      <div class="d-block d-md-none">
        <div v-for="staff in staffData" :key="staff.id" class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">{{ staff.nama }}</h5>
            <div class="card-text mb-2">
              <strong>Username:</strong> {{ staff.username }}
            </div>
            <div class="mb-3">
              <strong>Peran:</strong>
              <span class="badge" :class="staff?.role?.nama === 'Admin' ? 'bg-danger' : 'bg-info'">
                {{ staff?.role?.nama }}
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