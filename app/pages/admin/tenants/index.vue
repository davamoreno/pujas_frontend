<script setup lang="ts">
// 1. Terapkan Layout dan Middleware
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});

// 2. Siapkan state
const authToken = useAuthStore().token;
const config = useRuntimeConfig();
const page = ref(1);
const search = ref('');
const searchInput = ref('');
const sortBy = ref('nama');
const sortDir = ref('asc');

// Interface untuk Tenant
interface Tenant {
  id: number;
  nama: string;
  staff: {
    id: number;
    nama: string;
    role: {
      nama: string;
    }
  } | null;
  gambar_url: string | null;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  total: number;
  per_page: number;
}

interface paginatedResponse<T> {
  data: Tenant[];
  current_page: number;
  from: number;
  to: number;
  total: number;
  per_page: number;
  last_page: number;
  prev_page_url: string | null;
  next_page_url: string | null;
  links: any[];
}

// 3. Panggil API (useFetch)
// useFetch akan otomatis berjalan di sisi server, lalu di klien
const { data: tenants, pending, error, refresh } = await useFetch<paginatedResponse<Tenant>>(
  () =>
  {
    const params = new URLSearchParams();
    params.append('page', page.value.toString());

    if (search.value) {
      params.append('search', search.value);
    }
    params.append('sort_by', sortBy.value);
    params.append('sort_dir', sortDir.value);
    return `${config.public.apiHost}/api/tenants?${params.toString()}`;
  },
  {
    lazy: true,
    onRequest({ request, options }) {
      if (authToken) {
        options.headers = new Headers(options.headers);
        options.headers.set('Authorization', `Bearer ${authToken}`);
        options.headers.set('Accept', 'application/json');
      }
    },
  });

console.log('tenants raw', tenants.value);

// Siapkan computed untuk daftar tenant
const tenantList = computed(() => tenants.value?.data || []);

console.log('tenant', tenantList.value);

function applySearch() {
  search.value = searchInput.value;
  page.value = 1; // Kembali ke halaman pertama saat melakukan pencarian
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
      <h1 class="h3">Kelola Tenant</h1>
      <NuxtLink to="/admin/tenants/create" class="btn btn-primary">
        <i class="bi bi-plus-lg me-1"></i> 
        <span class="d-none d-md-inline">Tambahkan</span>
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
                  <option value="nama">Nama</option>
                  <option value="id">ID</option>
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

    <div v-if="pending" class="text-center p-5">...</div>
    <div v-else-if="error" class="alert alert-danger">...</div>

<div v-else-if="tenantList.length > 0">
      
      <div class="bg-white rounded shadow-sm d-none d-md-block">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <tbody>
              <tr v-for="tenant in tenantList" :key="tenant.id">
                <td class="py-3 px-4">{{ tenant.nama }}</td>
                <td class="py-3 px-4">{{ tenant.staff?.nama || 'N/A' }}</td>
                <td class="py-3 px-4">Rp2.100.000</td> 
                <td class="py-3 px-4">
                  <NuxtLink :to="`/admin/tenants/${tenant.id}/edit`" class="btn btn-sm btn-outline-secondary me-2">
                    <i class="bi bi-pencil-fill"></i> Edit
                  </NuxtLink>
                  <button class="btn btn-sm btn-danger me-2">
                    <i class="bi bi-x-circle-fill"></i> Non Aktif
                  </button>
                  <NuxtLink :to="`/admin/menu-items?tenant_id=${tenant.id}`" class="btn btn-sm btn-outline-info me-2">
                    <i class="bi bi-info-circle-fill"></i> Detail
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <nav v-if="tenants && tenants.total > tenants.per_page" 
             class="card-footer d-flex justify-content-between align-items-center">
          <div>
            Menampilkan <strong>{{ tenants.from }}</strong> 
            - <strong>{{ tenants.to }}</strong> 
            dari <strong>{{ tenants.total }}</strong> data
          </div>
          <div class="btn-group">
            <button 
              class="btn btn-outline-secondary" 
              :disabled="!tenants.prev_page_url"
              @click="changePageByUrl(tenants.prev_page_url)"
            >
              <i class="bi bi-chevron-left"></i> Prev
            </button>
            <button 
              class="btn btn-outline-secondary" 
              :disabled="!tenants.next_page_url"
              @click="changePageByUrl(tenants.next_page_url)"
            >
              Next <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </nav>
      </div>
      
      <div class="d-block d-md-none">
        <div v-for="tenant in tenantList" :key="tenant.id" class="card mb-3 shadow-sm">
          </div>
        <nav v-if="tenants && tenants.total > tenants.per_page" 
             class="d-flex justify-content-center align-items-center mt-3">
          <div class="btn-group">
            <button 
              class="btn btn-outline-secondary" 
              :disabled="!tenants.prev_page_url"
              @click="changePageByUrl(tenants.prev_page_url)"
            >
              <i class="bi bi-chevron-left"></i> Prev
            </button>
            <button 
              class="btn btn-outline-secondary" 
              :disabled="!tenants.next_page_url"
              @click="changePageByUrl(tenants.next_page_url)"
            >
              Next <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </nav>
        <div class="text-center text-muted small mt-2">
          Halaman {{ tenants?.current_page }} dari {{ tenants?.last_page }}
        </div>
      </div>
    </div>
    
    <div v-else class="alert alert-info">
      <i class="bi bi-info-circle-fill me-2"></i>
      Tidak ada tenant yang cocok dengan pencarianmu.
    </div>

  </div>
</template>

<style scoped>
.table {
  vertical-align: middle;
}
.table thead th {
  color: #6c757d;
  font-weight: 600;
}
</style>